package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"shadow-arrow-backend/db"
	"shadow-arrow-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PhoneLoginPayload struct {
	Name  string `json:"name"`
	Phone string `json:"phone" binding:"required"`
	Email string `json:"email"`
}

func GoogleSync(c *gin.Context) {
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

	// Search by email, phone, or UID
	orConditions := []bson.M{}
	if payload.Email != "" {
		orConditions = append(orConditions, bson.M{"email": payload.Email})
	}
	if payload.Phone != "" {
		orConditions = append(orConditions, bson.M{"phone": payload.Phone})
	}
	if payload.UID != "" {
		orConditions = append(orConditions, bson.M{"uid": payload.UID})
	}

	filter := bson.M{"$or": orConditions}

	var existing models.UserProfile
	err := collection.FindOne(ctx, filter).Decode(&existing)

	now := time.Now()
	if err == nil {
		// Existing user found -> Merge details without overwriting non-empty phone/email with empty strings
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

		_, _ = collection.UpdateOne(ctx, bson.M{"_id": existing.ID}, bson.M{"$set": updateFields})
		_ = collection.FindOne(ctx, bson.M{"_id": existing.ID}).Decode(&existing)
		c.JSON(http.StatusOK, existing)
		return
	}

	// New user -> Insert
	payload.UpdatedAt = now
	res, err := collection.InsertOne(ctx, payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user document"})
		return
	}

	_ = collection.FindOne(ctx, bson.M{"_id": res.InsertedID}).Decode(&existing)
	c.JSON(http.StatusCreated, existing)
}

func PhoneLogin(c *gin.Context) {
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

	// Search STRICTLY by normalized 10-digit phone number
	phoneRegexFilter := bson.M{"phone": bson.M{"$regex": primitive.Regex{Pattern: cleanP, Options: "i"}}}

	var existing models.UserProfile
	err := collection.FindOne(ctx, phoneRegexFilter).Decode(&existing)

	now := time.Now()
	if err == nil {
		// Existing phone user found -> Return this single account
		updateFields := bson.M{
			"phone":      payload.Phone,
			"updated_at": now,
		}
		if payload.Name != "" {
			updateFields["name"] = payload.Name
		}
		if payload.Email != "" && existing.Email == "" {
			updateFields["email"] = payload.Email
		}

		_, _ = collection.UpdateOne(ctx, bson.M{"_id": existing.ID}, bson.M{"$set": updateFields})
		_ = collection.FindOne(ctx, bson.M{"_id": existing.ID}).Decode(&existing)
		c.JSON(http.StatusOK, existing)
		return
	}

	// If phone not found, check if email is provided and already belongs to another user
	if payload.Email != "" {
		var emailUser models.UserProfile
		if err := collection.FindOne(ctx, bson.M{"email": payload.Email}).Decode(&emailUser); err == nil {
			// Attach phone ONLY if email user has no phone or matching phone
			if emailUser.Phone == "" || CleanPhoneDigits(emailUser.Phone) == cleanP {
				_, _ = collection.UpdateOne(ctx, bson.M{"_id": emailUser.ID}, bson.M{"$set": bson.M{"phone": payload.Phone, "updated_at": now}})
				_ = collection.FindOne(ctx, bson.M{"_id": emailUser.ID}).Decode(&emailUser)
				c.JSON(http.StatusOK, emailUser)
				return
			}
		}
	}

	// New user -> Insert single unique user document
	newUser := models.UserProfile{
		Name:      payload.Name,
		Phone:     payload.Phone,
		Email:     payload.Email,
		Addresses: []models.SavedAddress{},
		UpdatedAt: now,
	}

	res, err := collection.InsertOne(ctx, newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create phone user document"})
		return
	}

	_ = collection.FindOne(ctx, bson.M{"_id": res.InsertedID}).Decode(&existing)
	c.JSON(http.StatusCreated, existing)
}

func UpdateUserProfile(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var payload models.UserProfile
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if payload.Email == "" && payload.Phone == "" && payload.UID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email, Phone, or UID required to update profile"})
		return
	}

	collection := db.GetCollection("users")

	orConditions := []bson.M{}
	if payload.Email != "" {
		orConditions = append(orConditions, bson.M{"email": payload.Email})
	}
	if payload.Phone != "" {
		orConditions = append(orConditions, bson.M{"phone": payload.Phone})
	}
	if payload.UID != "" {
		orConditions = append(orConditions, bson.M{"uid": payload.UID})
	}

	filter := bson.M{"$or": orConditions}

	var existing models.UserProfile
	err := collection.FindOne(ctx, filter).Decode(&existing)

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

	if err == nil {
		_, err = collection.UpdateOne(ctx, bson.M{"_id": existing.ID}, bson.M{"$set": updateFields})
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

	email := c.Query("email")
	phone := c.Query("phone")

	if email == "" && phone == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email or phone required"})
		return
	}

	filter := bson.M{}
	if email != "" && phone != "" {
		filter["$or"] = []bson.M{
			{"email": email},
			{"phone": phone},
		}
	} else if email != "" {
		filter["email"] = email
	} else {
		filter["phone"] = phone
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
	ticketsCol := db.GetCollection("tickets")

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

