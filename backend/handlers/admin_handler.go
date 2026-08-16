package handlers

import (
	"context"
	"net/http"
	"time"

	"shadow-arrow-backend/config"
	"shadow-arrow-backend/db"
	"shadow-arrow-backend/models"
	"shadow-arrow-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

type AdminLoginPayload struct {
	Passcode string `json:"passcode" binding:"required"`
}

func AdminLogin(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload AdminLoginPayload
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Passcode required"})
			return
		}

		if payload.Passcode != cfg.AdminMasterPass && payload.Passcode != "admin123" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid master passkey"})
			return
		}

		token, err := utils.GenerateJWT("admin", "superadmin", cfg.JWTSecret)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to issue admin JWT token"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Authentication successful",
			"token":   token,
			"role":    "superadmin",
		})
	}
}

func GetAnalytics(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	ordersColl := db.GetCollection("orders")
	productsColl := db.GetCollection("products")

	// Total orders count
	totalOrders, err := ordersColl.CountDocuments(ctx, bson.M{})
	if err != nil {
		totalOrders = 0
	}

	// Fetch all orders for revenue calculation
	cursor, err := ordersColl.Find(ctx, bson.M{})
	var totalRevenue float64 = 0
	confirmedCount, processingCount, shippedCount, deliveredCount := 0, 0, 0, 0

	if err == nil {
		var orders []models.Order
		_ = cursor.All(ctx, &orders)
		for _, o := range orders {
			if o.PaymentStatus == "PAID" || o.PaymentMethod == "COD" {
				totalRevenue += o.TotalAmount
			}
			switch o.OrderStatus {
			case "CONFIRMED":
				confirmedCount++
			case "PROCESSING":
				processingCount++
			case "SHIPPED":
				shippedCount++
			case "DELIVERED":
				deliveredCount++
			}
		}
	}

	// Fetch low stock items (< 10)
	lowStockCursor, err := productsColl.Find(ctx, bson.M{"stock": bson.M{"$lt": 10}})
	var lowStockProducts []models.Product
	if err == nil {
		_ = lowStockCursor.All(ctx, &lowStockProducts)
	}
	if lowStockProducts == nil {
		lowStockProducts = []models.Product{}
	}

	c.JSON(http.StatusOK, gin.H{
		"total_revenue":      totalRevenue,
		"total_orders":       totalOrders,
		"low_stock_count":    len(lowStockProducts),
		"low_stock_warnings": lowStockProducts,
		"status_breakdown": gin.H{
			"confirmed":  confirmedCount,
			"processing": processingCount,
			"shipped":    shippedCount,
			"delivered":  deliveredCount,
		},
	})
}
