package handlers

import (
	"context"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"shadow-arrow-backend/config"
	"shadow-arrow-backend/db"
	"shadow-arrow-backend/models"
	"shadow-arrow-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type VerifyPaymentPayload struct {
	OrderID           string `json:"order_id" binding:"required"`
	RazorpayOrderID   string `json:"razorpay_order_id"`
	RazorpayPaymentID string `json:"razorpay_payment_id" binding:"required"`
	RazorpaySignature string `json:"razorpay_signature" binding:"required"`
}

type UpdateStatusPayload struct {
	OrderStatus    string `json:"order_status" binding:"required"`
	Status         string `json:"status"`
	CourierPartner string `json:"courier_partner"`
	CourierName    string `json:"courier_name"`
	AWBNumber      string `json:"awb_number"`
	TrackingNumber string `json:"tracking_number"`
}

func generateReadableOrderID() string {
	dateStr := time.Now().Format("20060102")
	randomNum := rand.Intn(9000) + 1000
	return fmt.Sprintf("SA-%s-%d", dateStr, randomNum)
}

func CreateOrder(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var order models.Order
		if err := c.ShouldBindJSON(&order); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if len(order.Items) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Order items cannot be empty"})
			return
		}

		productCollection := db.GetCollection("products")

		// 1. Strict Atomic Inventory Validation before creating order
		for _, item := range order.Items {
			if item.ProductID != "" {
				if objID, err := primitive.ObjectIDFromHex(item.ProductID); err == nil {
					var p models.Product
					err := productCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&p)
					if err != nil {
						c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Product %s not found", item.Title)})
						return
					}
					if p.Stock < item.Quantity || p.Stock <= 0 {
						c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Item '%s' is out of stock", p.Title)})
						return
					}
				}
			}
		}

		order.OrderID = generateReadableOrderID()
		order.CreatedAt = time.Now()
		order.OrderStatus = "CONFIRMED"

		// Calculate total if not provided
		if order.TotalAmount <= 0 {
			var total float64
			for _, item := range order.Items {
				total += item.Price * float64(item.Quantity)
			}
			order.TotalAmount = total
		}

		if order.PaymentMethod == "ONLINE" {
			order.PaymentStatus = "PENDING"
			razorpayOrderID, err := utils.CreateRazorpayOrder(
				order.TotalAmount,
				order.OrderID,
				cfg.RazorpayKeyID,
				cfg.RazorpayKeySecret,
			)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment order"})
				return
			}
			order.RazorpayOrderID = razorpayOrderID
		} else {
			order.PaymentMethod = "COD"
			order.PaymentStatus = "PENDING"

			// Trigger automatic Shiprocket dispatch for COD orders
			go func(ord models.Order) {
				srOrderID, srShipmentID, err := utils.DispatchToShiprocket(&ord)
				if err == nil && (srOrderID > 0 || srShipmentID > 0) {
					bgCtx, bgCancel := context.WithTimeout(context.Background(), 5*time.Second)
					defer bgCancel()
					db.GetCollection("orders").UpdateOne(
						bgCtx,
						bson.M{"order_id": ord.OrderID},
						bson.M{"$set": bson.M{
							"shiprocket_order_id":    srOrderID,
							"shiprocket_shipment_id": srShipmentID,
						}},
					)
				}
			}(order)
		}

		orderCollection := db.GetCollection("orders")
		result, err := orderCollection.InsertOne(ctx, order)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save order to database"})
			return
		}

		order.ID = result.InsertedID.(primitive.ObjectID)

		// 2. Atomically decrement stock in MongoDB upon successful order creation
		for _, item := range order.Items {
			if item.ProductID != "" {
				if objID, err := primitive.ObjectIDFromHex(item.ProductID); err == nil {
					_ = productCollection.FindOneAndUpdate(
						ctx,
						bson.M{"_id": objID, "stock": bson.M{"$gte": item.Quantity}},
						bson.M{"$inc": bson.M{"stock": -item.Quantity}},
					)
				}
			}
		}

		c.JSON(http.StatusCreated, order)
	}
}

func VerifyPayment(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var payload VerifyPaymentPayload
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		collection := db.GetCollection("orders")

		var order models.Order
		err := collection.FindOne(ctx, bson.M{"order_id": payload.OrderID}).Decode(&order)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
			return
		}

		rzpOrderID := payload.RazorpayOrderID
		if rzpOrderID == "" {
			rzpOrderID = order.RazorpayOrderID
		}

		isValid := utils.VerifyRazorpaySignature(
			rzpOrderID,
			payload.RazorpayPaymentID,
			payload.RazorpaySignature,
			cfg.RazorpayKeySecret,
		)

		if !isValid {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment signature verification"})
			return
		}

		update := bson.M{
			"$set": bson.M{
				"payment_status":      "PAID",
				"razorpay_payment_id": payload.RazorpayPaymentID,
				"razorpay_signature":  payload.RazorpaySignature,
			},
		}

		_, err = collection.UpdateOne(ctx, bson.M{"order_id": payload.OrderID}, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order payment status"})
			return
		}

		order.PaymentStatus = "PAID"
		order.RazorpayPaymentID = payload.RazorpayPaymentID
		order.RazorpaySignature = payload.RazorpaySignature

		// Trigger automatic Shiprocket dispatch upon successful Prepaid payment verification
		go func(ord models.Order) {
			srOrderID, srShipmentID, err := utils.DispatchToShiprocket(&ord)
			if err == nil && (srOrderID > 0 || srShipmentID > 0) {
				bgCtx, bgCancel := context.WithTimeout(context.Background(), 5*time.Second)
				defer bgCancel()
				db.GetCollection("orders").UpdateOne(
					bgCtx,
					bson.M{"order_id": ord.OrderID},
					bson.M{"$set": bson.M{
						"shiprocket_order_id":    srOrderID,
						"shiprocket_shipment_id": srShipmentID,
					}},
				)
			}
		}(order)

		c.JSON(http.StatusOK, gin.H{
			"message":        "Payment verified successfully",
			"order_id":       payload.OrderID,
			"payment_status": "PAID",
		})
	}
}

func TrackOrder(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	queryParam := c.Param("id")
	collection := db.GetCollection("orders")

	var order models.Order
	var err error

	err = collection.FindOne(ctx, bson.M{
		"$or": []bson.M{
			{"order_id": queryParam},
			{"customer_phone": queryParam},
			{"customer_email": queryParam},
			{"razorpay_order_id": queryParam},
		},
	}).Decode(&order)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Order not found",
			"query":   queryParam,
			"message": "No active order matches the provided Order ID, Email, or Phone Number",
		})
		return
	}

	etaDate := order.CreatedAt.Add(96 * time.Hour).Format("02 Jan 2006")

	courier := order.CourierPartner
	if courier == "" {
		courier = order.CourierName
	}
	awb := order.AWBNumber
	if awb == "" {
		awb = order.TrackingNumber
	}

	c.JSON(http.StatusOK, gin.H{
		"order_id":               order.OrderID,
		"customer_name":          order.CustomerName,
		"customer_phone":         order.CustomerPhone,
		"customer_email":         order.CustomerEmail,
		"shipping_address":       order.ShippingAddress,
		"total_amount":           order.TotalAmount,
		"payment_method":         order.PaymentMethod,
		"payment_status":         order.PaymentStatus,
		"order_status":           order.OrderStatus,
		"courier_partner":        courier,
		"courier_name":           courier,
		"awb_number":             awb,
		"tracking_number":        awb,
		"shiprocket_order_id":    order.ShiprocketOrderID,
		"shiprocket_shipment_id": order.ShiprocketShipmentID,
		"delivery_eta":           etaDate,
		"items":                  order.Items,
		"created_at":             order.CreatedAt,
	})
}

func GetUserOrders(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	phone := c.Query("phone")
	email := c.Query("email")

	if phone == "" && email == "" {
		phone = c.Query("id")
	}

	if phone == "" && email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Phone number or email query parameter required"})
		return
	}

	collection := db.GetCollection("orders")

	filter := bson.M{}
	if phone != "" && email != "" {
		filter["$or"] = []bson.M{
			{"customer_phone": phone},
			{"customer_email": email},
		}
	} else if phone != "" {
		filter["customer_phone"] = phone
	} else {
		filter["customer_email"] = email
	}

	findOptions := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := collection.Find(ctx, filter, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user orders"})
		return
	}
	defer cursor.Close(ctx)

	var orders []models.Order
	if err = cursor.All(ctx, &orders); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode user orders"})
		return
	}

	if orders == nil {
		orders = []models.Order{}
	}

	// Normalize courier and awb fields in output
	for i := range orders {
		if orders[i].CourierPartner == "" && orders[i].CourierName != "" {
			orders[i].CourierPartner = orders[i].CourierName
		}
		if orders[i].CourierName == "" && orders[i].CourierPartner != "" {
			orders[i].CourierName = orders[i].CourierPartner
		}
		if orders[i].AWBNumber == "" && orders[i].TrackingNumber != "" {
			orders[i].AWBNumber = orders[i].TrackingNumber
		}
		if orders[i].TrackingNumber == "" && orders[i].AWBNumber != "" {
			orders[i].TrackingNumber = orders[i].AWBNumber
		}
	}

	c.JSON(http.StatusOK, orders)
}

func GetAdminOrders(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	status := c.Query("status")
	collection := db.GetCollection("orders")

	filter := bson.M{}
	if status != "" && status != "ALL" {
		filter["order_status"] = status
	}

	findOptions := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := collection.Find(ctx, filter, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}
	defer cursor.Close(ctx)

	var orders []models.Order
	if err = cursor.All(ctx, &orders); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode orders"})
		return
	}

	if orders == nil {
		orders = []models.Order{}
	}

	for i := range orders {
		if orders[i].CourierPartner == "" && orders[i].CourierName != "" {
			orders[i].CourierPartner = orders[i].CourierName
		}
		if orders[i].CourierName == "" && orders[i].CourierPartner != "" {
			orders[i].CourierName = orders[i].CourierPartner
		}
		if orders[i].AWBNumber == "" && orders[i].TrackingNumber != "" {
			orders[i].AWBNumber = orders[i].TrackingNumber
		}
		if orders[i].TrackingNumber == "" && orders[i].AWBNumber != "" {
			orders[i].TrackingNumber = orders[i].AWBNumber
		}
	}

	c.JSON(http.StatusOK, orders)
}

func UpdateOrderStatus(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	orderIDParam := c.Param("id")
	var payload UpdateStatusPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	targetStatus := payload.OrderStatus
	if targetStatus == "" {
		targetStatus = payload.Status
	}

	courier := payload.CourierPartner
	if courier == "" {
		courier = payload.CourierName
	}

	awb := payload.AWBNumber
	if awb == "" {
		awb = payload.TrackingNumber
	}

	collection := db.GetCollection("orders")

	var filter bson.M
	if objID, err := primitive.ObjectIDFromHex(orderIDParam); err == nil {
		filter = bson.M{"_id": objID}
	} else {
		filter = bson.M{"order_id": orderIDParam}
	}

	var existingOrder models.Order
	_ = collection.FindOne(ctx, filter).Decode(&existingOrder)

	updateFields := bson.M{
		"order_status": targetStatus,
	}

	if courier != "" {
		updateFields["courier_partner"] = courier
		updateFields["courier_name"] = courier
	}
	if awb != "" {
		updateFields["awb_number"] = awb
		updateFields["tracking_number"] = awb
	}

	if targetStatus == "REFUNDED" {
		updateFields["payment_status"] = "REFUNDED"
	}

	update := bson.M{"$set": updateFields}

	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil || result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found or update failed"})
		return
	}

	// Restock inventory if status changed to CANCELLED
	if targetStatus == "CANCELLED" && existingOrder.OrderStatus != "CANCELLED" {
		productCollection := db.GetCollection("products")
		for _, item := range existingOrder.Items {
			if item.ProductID != "" {
				if objID, err := primitive.ObjectIDFromHex(item.ProductID); err == nil {
					_ = productCollection.FindOneAndUpdate(
						ctx,
						bson.M{"_id": objID},
						bson.M{"$inc": bson.M{"stock": item.Quantity}},
					)
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":         "Order status and shipment details updated successfully",
		"order_status":    targetStatus,
		"courier_partner": courier,
		"courier_name":    courier,
		"awb_number":      awb,
		"tracking_number": awb,
	})
}
