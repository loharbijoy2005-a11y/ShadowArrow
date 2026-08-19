package handlers

import (
	"context"
	"net/http"
	"regexp"
	"time"

	"shadow-arrow-backend/db"
	"shadow-arrow-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Default config values if DB config is missing
const (
	DefaultConversionRate     = 1.0
	DefaultMaxRedemptionPct   = 20.0
	DefaultReturnHoldDelayDays = 7
)

func GetLoyaltyConfig(ctx context.Context) models.LoyaltyConfig {
	col := db.GetCollection("loyalty_configs")
	var cfg models.LoyaltyConfig
	err := col.FindOne(ctx, bson.M{}).Decode(&cfg)
	if err != nil {
		return models.LoyaltyConfig{
			ConversionRate:      DefaultConversionRate,
			MaxRedemptionPct:    DefaultMaxRedemptionPct,
			ReturnHoldDelayDays: DefaultReturnHoldDelayDays,
			UpdatedAt:           time.Now(),
		}
	}
	return cfg
}

func CleanPhoneDigits(phone string) string {
	reg := regexp.MustCompile(`\D`)
	digits := reg.ReplaceAllString(phone, "")
	if len(digits) >= 10 {
		return digits[len(digits)-10:]
	}
	return digits
}

func EvaluateUserTier(ctx context.Context, userObjID primitive.ObjectID, userPhone string, userEmail string) (string, int) {
	ordersCol := db.GetCollection("orders")
	oneYearAgo := time.Now().AddDate(-1, 0, 0)

	// Filter for delivered orders in last 12 rolling months using normalized phone matching
	orConditions := []bson.M{}
	if userPhone != "" {
		cleanP := CleanPhoneDigits(userPhone)
		if len(cleanP) >= 10 {
			orConditions = append(orConditions, bson.M{"customer_phone": bson.M{"$regex": primitive.Regex{Pattern: cleanP, Options: "i"}}})
		} else {
			orConditions = append(orConditions, bson.M{"customer_phone": userPhone})
		}
	}
	if userEmail != "" {
		orConditions = append(orConditions, bson.M{"customer_email": userEmail})
	}

	if len(orConditions) == 0 {
		return "SILVER", 0
	}

	filter := bson.M{
		"$or": orConditions,
		"order_status": "DELIVERED",
		"created_at": bson.M{"$gte": oneYearAgo},
	}

	count64, err := ordersCol.CountDocuments(ctx, filter)
	if err != nil {
		return "SILVER", 0
	}
	deliveredCount := int(count64)

	var tier string
	if deliveredCount >= 20 {
		tier = "DIAMOND"
	} else if deliveredCount >= 5 {
		tier = "GOLD"
	} else {
		tier = "SILVER"
	}

	// Update user record with evaluated tier
	usersCol := db.GetCollection("users")
	now := time.Now()
	_, _ = usersCol.UpdateOne(ctx, bson.M{"_id": userObjID}, bson.M{
		"$set": bson.M{
			"tier.current_tier":     tier,
			"tier.last_evaluated_at": now,
		},
	})

	return tier, deliveredCount
}

func CalculateCashbackForOrder(tier string, orderAmount float64) float64 {
	var pct float64
	var maxCap float64

	switch tier {
	case "DIAMOND":
		pct = 0.05 // 5% cashback for Diamond Tier (20+ delivered orders)
		maxCap = 200.0
	case "GOLD":
		pct = 0.02 // 2% cashback for Gold Tier (5-19 delivered orders)
		maxCap = 100.0
	default: // SILVER
		pct = 0.01 // 1% cashback for Silver Tier (0-4 delivered orders)
		maxCap = 50.0
	}

	rawEarned := (orderAmount * pct)
	if rawEarned > maxCap {
		return maxCap
	}
	return float64(int(rawEarned)) // Whole ArrowCoins
}

// GetUserRewards handles fetching full loyalty details for a storefront user
func GetUserRewards(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	email := c.Query("email")
	phone := c.Query("phone")

	if email == "" && phone == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email or phone required"})
		return
	}

	usersCol := db.GetCollection("users")
	var user models.UserProfile

	filter := bson.M{}
	if email != "" && phone != "" {
		filter["$or"] = []bson.M{{"email": email}, {"phone": phone}}
	} else if email != "" {
		filter["email"] = email
	} else {
		filter["phone"] = phone
	}

	err := usersCol.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User profile not found"})
		return
	}

	// Evaluate tier based on last 12 rolling months
	tier, deliveredCount := EvaluateUserTier(ctx, user.ID, user.Phone, user.Email)

	// Fetch transaction ledger
	txCol := db.GetCollection("coin_transactions")
	opts := options.Find().SetSort(bson.M{"created_at": -1})
	cursor, err := txCol.Find(ctx, bson.M{"user_id": user.ID}, opts)

	var ledger []models.CoinTransaction
	if err == nil {
		_ = cursor.All(ctx, &ledger)
	}
	if ledger == nil {
		ledger = []models.CoinTransaction{}
	}

	// Calculate coins expiring in next 30 days
	thirtyDaysLater := time.Now().AddDate(0, 0, 30)
	now := time.Now()
	expiringFilter := bson.M{
		"user_id": user.ID,
		"status":  "ACTIVE",
		"expires_at": bson.M{
			"$gte": now,
			"$lte": thirtyDaysLater,
		},
	}
	expCursor, err := txCol.Find(ctx, expiringFilter)
	expiringCoins := 0.0
	if err == nil {
		var expTxs []models.CoinTransaction
		if err := expCursor.All(ctx, &expTxs); err == nil {
			for _, tx := range expTxs {
				expiringCoins += tx.Amount
			}
		}
	}

	// Next tier threshold calculations
	var nextTier string
	var ordersNeededForNextTier int
	var progressPct float64

	if tier == "SILVER" {
		nextTier = "GOLD"
		ordersNeededForNextTier = 5 - deliveredCount
		progressPct = (float64(deliveredCount) / 5.0) * 100.0
	} else if tier == "GOLD" {
		nextTier = "DIAMOND"
		ordersNeededForNextTier = 20 - deliveredCount
		progressPct = (float64(deliveredCount-5) / 15.0) * 100.0
	} else {
		nextTier = "MAX_TIER"
		ordersNeededForNextTier = 0
		progressPct = 100.0
	}

	cfg := GetLoyaltyConfig(ctx)

	c.JSON(http.StatusOK, gin.H{
		"coin_balance":                user.CoinBalance,
		"current_tier":                tier,
		"delivered_orders_12m":        deliveredCount,
		"next_tier":                   nextTier,
		"orders_needed_for_next_tier": ordersNeededForNextTier,
		"progress_pct":                progressPct,
		"expiring_in_30_days":         expiringCoins,
		"ledger":                      ledger,
		"config":                      cfg,
	})
}

// AdminGetLoyaltyConfigHandler returns global configurations
func AdminGetLoyaltyConfigHandler(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	cfg := GetLoyaltyConfig(ctx)
	c.JSON(http.StatusOK, cfg)
}

// AdminUpdateLoyaltyConfigHandler saves updated configs
func AdminUpdateLoyaltyConfigHandler(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var payload models.LoyaltyConfig
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if payload.ConversionRate <= 0 {
		payload.ConversionRate = 1.0
	}
	if payload.MaxRedemptionPct <= 0 || payload.MaxRedemptionPct > 100 {
		payload.MaxRedemptionPct = 20.0
	}
	if payload.ReturnHoldDelayDays < 0 {
		payload.ReturnHoldDelayDays = 7
	}
	payload.UpdatedAt = time.Now()

	col := db.GetCollection("loyalty_configs")
	_, err := col.UpdateOne(ctx, bson.M{}, bson.M{"$set": payload}, options.Update().SetUpsert(true))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update loyalty config"})
		return
	}

	c.JSON(http.StatusOK, payload)
}

type AdminManualAdjustPayload struct {
	UserSearch  string  `json:"user_search" binding:"required"` // Email or Phone
	Amount      float64 `json:"amount" binding:"required"`
	Type        string  `json:"type" binding:"required"` // CREDIT or DEBIT
	ReasonNote  string  `json:"reason_note" binding:"required"`
}

// AdminManualAdjustCoins creates a manual credit or debit entry
func AdminManualAdjustCoins(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var payload AdminManualAdjustPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if payload.Type != "CREDIT" && payload.Type != "DEBIT" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Type must be CREDIT or DEBIT"})
		return
	}

	if payload.ReasonNote == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Mandatory reason note required for auditing"})
		return
	}

	usersCol := db.GetCollection("users")
	var user models.UserProfile
	filter := bson.M{
		"$or": []bson.M{
			{"email": payload.UserSearch},
			{"phone": payload.UserSearch},
		},
	}
	err := usersCol.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found with provided email or phone"})
		return
	}

	now := time.Now()
	expiresAt := now.AddDate(1, 0, 0) // 365 days

	txStatus := "ACTIVE"
	if payload.Type == "DEBIT" {
		txStatus = "USED"
		if user.CoinBalance < payload.Amount {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient coin balance for debit"})
			return
		}
	}

	tx := models.CoinTransaction{
		ID:          primitive.NewObjectID(),
		UserID:      user.ID,
		Amount:      payload.Amount,
		Type:        payload.Type,
		Status:      txStatus,
		Description: "Admin Adjustment: " + payload.ReasonNote,
		CreatedAt:   now,
		ActivatedAt: &now,
		ExpiresAt:   &expiresAt,
	}

	txCol := db.GetCollection("coin_transactions")
	_, err = txCol.InsertOne(ctx, tx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to log transaction"})
		return
	}

	// Update user balance
	newBalance := user.CoinBalance
	if payload.Type == "CREDIT" {
		newBalance += payload.Amount
	} else {
		newBalance -= payload.Amount
	}

	_, _ = usersCol.UpdateOne(ctx, bson.M{"_id": user.ID}, bson.M{
		"$set": bson.M{"coin_balance": newBalance, "updated_at": now},
	})

	c.JSON(http.StatusOK, gin.H{
		"message":      "Manual adjustment processed successfully",
		"new_balance":  newBalance,
		"transaction": tx,
	})
}

// AdminGetCoinAnalytics calculates metric cards
func AdminGetCoinAnalytics(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	usersCol := db.GetCollection("users")
	cfg := GetLoyaltyConfig(ctx)

	// Calculate total active circulation balance across all users
	cursor, err := usersCol.Find(ctx, bson.M{})
	totalCirculationCoins := 0.0
	silverCount, goldCount, diamondCount := 0, 0, 0

	if err == nil {
		var users []models.UserProfile
		if err := cursor.All(ctx, &users); err == nil {
			for _, u := range users {
				totalCirculationCoins += u.CoinBalance
				switch u.Tier.CurrentTier {
				case "DIAMOND":
					diamondCount++
				case "GOLD":
					goldCount++
				default:
					silverCount++
				}
			}
		}
	}

	totalLiabilityINR := totalCirculationCoins * cfg.ConversionRate

	// Calculate monthly expired vs redeemed coins
	txCol := db.GetCollection("coin_transactions")
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)

	expiredFilter := bson.M{
		"status": "EXPIRED",
		"created_at": bson.M{"$gte": thirtyDaysAgo},
	}
	expCursor, _ := txCol.Find(ctx, expiredFilter)
	monthlyExpiredCoins := 0.0
	if expCursor != nil {
		var expTxs []models.CoinTransaction
		_ = expCursor.All(ctx, &expTxs)
		for _, t := range expTxs {
			monthlyExpiredCoins += t.Amount
		}
	}

	redeemedFilter := bson.M{
		"type": "DEBIT",
		"created_at": bson.M{"$gte": thirtyDaysAgo},
	}
	redCursor, _ := txCol.Find(ctx, redeemedFilter)
	monthlyRedeemedCoins := 0.0
	if redCursor != nil {
		var redTxs []models.CoinTransaction
		_ = redCursor.All(ctx, &redTxs)
		for _, t := range redTxs {
			monthlyRedeemedCoins += t.Amount
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"total_circulation_coins": totalCirculationCoins,
		"total_liability_inr":     totalLiabilityINR,
		"users_per_tier": gin.H{
			"silver":  silverCount,
			"gold":    goldCount,
			"diamond": diamondCount,
		},
		"monthly_expired_coins":  monthlyExpiredCoins,
		"monthly_redeemed_coins": monthlyRedeemedCoins,
	})
}

// AdminGetTopCoinHolders fetches customers sorted by highest ArrowCoins balance
func AdminGetTopCoinHolders(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	usersCol := db.GetCollection("users")
	findOpts := options.Find().SetSort(bson.M{"coin_balance": -1}).SetLimit(50)

	cursor, err := usersCol.Find(ctx, bson.M{}, findOpts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch top coin holders"})
		return
	}
	defer cursor.Close(ctx)

	var users []models.UserProfile
	if err := cursor.All(ctx, &users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode top coin holders"})
		return
	}

	if users == nil {
		users = []models.UserProfile{}
	}

	c.JSON(http.StatusOK, users)
}
