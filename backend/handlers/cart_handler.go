package handlers

import (
	"context"
	"net/http"
	"time"

	"shadow-arrow-backend/db"
	"shadow-arrow-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type CartSyncRequest struct {
	SessionID     string                `json:"session_id" binding:"required"`
	CustomerName  string                `json:"customer_name"`
	CustomerPhone string                `json:"customer_phone"`
	CustomerEmail string                `json:"customer_email"`
	Items         []models.CartSyncItem `json:"items"`
	TotalAmount   float64               `json:"total_amount"`
	Status        string                `json:"status"` // ACTIVE, CHECKOUT_STARTED, COMPLETED
}

func SyncCart(c *gin.Context) {
	var req CartSyncRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := db.GetCollection("abandoned_carts")

	status := req.Status
	if status == "" {
		if len(req.Items) == 0 {
			status = "CLEARED"
		} else {
			status = "ABANDONED"
		}
	}

	filter := bson.M{"session_id": req.SessionID}
	if req.CustomerPhone != "" {
		filter = bson.M{
			"$or": []bson.M{
				{"session_id": req.SessionID},
				{"customer_phone": req.CustomerPhone},
			},
		}
	}

	update := bson.M{
		"$set": bson.M{
			"session_id":     req.SessionID,
			"customer_name":  req.CustomerName,
			"customer_phone": req.CustomerPhone,
			"customer_email": req.CustomerEmail,
			"items":          req.Items,
			"total_amount":   req.TotalAmount,
			"status":         status,
			"updated_at":     time.Now(),
		},
	}

	opts := options.Update().SetUpsert(true)
	_, err := collection.UpdateOne(ctx, filter, update, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sync cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Cart synchronized successfully",
		"session_id": req.SessionID,
		"status":     status,
	})
}

func GetAbandonedCarts(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := db.GetCollection("abandoned_carts")

	opts := options.Find().SetSort(bson.D{{Key: "updated_at", Value: -1}}).SetLimit(50)
	cursor, err := collection.Find(ctx, bson.M{
		"items": bson.M{"$not": bson.M{"$size": 0}},
	}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch abandoned carts"})
		return
	}
	defer cursor.Close(ctx)

	var carts []models.AbandonedCart
	if err := cursor.All(ctx, &carts); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse abandoned carts"})
		return
	}

	if carts == nil {
		carts = []models.AbandonedCart{}
	}

	c.JSON(http.StatusOK, carts)
}
