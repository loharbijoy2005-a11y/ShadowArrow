package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"shadow-arrow-backend/config"
	"shadow-arrow-backend/db"
	"shadow-arrow-backend/models"
	"shadow-arrow-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type PhoneLoginPayload struct {
	Name  string `json:"name"`
	Phone string `json:"phone" binding:"required"`
	Email string `json:"email"`
}

// mergeUserProfiles merges the secondary user account into the primary user account.
// It combines coin balances, merges addresses, retains the highest tier, and deletes the secondary profile.
func mergeUserProfiles(ctx context.Context, collection *mongo.Collection, primary *models.UserProfile, secondary *models.UserProfile) (*models.UserProfile, error) {
	now := time.Now()

	if primary.UID == "" {
		primary.UID = secondary.UID
	}
	if primary.Email == "" {
		primary.Email = secondary.Email
	}
	if primary.Name == "" {
		primary.Name = secondary.Name
	}
	if primary.PhotoURL == "" {
		primary.PhotoURL = secondary.PhotoURL
	}

	primary.CoinBalance += secondary.CoinBalance

	// Merge unique addresses
	seen := make(map[string]bool)
	mergedAddresses := []models.SavedAddress{}
	for _, a := range primary.Addresses {
		if a.ID != "" && !seen[a.ID] {
			seen[a.ID] = true
			mergedAddresses = append(mergedAddresses, a)
		}
	}
	for _, a := range secondary.Addresses {
		if a.ID != "" && !seen[a.ID] {
			seen[a.ID] = true
			mergedAddresses = append(mergedAddresses, a)
		}
	}
	primary.Addresses = mergedAddresses

	// Retain the highest loyalty tier
	highestTier := "SILVER"
	if primary.Tier.CurrentTier == "PLATINUM" || secondary.Tier.CurrentTier == "PLATINUM" {
		highestTier = "PLATINUM"
	} else if primary.Tier.CurrentTier == "GOLD" || secondary.Tier.CurrentTier == "GOLD" {
		highestTier = "GOLD"
	}
	primary.Tier.CurrentTier = highestTier
	if primary.Tier.LastEvaluatedAt == nil {
		primary.Tier.LastEvaluatedAt = secondary.Tier.LastEvaluatedAt
	}

	// Merge soft deletion flags
	primary.DeletionRequested = primary.DeletionRequested || secondary.DeletionRequested
	if !primary.DeletionRequested && secondary.DeletionRequested {
		primary.DeletionRequestedAt = secondary.DeletionRequestedAt
		primary.DeletionReason = secondary.DeletionReason
	}

	primary.UpdatedAt = now

	// Update the primary account
	_, err := collection.UpdateOne(ctx, bson.M{"_id": primary.ID}, bson.M{"$set": bson.M{
		"uid":                   primary.UID,
		"email":                 primary.Email,
		"name":                  primary.Name,
		"photo_url":             primary.PhotoURL,
		"addresses":             primary.Addresses,
		"coin_balance":          primary.CoinBalance,
		"tier":                  primary.Tier,
		"deletion_requested":    primary.DeletionRequested,
		"deletion_requested_at": primary.DeletionRequestedAt,
		"deletion_reason":       primary.DeletionReason,
		"updated_at":            primary.UpdatedAt,
	}})
	if err != nil {
		return nil, err
	}

	// Delete the secondary account
	_, err = collection.DeleteOne(ctx, bson.M{"_id": secondary.ID})
	if err != nil {
		return nil, err
	}

	return primary, nil
}

func GoogleSync(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var payload models.UserProfile
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if payload.Email == "" && payload.UID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Google email or UID required"})
			return
		}

		collection := db.GetCollection("users")
		now := time.Now()

		// 1. Search for existing Google user by Email or UID
		var emailUser models.UserProfile
		emailUserFound := false
		emailConditions := []bson.M{}
		if payload.Email != "" {
			emailConditions = append(emailConditions, bson.M{"email": payload.Email})
		}
		if payload.UID != "" {
			emailConditions = append(emailConditions, bson.M{"uid": payload.UID})
		}
		if len(emailConditions) > 0 {
			if err := collection.FindOne(ctx, bson.M{"$or": emailConditions}).Decode(&emailUser); err == nil {
				emailUserFound = true
			}
		}

		// 2. Search for existing Phone user by normalized phone number
		var phoneUser models.UserProfile
		phoneUserFound := false
		cleanP := CleanPhoneDigits(payload.Phone)
		if cleanP != "" {
			phoneFilter := bson.M{"phone": bson.M{"$regex": primitive.Regex{Pattern: cleanP, Options: "i"}}}
			if err := collection.FindOne(ctx, phoneFilter).Decode(&phoneUser); err == nil {
				phoneUserFound = true
			}
		}

		if phoneUserFound {
			// If phoneUser already has a UID and it's different from the payload's UID, it's owned by another Google user.
			if phoneUser.UID != "" && phoneUser.UID != payload.UID {
				c.JSON(http.StatusConflict, gin.H{"error": "This phone number is already linked to another Google account"})
				return
			}
			// If phoneUser has a non-fallback email that is different from the payload's email
			if phoneUser.Email != "" && !strings.HasSuffix(phoneUser.Email, "@shadowarrow.com") && phoneUser.Email != payload.Email {
				c.JSON(http.StatusConflict, gin.H{"error": "This phone number is already linked to another account"})
				return
			}
		}

		// Case 1: Neither exists -> Create new user profile
		if !emailUserFound && !phoneUserFound {
			payload.UpdatedAt = now
			if payload.Addresses == nil {
				payload.Addresses = []models.SavedAddress{}
			}
			if payload.Tier.CurrentTier == "" {
				payload.Tier.CurrentTier = "SILVER"
			}
			res, err := collection.InsertOne(ctx, payload)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user profile"})
				return
			}
			var result models.UserProfile
			_ = collection.FindOne(ctx, bson.M{"_id": res.InsertedID}).Decode(&result)
			token, err := utils.GenerateCustomerJWT(result.ID.Hex(), result.Email, result.Phone, cfg.JWTSecret)
			if err == nil {
				result.Token = token
			}
			c.JSON(http.StatusCreated, result)
			return
		}

		// Case 4: Both exist and they are different documents -> Merge them!
		if emailUserFound && phoneUserFound && emailUser.ID != phoneUser.ID {
			merged, err := mergeUserProfiles(ctx, collection, &phoneUser, &emailUser)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to merge user profiles"})
				return
			}
			token, err := utils.GenerateCustomerJWT(merged.ID.Hex(), merged.Email, merged.Phone, cfg.JWTSecret)
			if err == nil {
				merged.Token = token
			}
			c.JSON(http.StatusOK, merged)
			return
		}

		// Case 2: Only emailUser exists OR both exist and are the same document
		if emailUserFound {
			// Update emailUser with payload details
			updateFields := bson.M{
				"updated_at": now,
			}
			if payload.UID != "" {
				updateFields["uid"] = payload.UID
			}
			if payload.Name != "" {
				updateFields["name"] = payload.Name
			}
			if payload.Email != "" {
				updateFields["email"] = payload.Email
			}
			if payload.PhotoURL != "" {
				updateFields["photo_url"] = payload.PhotoURL
			}
			if payload.Phone != "" {
				updateFields["phone"] = payload.Phone
			}

			_, _ = collection.UpdateOne(ctx, bson.M{"_id": emailUser.ID}, bson.M{"$set": updateFields})
			var result models.UserProfile
			_ = collection.FindOne(ctx, bson.M{"_id": emailUser.ID}).Decode(&result)
			token, err := utils.GenerateCustomerJWT(result.ID.Hex(), result.Email, result.Phone, cfg.JWTSecret)
			if err == nil {
				result.Token = token
			}
			c.JSON(http.StatusOK, result)
			return
		}

		// Case 3: Only phoneUser exists
		if phoneUserFound {
			// Update phoneUser with Google credentials
			updateFields := bson.M{
				"updated_at": now,
			}
			if payload.UID != "" {
				updateFields["uid"] = payload.UID
			}
			if payload.Name != "" && phoneUser.Name == "" {
				updateFields["name"] = payload.Name
			}
			if payload.Email != "" && phoneUser.Email == "" {
				updateFields["email"] = payload.Email
			}
			if payload.PhotoURL != "" && phoneUser.PhotoURL == "" {
				updateFields["photo_url"] = payload.PhotoURL
			}

			_, _ = collection.UpdateOne(ctx, bson.M{"_id": phoneUser.ID}, bson.M{"$set": updateFields})
			var result models.UserProfile
			_ = collection.FindOne(ctx, bson.M{"_id": phoneUser.ID}).Decode(&result)
			token, err := utils.GenerateCustomerJWT(result.ID.Hex(), result.Email, result.Phone, cfg.JWTSecret)
			if err == nil {
				result.Token = token
			}
			c.JSON(http.StatusOK, result)
			return
		}
	}
}

func PhoneLogin(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var payload PhoneLoginPayload
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		cleanP := CleanPhoneDigits(payload.Phone)
		if cleanP == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Valid phone number required"})
			return
		}

		collection := db.GetCollection("users")
		now := time.Now()

		// 1. Search STRICTLY by normalized 10-digit phone number
		var phoneUser models.UserProfile
		phoneUserFound := false
		phoneFilter := bson.M{"phone": bson.M{"$regex": primitive.Regex{Pattern: cleanP, Options: "i"}}}
		if err := collection.FindOne(ctx, phoneFilter).Decode(&phoneUser); err == nil {
			phoneUserFound = true
		}

		// 2. Search by email if email is provided in payload
		var emailUser models.UserProfile
		emailUserFound := false
		if payload.Email != "" {
			if err := collection.FindOne(ctx, bson.M{"email": payload.Email}).Decode(&emailUser); err == nil {
				emailUserFound = true
			}
		}

		// Case 1: Neither exists -> Create new user profile
		if !phoneUserFound && !emailUserFound {
			newUser := models.UserProfile{
				Name:        payload.Name,
				Phone:       payload.Phone,
				Email:       payload.Email,
				Addresses:   []models.SavedAddress{},
				CoinBalance: 0,
				Tier: models.UserTier{
					CurrentTier: "SILVER",
				},
				UpdatedAt: now,
			}
			res, err := collection.InsertOne(ctx, newUser)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user profile"})
				return
			}
			var result models.UserProfile
			_ = collection.FindOne(ctx, bson.M{"_id": res.InsertedID}).Decode(&result)
			token, err := utils.GenerateCustomerJWT(result.ID.Hex(), result.Email, result.Phone, cfg.JWTSecret)
			if err == nil {
				result.Token = token
			}
			c.JSON(http.StatusCreated, result)
			return
		}

		// Case 4: Both exist and they are different documents -> Merge them!
		if phoneUserFound && emailUserFound && phoneUser.ID != emailUser.ID {
			merged, err := mergeUserProfiles(ctx, collection, &phoneUser, &emailUser)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to merge user profiles"})
				return
			}
			token, err := utils.GenerateCustomerJWT(merged.ID.Hex(), merged.Email, merged.Phone, cfg.JWTSecret)
			if err == nil {
				merged.Token = token
			}
			c.JSON(http.StatusOK, merged)
			return
		}

		// Case 2: Only phoneUser exists OR both exist and are the same document
		if phoneUserFound {
			updateFields := bson.M{
				"phone":      payload.Phone,
				"updated_at": now,
			}
			if payload.Name != "" {
				updateFields["name"] = payload.Name
			}
			if payload.Email != "" && phoneUser.Email == "" {
				updateFields["email"] = payload.Email
			}

			_, _ = collection.UpdateOne(ctx, bson.M{"_id": phoneUser.ID}, bson.M{"$set": updateFields})
			var result models.UserProfile
			_ = collection.FindOne(ctx, bson.M{"_id": phoneUser.ID}).Decode(&result)
			token, err := utils.GenerateCustomerJWT(result.ID.Hex(), result.Email, result.Phone, cfg.JWTSecret)
			if err == nil {
				result.Token = token
			}
			c.JSON(http.StatusOK, result)
			return
		}

		// Case 3: Only emailUser exists
		if emailUserFound {
			updateFields := bson.M{
				"phone":      payload.Phone,
				"updated_at": now,
			}
			if payload.Name != "" && emailUser.Name == "" {
				updateFields["name"] = payload.Name
			}

			_, _ = collection.UpdateOne(ctx, bson.M{"_id": emailUser.ID}, bson.M{"$set": updateFields})
			var result models.UserProfile
			_ = collection.FindOne(ctx, bson.M{"_id": emailUser.ID}).Decode(&result)
			token, err := utils.GenerateCustomerJWT(result.ID.Hex(), result.Email, result.Phone, cfg.JWTSecret)
			if err == nil {
				result.Token = token
			}
			c.JSON(http.StatusOK, result)
			return
		}
	}
}

func UpdateUserProfile(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var payload models.UserProfile
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	vEmail, _ := c.Get("user_email")
	vPhone, _ := c.Get("user_phone")
	vUID, _ := c.Get("user_uid")

	// Verify that the user is updating their own profile
	if payload.Email != "" && vEmail != "" && payload.Email != vEmail.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: cannot modify another user's profile"})
		return
	}
	if payload.Phone != "" && vPhone != "" && CleanPhoneDigits(payload.Phone) != CleanPhoneDigits(vPhone.(string)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: cannot modify another user's profile"})
		return
	}
	if payload.UID != "" && vUID != "" && payload.UID != vUID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: cannot modify another user's profile"})
		return
	}

	if payload.Email == "" && payload.Phone == "" && payload.UID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email, Phone, or UID required to update profile"})
		return
	}

	collection := db.GetCollection("users")

	// 1. Identify the user we are updating
	var existing models.UserProfile
	userFound := false

	if !payload.ID.IsZero() {
		if err := collection.FindOne(ctx, bson.M{"_id": payload.ID}).Decode(&existing); err == nil {
			userFound = true
		}
	}

	if !userFound && payload.UID != "" {
		if err := collection.FindOne(ctx, bson.M{"uid": payload.UID}).Decode(&existing); err == nil {
			userFound = true
		}
	}

	if !userFound && payload.Email != "" {
		if err := collection.FindOne(ctx, bson.M{"email": payload.Email}).Decode(&existing); err == nil {
			userFound = true
		}
	}

	// 2. Strict Phone Uniqueness Check
	if payload.Phone != "" {
		cleanP := CleanPhoneDigits(payload.Phone)
		if cleanP != "" {
			var otherUser models.UserProfile
			phoneFilter := bson.M{
				"phone": bson.M{"$regex": primitive.Regex{Pattern: cleanP, Options: "i"}},
			}
			if userFound {
				phoneFilter["_id"] = bson.M{"$ne": existing.ID}
			}
			if err := collection.FindOne(ctx, phoneFilter).Decode(&otherUser); err == nil {
				c.JSON(http.StatusConflict, gin.H{"error": "This phone number is already linked to another account"})
				return
			}
		}
	}

	now := time.Now()
	updateFields := bson.M{
		"updated_at": now,
	}

	if payload.Name != "" {
		updateFields["name"] = payload.Name
	}
	if payload.Phone != "" {
		updateFields["phone"] = payload.Phone
	}
	if payload.Email != "" {
		updateFields["email"] = payload.Email
	}
	if payload.PhotoURL != "" {
		updateFields["photo_url"] = payload.PhotoURL
	}
	if payload.Addresses != nil {
		updateFields["addresses"] = payload.Addresses
	}

	if userFound {
		_, err := collection.UpdateOne(ctx, bson.M{"_id": existing.ID}, bson.M{"$set": updateFields})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user profile"})
			return
		}
		_ = collection.FindOne(ctx, bson.M{"_id": existing.ID}).Decode(&existing)
		c.JSON(http.StatusOK, existing)
		return
	}

	// Insert if not found
	payload.UpdatedAt = now
	res, err := collection.InsertOne(ctx, payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user profile in MongoDB"})
		return
	}

	_ = collection.FindOne(ctx, bson.M{"_id": res.InsertedID}).Decode(&existing)
	c.JSON(http.StatusOK, existing)
}

func GetUserProfile(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	vEmail, _ := c.Get("user_email")
	vPhone, _ := c.Get("user_phone")
	verifiedEmail := vEmail.(string)
	verifiedPhone := vPhone.(string)

	email := c.Query("email")
	phone := c.Query("phone")

	// Verify that the user is accessing their own profile
	if email != "" && verifiedEmail != "" && email != verifiedEmail {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: cannot access another user's profile"})
		return
	}
	if phone != "" && verifiedPhone != "" && CleanPhoneDigits(phone) != CleanPhoneDigits(verifiedPhone) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: cannot access another user's profile"})
		return
	}

	// Use verified credentials as fallback
	if email == "" {
		email = verifiedEmail
	}
	if phone == "" {
		phone = verifiedPhone
	}

	if email == "" && phone == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email or phone required"})
		return
	}

	filter := bson.M{}
	if email != "" && phone != "" {
		filter["$or"] = []bson.M{
			{"email": email},
			{"phone": bson.M{"$regex": primitive.Regex{Pattern: CleanPhoneDigits(phone), Options: "i"}}},
		}
	} else if email != "" {
		filter["email"] = email
	} else {
		filter["phone"] = bson.M{"$regex": primitive.Regex{Pattern: CleanPhoneDigits(phone), Options: "i"}}
	}

	collection := db.GetCollection("users")
	var profile models.UserProfile
	err := collection.FindOne(ctx, filter).Decode(&profile)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	c.JSON(http.StatusOK, profile)
}

type RequestDeletionPayload struct {
	Email  string `json:"email" binding:"required"`
	Reason string `json:"reason" binding:"required"`
}

func RequestAccountDeletion(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var payload RequestDeletionPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	vEmail, _ := c.Get("user_email")
	if vEmail != "" && payload.Email != vEmail.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: cannot delete another user's account"})
		return
	}

	usersCol := db.GetCollection("users")
	var user models.UserProfile
	err := usersCol.FindOne(ctx, bson.M{"email": payload.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User account not found with the provided email"})
		return
	}

	// Check for active/in-transit orders — collect their details for admin review (no longer blocking)
	ordersCol := db.GetCollection("orders")
	activeOrderFilter := bson.M{
		"$or": []bson.M{
			{"customer_email": payload.Email},
			{"customer_phone": user.Phone},
		},
		"order_status": bson.M{"$in": []string{"PENDING_PAYMENT", "CONFIRMED", "PROCESSING", "SHIPPED"}},
	}

	cursor, _ := ordersCol.Find(ctx, activeOrderFilter)
	var activeOrders []models.Order
	if cursor != nil {
		_ = cursor.All(ctx, &activeOrders)
		cursor.Close(ctx)
	}
	activeCount := len(activeOrders)

	// Build active order summary for ticket message
	activeOrderNote := ""
	if activeCount > 0 {
		activeOrderNote = fmt.Sprintf("\n\n⚠️ ADMIN REVIEW REQUIRED: User has %d active/in-transit order(s) at time of request:", activeCount)
		for _, o := range activeOrders {
			activeOrderNote += fmt.Sprintf("\n  • Order %s — Status: %s — Amount: ₹%.2f", o.OrderID, o.OrderStatus, o.TotalAmount)
		}
		activeOrderNote += "\n\nAdmin must verify all orders are DELIVERED or CANCELLED before approving this deletion request."
	}

	// Update user soft deletion flag — always proceed
	now := time.Now()
	_, _ = usersCol.UpdateOne(ctx, bson.M{"_id": user.ID}, bson.M{
		"$set": bson.M{
			"deletion_requested":    true,
			"deletion_requested_at": now,
			"deletion_reason":       payload.Reason,
			"updated_at":            now,
		},
	})

	// Create high-priority Ticket in support ticket system
	ticketID := generateTicketID()
	ticketsCol := db.GetCollection("support_tickets")

	custName := user.Name
	if custName == "" {
		custName = "Customer"
	}

	adminNote := "User requested account deletion. Reason: " + payload.Reason + ". Verified Email: " + payload.Email + activeOrderNote

	ticket := models.SupportTicket{
		ID:            primitive.NewObjectID(),
		TicketID:      ticketID,
		CustomerEmail: payload.Email,
		CustomerPhone: user.Phone,
		Category:      "ACCOUNT_DELETION",
		IssueText:     "DPDP/GDPR PRIVACY ERASURE REQUEST - Account Deletion. Reason: " + payload.Reason,
		Priority:      "HIGH",
		Status:        "OPEN",
		CreatedAt:     now,
		UpdatedAt:     now,
		Messages: []models.TicketMessage{
			{
				ID:         primitive.NewObjectID().Hex(),
				Sender:     "customer",
				SenderName: custName,
				Message:    adminNote,
				CreatedAt:  now,
			},
		},
	}

	_, _ = ticketsCol.InsertOne(ctx, ticket)

	responseMsg := "Account deletion request received successfully. Standard DPDP/GDPR processing window is 48 to 72 hours."
	if activeCount > 0 {
		responseMsg = fmt.Sprintf("Account deletion request received. Note: You have %d active order(s). Our support team will review your request once all orders are completed or cancelled. Processing window: 48 to 72 hours.", activeCount)
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      responseMsg,
		"ticket_id":    ticketID,
		"active_orders": activeCount,
	})
}

// GetCloneAccounts returns all user profiles sharing the same normalized phone number.
func GetCloneAccounts(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	phone := c.Query("phone")
	if phone == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Phone parameter required"})
		return
	}

	vPhone, _ := c.Get("user_phone")
	if vPhone != "" && CleanPhoneDigits(phone) != CleanPhoneDigits(vPhone.(string)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: cannot access another user's clone accounts"})
		return
	}

	cleanP := CleanPhoneDigits(phone)
	if cleanP == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valid phone number required"})
		return
	}

	collection := db.GetCollection("users")
	filter := bson.M{"phone": bson.M{"$regex": primitive.Regex{Pattern: cleanP, Options: "i"}}}

	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch clone accounts"})
		return
	}
	defer cursor.Close(ctx)

	var profiles []models.UserProfile
	if err := cursor.All(ctx, &profiles); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode profiles"})
		return
	}

	c.JSON(http.StatusOK, profiles)
}

type SetDefaultPayload struct {
	DefaultID string `json:"default_id" binding:"required"`
	Phone     string `json:"phone" binding:"required"`
}

// SetDefaultAccount sets one account as the default profile for a phone number and clears the phone from other profiles.
func SetDefaultAccount(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var payload SetDefaultPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	vPhone, _ := c.Get("user_phone")
	if vPhone != "" && CleanPhoneDigits(payload.Phone) != CleanPhoneDigits(vPhone.(string)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	cleanP := CleanPhoneDigits(payload.Phone)
	if cleanP == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valid phone number required"})
		return
	}

	defaultObjID, err := primitive.ObjectIDFromHex(payload.DefaultID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid default_id format"})
		return
	}

	collection := db.GetCollection("users")

	// 1. Clear phone field for all accounts with this phone number EXCEPT the default one
	phoneFilter := bson.M{
		"phone": bson.M{"$regex": primitive.Regex{Pattern: cleanP, Options: "i"}},
		"_id":   bson.M{"$ne": defaultObjID},
	}
	_, err = collection.UpdateMany(ctx, phoneFilter, bson.M{"$set": bson.M{"phone": "", "updated_at": time.Now()}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear phone from other accounts"})
		return
	}

	// 2. Ensure the default account has the phone number set correctly
	_, err = collection.UpdateOne(ctx, bson.M{"_id": defaultObjID}, bson.M{"$set": bson.M{"phone": payload.Phone, "updated_at": time.Now()}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set phone on default account"})
		return
	}

	// 3. Return the updated default profile
	var updatedProfile models.UserProfile
	err = collection.FindOne(ctx, bson.M{"_id": defaultObjID}).Decode(&updatedProfile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated profile"})
		return
	}

	c.JSON(http.StatusOK, updatedProfile)
}

type UnlinkClonePayload struct {
	AccountID string `json:"account_id" binding:"required"`
}

// UnlinkPhoneFromAccount clears the phone field for a specific user profile.
func UnlinkPhoneFromAccount(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var payload UnlinkClonePayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	accountObjID, err := primitive.ObjectIDFromHex(payload.AccountID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid account_id format"})
		return
	}

	collection := db.GetCollection("users")

	// Verify ownership of the account to unlink
	vPhone, _ := c.Get("user_phone")
	vEmail, _ := c.Get("user_email")

	var userProfile models.UserProfile
	err = collection.FindOne(ctx, bson.M{"_id": accountObjID}).Decode(&userProfile)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Account not found"})
		return
	}

	if (vPhone != "" && CleanPhoneDigits(userProfile.Phone) != CleanPhoneDigits(vPhone.(string))) && (vEmail != "" && userProfile.Email != vEmail.(string)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: cannot unlink another user's account"})
		return
	}

	_, err = collection.UpdateOne(ctx, bson.M{"_id": accountObjID}, bson.M{"$set": bson.M{"phone": "", "updated_at": time.Now()}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unlink phone from account"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Phone unlinked successfully"})
}

// CheckAccountExists verifies if an account with a specific email or phone already exists.
func CheckAccountExists(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	email := c.Query("email")
	phone := c.Query("phone")

	if email == "" && phone == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email or phone parameter is required"})
		return
	}

	filter := bson.M{}
	if email != "" && phone != "" {
		filter["$or"] = []bson.M{
			{"email": email},
			{"phone": bson.M{"$regex": primitive.Regex{Pattern: CleanPhoneDigits(phone), Options: "i"}}},
		}
	} else if email != "" {
		filter["email"] = email
	} else {
		filter["phone"] = bson.M{"$regex": primitive.Regex{Pattern: CleanPhoneDigits(phone), Options: "i"}}
	}

	collection := db.GetCollection("users")
	count, err := collection.CountDocuments(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify account uniqueness"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"exists": count > 0,
	})
}



