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

	cartCollection := db.GetCollection("abandoned_carts")
	orderCollection := db.GetCollection("orders")

	seenKeys := make(map[string]bool)
	var combinedLeads []models.AbandonedCart

	// 1. Fetch unpaid / cancelled / pending online payment orders
	orderOpts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetLimit(50)
	orderFilter := bson.M{
		"payment_method": "ONLINE",
		"$or": []bson.M{
			{"payment_status": bson.M{"$ne": "PAID"}},
			{"order_status": "PENDING_PAYMENT"},
			{"order_status": "CANCELLED"},
		},
	}

	orderCursor, err := orderCollection.Find(ctx, orderFilter, orderOpts)
	if err == nil {
		var pendingOrders []models.Order
		if err := orderCursor.All(ctx, &pendingOrders); err == nil {
			for _, ord := range pendingOrders {
				key := ord.CustomerPhone
				if key == "" {
					key = ord.OrderID
				}
				if !seenKeys[key] {
					seenKeys[key] = true
					var cartItems []models.CartSyncItem
					for _, it := range ord.Items {
						cartItems = append(cartItems, models.CartSyncItem{
							ProductID: it.ProductID,
							Title:     it.Title,
							Price:     it.Price,
							Quantity:  it.Quantity,
							Size:      it.Size,
							Image:     it.Image,
						})
					}
					status := "PENDING_ONLINE_PAYMENT"
					if ord.OrderStatus == "CANCELLED" || ord.PaymentStatus == "CANCELLED" {
						status = "PAYMENT_CANCELLED"
					}
					combinedLeads = append(combinedLeads, models.AbandonedCart{
						SessionID:     ord.OrderID,
						CustomerName:  ord.CustomerName,
						CustomerPhone: ord.CustomerPhone,
						CustomerEmail: ord.CustomerEmail,
						Items:         cartItems,
						TotalAmount:   ord.TotalAmount,
						Status:        status,
						UpdatedAt:     ord.CreatedAt,
					})
				}
			}
		}
		orderCursor.Close(ctx)
	}

	// 2. Fetch active abandoned cart sessions from checkout
	cartOpts := options.Find().SetSort(bson.D{{Key: "updated_at", Value: -1}}).SetLimit(50)
	cartFilter := bson.M{
		"items":  bson.M{"$not": bson.M{"$size": 0}},
		"status": bson.M{"$ne": "COMPLETED"},
	}
	cartCursor, err := cartCollection.Find(ctx, cartFilter, cartOpts)
	if err == nil {
		var activeCarts []models.AbandonedCart
		if err := cartCursor.All(ctx, &activeCarts); err == nil {
			for _, ac := range activeCarts {
				key := ac.CustomerPhone
				if key == "" {
					key = ac.SessionID
				}
				if !seenKeys[key] {
					seenKeys[key] = true
					combinedLeads = append(combinedLeads, ac)
				}
			}
		}
		cartCursor.Close(ctx)
	}

	if combinedLeads == nil {
		combinedLeads = []models.AbandonedCart{}
	}

	c.JSON(http.StatusOK, combinedLeads)
}
