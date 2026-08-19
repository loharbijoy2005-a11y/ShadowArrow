package cron

import (
	"context"
	"log"
	"time"

	"shadow-arrow-backend/db"
	"shadow-arrow-backend/models"

	"go.mongodb.org/mongo-driver/bson"
)

// ProcessCoinLifecycles runs the daily check for pending activation and expired coins
func ProcessCoinLifecycles() {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	now := time.Now()
	sevenDaysAgo := now.AddDate(0, 0, -7)

	txCol := db.GetCollection("coin_transactions")
	usersCol := db.GetCollection("users")

	// 1. Transition PENDING -> ACTIVE after 7 days
	pendingFilter := bson.M{
		"status":     "PENDING",
		"created_at": bson.M{"$lte": sevenDaysAgo},
	}

	cursor, err := txCol.Find(ctx, pendingFilter)
	if err == nil {
		var pendingTxs []models.CoinTransaction
		if err := cursor.All(ctx, &pendingTxs); err == nil {
			for _, tx := range pendingTxs {
				activatedAt := now
				expiresAt := now.AddDate(1, 0, 0) // 365 days

				// Update transaction
				_, _ = txCol.UpdateOne(ctx, bson.M{"_id": tx.ID}, bson.M{
					"$set": bson.M{
						"status":       "ACTIVE",
						"activated_at": activatedAt,
						"expires_at":   expiresAt,
					},
				})

				// Credit to user balance
				_, _ = usersCol.UpdateOne(ctx, bson.M{"_id": tx.UserID}, bson.M{
					"$inc": bson.M{"coin_balance": tx.Amount},
					"$set": bson.M{"updated_at": now},
				})
			}
			if len(pendingTxs) > 0 {
				log.Printf("[Cron Job] Activated %d pending ArrowCoins transactions", len(pendingTxs))
			}
		}
	}

	// 2. Expire ACTIVE coins where expires_at <= now
	expiredFilter := bson.M{
		"status":     "ACTIVE",
		"expires_at": bson.M{"$lte": now},
	}

	expCursor, err := txCol.Find(ctx, expiredFilter)
	if err == nil {
		var expiredTxs []models.CoinTransaction
		if err := expCursor.All(ctx, &expiredTxs); err == nil {
			for _, tx := range expiredTxs {
				_, _ = txCol.UpdateOne(ctx, bson.M{"_id": tx.ID}, bson.M{
					"$set": bson.M{"status": "EXPIRED"},
				})

				// Deduct from user balance
				_, _ = usersCol.UpdateOne(ctx, bson.M{"_id": tx.UserID}, bson.M{
					"$inc": bson.M{"coin_balance": -tx.Amount},
					"$set": bson.M{"updated_at": now},
				})
			}
			if len(expiredTxs) > 0 {
				log.Printf("[Cron Job] Expired %d ArrowCoins transactions", len(expiredTxs))
			}
		}
	}
}

// StartCronScheduler starts a background ticker running every 6 hours or midnight
func StartCronScheduler() {
	go func() {
		// Run once on startup
		ProcessCoinLifecycles()

		ticker := time.NewTicker(6 * time.Hour)
		defer ticker.Stop()

		for range ticker.C {
			ProcessCoinLifecycles()
		}
	}()
}
