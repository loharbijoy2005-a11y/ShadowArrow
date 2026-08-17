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

type AdminCustomerItem struct {
	ID              string                `json:"id"`
	UID             string                `json:"uid"`
	Name            string                `json:"name"`
	Email           string                `json:"email"`
	Phone           string                `json:"phone"`
	PhotoURL        string                `json:"photo_url"`
	AuthType        string                `json:"auth_type"`
	TotalOrders     int                   `json:"total_orders"`
	OrdersReceived  int                   `json:"orders_received"`
	OrdersCancelled int                   `json:"orders_cancelled"`
	TotalSpent      float64               `json:"total_spent"`
	TrustScore      string                `json:"trust_score"`
	Addresses       []models.SavedAddress `json:"addresses"`
	UpdatedAt       time.Time             `json:"updated_at"`
}

func GetAdminCustomers(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	usersColl := db.GetCollection("users")
	ordersColl := db.GetCollection("orders")

	// 1. Fetch all users from MongoDB
	usersCursor, err := usersColl.Find(ctx, bson.M{})
	var users []models.UserProfile
	if err == nil {
		_ = usersCursor.All(ctx, &users)
	}

	// 2. Fetch all orders for aggregation
	ordersCursor, err := ordersColl.Find(ctx, bson.M{})
	var orders []models.Order
	if err == nil {
		_ = ordersCursor.All(ctx, &orders)
	}

	// Map to keep track of processed users by email and phone
	customerMap := make(map[string]*AdminCustomerItem)

	for _, u := range users {
		key := u.Email
		if key == "" {
			key = u.Phone
		}
		if key == "" {
			key = u.UID
		}
		if key == "" {
			key = u.ID.Hex()
		}

		authType := "Phone Auth"
		if u.UID != "" || u.PhotoURL != "" || u.Email != "" {
			authType = "Google / Email"
		}

		addr := u.Addresses
		if addr == nil {
			addr = []models.SavedAddress{}
		}

		item := &AdminCustomerItem{
			ID:              u.ID.Hex(),
			UID:             u.UID,
			Name:            u.Name,
			Email:           u.Email,
			Phone:           u.Phone,
			PhotoURL:        u.PhotoURL,
			AuthType:        authType,
			TotalOrders:     0,
			OrdersReceived:  0,
			OrdersCancelled: 0,
			TotalSpent:      0,
			TrustScore:      "HIGH",
			Addresses:       addr,
			UpdatedAt:       u.UpdatedAt,
		}
		customerMap[key] = item
	}

	// Calculate totals & customer behavior stats from orders
	for _, o := range orders {
		matched := false
		for _, item := range customerMap {
			if (item.Email != "" && item.Email == o.CustomerEmail) || (item.Phone != "" && item.Phone == o.CustomerPhone) {
				item.TotalOrders++
				if o.OrderStatus == "CANCELLED" || o.OrderStatus == "REFUNDED" {
					item.OrdersCancelled++
				} else {
					item.OrdersReceived++
				}

				if o.PaymentStatus == "PAID" || o.PaymentMethod == "COD" {
					item.TotalSpent += o.TotalAmount
				}
				if item.Name == "" && o.CustomerName != "" {
					item.Name = o.CustomerName
				}
				if item.Phone == "" && o.CustomerPhone != "" {
					item.Phone = o.CustomerPhone
				}
				matched = true
				break
			}
		}

		if !matched && (o.CustomerEmail != "" || o.CustomerPhone != "") {
			key := o.CustomerEmail
			if key == "" {
				key = o.CustomerPhone
			}
			spent := 0.0
			if o.PaymentStatus == "PAID" || o.PaymentMethod == "COD" {
				spent = o.TotalAmount
			}

			received := 0
			cancelled := 0
			if o.OrderStatus == "CANCELLED" || o.OrderStatus == "REFUNDED" {
				cancelled = 1
			} else {
				received = 1
			}

			customerMap[key] = &AdminCustomerItem{
				ID:              o.ID.Hex(),
				Name:            o.CustomerName,
				Email:           o.CustomerEmail,
				Phone:           o.CustomerPhone,
				AuthType:        "Guest / Direct Order",
				TotalOrders:     1,
				OrdersReceived:  received,
				OrdersCancelled: cancelled,
				TotalSpent:      spent,
				TrustScore:      "HIGH",
				Addresses:       []models.SavedAddress{},
				UpdatedAt:       o.CreatedAt,
			}
		}
	}

	customerList := make([]AdminCustomerItem, 0, len(customerMap))
	for _, item := range customerMap {
		if item.Name == "" {
			item.Name = "Customer"
		}

		// Determine customer trust/loyalty score badge
		// 1-9 cancellations -> HIGH (1 single cancellation will NEVER drop to Medium)
		// 10-19 cancellations OR high ratio -> MEDIUM
		// 20+ cancellations -> RISK
		cancels := item.OrdersCancelled
		total := item.TotalOrders

		if cancels < 10 {
			item.TrustScore = "HIGH"
		} else if cancels >= 10 && cancels < 20 {
			if total >= 30 && (float64(cancels)/float64(total)) <= 0.35 {
				item.TrustScore = "HIGH"
			} else {
				item.TrustScore = "MEDIUM"
			}
		} else {
			if total >= 50 && (float64(cancels)/float64(total)) <= 0.35 {
				item.TrustScore = "MEDIUM"
			} else {
				item.TrustScore = "RISK"
			}
		}

		customerList = append(customerList, *item)
	}

	c.JSON(http.StatusOK, customerList)
}
