package handlers

import (
	"context"
	"fmt"
	"math/rand"
	"net/http"
	"regexp"
	"strings"
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
	OrderStatus       string `json:"order_status"`
	Status            string `json:"status"`
	PaymentStatus     string `json:"payment_status"`
	PaymentMethod     string `json:"payment_method"`
	CustomerName      string `json:"customer_name"`
	CustomerPhone     string `json:"customer_phone"`
	CustomerEmail     string `json:"customer_email"`
	ShippingAddress   string `json:"shipping_address"`
	CourierPartner    string `json:"courier_partner"`
	CourierName       string `json:"courier_name"`
	AWBNumber         string `json:"awb_number"`
	TrackingNumber    string `json:"tracking_number"`
	RazorpayPaymentID string `json:"razorpay_payment_id"`
	RazorpayOrderID   string `json:"razorpay_order_id"`
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

		// Enforce mandatory customer profile & shipping details
		if strings.TrimSpace(order.CustomerName) == "" || strings.TrimSpace(order.CustomerPhone) == "" || strings.TrimSpace(order.ShippingAddress) == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Customer name, mobile number, and complete delivery address are mandatory to place an order"})
			return
		}

		productCollection := db.GetCollection("products")

		// 1. Strict Price & Stock Integrity Shield (Prevents Price Tampering Attacks)
		var verifiedTotal float64
		for i, item := range order.Items {
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
					// Security Shield: Overwrite client payload price with authoritative DB price
					order.Items[i].Price = p.Price
					verifiedTotal += p.Price * float64(item.Quantity)
				}
			} else {
				verifiedTotal += item.Price * float64(item.Quantity)
			}
		}

		if order.DiscountAmount > 0 {
			verifiedTotal = verifiedTotal - order.DiscountAmount
			if verifiedTotal < 0 {
				verifiedTotal = 0
			}
		}

		// ArrowCoins Redemption Shield & Verification (Max 20% Cap)
		var userObj models.UserProfile
		usersCol := db.GetCollection("users")
		userFilter := bson.M{
			"$or": []bson.M{
				{"phone": order.CustomerPhone},
				{"email": order.CustomerEmail},
			},
		}
		_ = usersCol.FindOne(ctx, userFilter).Decode(&userObj)

		loyaltyCfg := GetLoyaltyConfig(ctx)
		maxUsableCap := (verifiedTotal * (loyaltyCfg.MaxRedemptionPct / 100.0))

		if order.CoinsRedeemed > 0 {
			if userObj.ID.IsZero() {
				order.CoinsRedeemed = 0
			} else {
				if order.CoinsRedeemed > userObj.CoinBalance {
					order.CoinsRedeemed = userObj.CoinBalance
				}
				if order.CoinsRedeemed > maxUsableCap {
					order.CoinsRedeemed = maxUsableCap
				}

				discountInINR := order.CoinsRedeemed * loyaltyCfg.ConversionRate
				verifiedTotal = verifiedTotal - discountInINR
				if verifiedTotal < 0 {
					verifiedTotal = 0
				}
			}
		}

		// Evaluate Tier for Cashback Earning
		currentTier := "SILVER"
		if !userObj.ID.IsZero() {
			currentTier, _ = EvaluateUserTier(ctx, userObj.ID, userObj.Phone, userObj.Email)
		}

		// Check for custom coins earned overrides on products in cart
		var customCoinsSum float64
		for _, item := range order.Items {
			if item.ProductID != "" {
				if objID, err := primitive.ObjectIDFromHex(item.ProductID); err == nil {
					var p models.Product
					if err := productCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&p); err == nil && p.CustomCoinsEarned != nil && *p.CustomCoinsEarned > 0 {
						customCoinsSum += (*p.CustomCoinsEarned) * float64(item.Quantity)
					}
				}
			}
		}

		earnedCoins := CalculateCashbackForOrder(currentTier, verifiedTotal)
		if customCoinsSum > 0 {
			earnedCoins = customCoinsSum
		}
		order.CoinsEarned = earnedCoins

		order.OrderID = generateReadableOrderID()
		order.CreatedAt = time.Now()
		order.TotalAmount = verifiedTotal

		if order.PaymentMethod == "ONLINE" {
			order.OrderStatus = "PENDING_PAYMENT"
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
			order.OrderStatus = "CONFIRMED"
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

		// Record ArrowCoins Debit (Redemption) and Pending Credit Transactions
		if !userObj.ID.IsZero() {
			txCol := db.GetCollection("coin_transactions")
			now := time.Now()

			if order.CoinsRedeemed > 0 {
				_, _ = usersCol.UpdateOne(ctx, bson.M{"_id": userObj.ID}, bson.M{
					"$inc": bson.M{"coin_balance": -order.CoinsRedeemed},
					"$set": bson.M{"updated_at": now},
				})
				debitTx := models.CoinTransaction{
					ID:          primitive.NewObjectID(),
					UserID:      userObj.ID,
					OrderID:     &order.ID,
					OrderCode:   order.OrderID,
					Amount:      order.CoinsRedeemed,
					Type:        "DEBIT",
					Status:      "USED",
					Description: fmt.Sprintf("Redeemed ArrowCoins on Order #%s", order.OrderID),
					CreatedAt:   now,
				}
				_, _ = txCol.InsertOne(ctx, debitTx)
			}

			if earnedCoins > 0 {
				creditTx := models.CoinTransaction{
					ID:          primitive.NewObjectID(),
					UserID:      userObj.ID,
					OrderID:     &order.ID,
					OrderCode:   order.OrderID,
					Amount:      earnedCoins,
					Type:        "CREDIT",
					Status:      "PENDING",
					Description: fmt.Sprintf("Cashback for Order #%s (%s Tier)", order.OrderID, currentTier),
					CreatedAt:   now,
				}
				_, _ = txCol.InsertOne(ctx, creditTx)
			}
		}

		// 2. Mark abandoned cart sessions as COMPLETED for this customer
		go func(phone, email string) {
			bgCtx, bgCancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer bgCancel()
			cartCol := db.GetCollection("abandoned_carts")
			filter := bson.M{"$or": []bson.M{{"customer_phone": phone}, {"customer_email": email}}}
			_, _ = cartCol.UpdateMany(bgCtx, filter, bson.M{"$set": bson.M{"status": "COMPLETED"}})
		}(order.CustomerPhone, order.CustomerEmail)

		// 3. Increment coupon usage count if coupon was used
		if order.CouponCode != "" {
			go func(code string) {
				bgCtx, bgCancel := context.WithTimeout(context.Background(), 5*time.Second)
				defer bgCancel()
				coupCol := db.GetCollection("coupons")
				_, _ = coupCol.UpdateOne(bgCtx, bson.M{"code": strings.ToUpper(code)}, bson.M{"$inc": bson.M{"used_count": 1}})
			}(order.CouponCode)
		}

		// 4. Atomically decrement stock in MongoDB upon successful order creation
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
				"order_status":        "CONFIRMED",
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
		order.OrderStatus = "CONFIRMED"
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

	rawQuery := strings.TrimSpace(c.Param("id"))
	collection := db.GetCollection("orders")

	// Strip non-digit characters to handle phone searches flexibly
	cleanDigits := regexp.MustCompile(`\D`).ReplaceAllString(rawQuery, "")

	var filter bson.M
	if len(cleanDigits) >= 10 {
		filter = bson.M{
			"$or": []bson.M{
				{"order_id": bson.M{"$regex": primitive.Regex{Pattern: regexp.QuoteMeta(rawQuery), Options: "i"}}},
				{"customer_phone": bson.M{"$regex": primitive.Regex{Pattern: cleanDigits, Options: "i"}}},
				{"customer_email": bson.M{"$regex": primitive.Regex{Pattern: regexp.QuoteMeta(rawQuery), Options: "i"}}},
			},
		}
	} else {
		filter = bson.M{
			"$or": []bson.M{
				{"order_id": bson.M{"$regex": primitive.Regex{Pattern: regexp.QuoteMeta(rawQuery), Options: "i"}}},
				{"customer_phone": bson.M{"$regex": primitive.Regex{Pattern: regexp.QuoteMeta(rawQuery), Options: "i"}}},
				{"customer_email": bson.M{"$regex": primitive.Regex{Pattern: regexp.QuoteMeta(rawQuery), Options: "i"}}},
				{"razorpay_order_id": rawQuery},
			},
		}
	}

	// Always sort by created_at DESC so the LATEST / NEWEST order is fetched first
	findOpts := options.Find().SetSort(bson.M{"created_at": -1}).SetLimit(10)
	cursor, err := collection.Find(ctx, filter, findOpts)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Order not found",
			"query":   rawQuery,
			"message": "No active order matches the provided Order ID, Email, or Phone Number",
		})
		return
	}
	defer cursor.Close(ctx)

	var orders []models.Order
	if err := cursor.All(ctx, &orders); err != nil || len(orders) == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Order not found",
			"query":   rawQuery,
			"message": "No active order matches the provided Order ID, Email, or Phone Number",
		})
		return
	}

	latestOrder := orders[0]

	// Dynamic delivery ETA calculation based on customer pincode in shipping address
	deliveryHours := 120
	etaDaysText := "4-6 Business Days"
	if strings.Contains(latestOrder.ShippingAddress, "700") || strings.Contains(latestOrder.ShippingAddress, "71") || strings.Contains(latestOrder.ShippingAddress, "72") || strings.Contains(latestOrder.ShippingAddress, "73") || strings.Contains(latestOrder.ShippingAddress, "74") {
		deliveryHours = 72
		etaDaysText = "2-3 Business Days"
	} else if strings.Contains(latestOrder.ShippingAddress, "110") || strings.Contains(latestOrder.ShippingAddress, "400") || strings.Contains(latestOrder.ShippingAddress, "560") || strings.Contains(latestOrder.ShippingAddress, "600") || strings.Contains(latestOrder.ShippingAddress, "500") {
		deliveryHours = 96
		etaDaysText = "3-4 Business Days"
	}
	etaDate := fmt.Sprintf("%s (%s)", latestOrder.CreatedAt.Add(time.Duration(deliveryHours)*time.Hour).Format("02 Jan 2006"), etaDaysText)

	courier := latestOrder.CourierPartner
	if courier == "" {
		courier = latestOrder.CourierName
	}
	awb := latestOrder.AWBNumber
	if awb == "" {
		awb = latestOrder.TrackingNumber
	}

	// Prepare history of all orders for this customer query
	type CompactOrder struct {
		OrderID     string    `json:"order_id"`
		OrderStatus string    `json:"order_status"`
		TotalAmount float64   `json:"total_amount"`
		CreatedAt   time.Time `json:"created_at"`
	}

	var allOrdersList []CompactOrder
	for _, o := range orders {
		allOrdersList = append(allOrdersList, CompactOrder{
			OrderID:     o.OrderID,
			OrderStatus: o.OrderStatus,
			TotalAmount: o.TotalAmount,
			CreatedAt:   o.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"order_id":               latestOrder.OrderID,
		"customer_name":          latestOrder.CustomerName,
		"customer_phone":         latestOrder.CustomerPhone,
		"customer_email":         latestOrder.CustomerEmail,
		"shipping_address":       latestOrder.ShippingAddress,
		"total_amount":           latestOrder.TotalAmount,
		"payment_method":         latestOrder.PaymentMethod,
		"payment_status":         latestOrder.PaymentStatus,
		"order_status":           latestOrder.OrderStatus,
		"courier_partner":        courier,
		"courier_name":           courier,
		"awb_number":             awb,
		"tracking_number":        awb,
		"shiprocket_order_id":    latestOrder.ShiprocketOrderID,
		"shiprocket_shipment_id": latestOrder.ShiprocketShipmentID,
		"delivery_eta":           etaDate,
		"items":                  latestOrder.Items,
		"created_at":             latestOrder.CreatedAt,
		"recent_orders":          allOrdersList,
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

	cleanDigits := CleanPhoneDigits(phone)

	orConditions := []bson.M{}
	if cleanDigits != "" && len(cleanDigits) >= 10 {
		orConditions = append(orConditions, bson.M{"customer_phone": bson.M{"$regex": primitive.Regex{Pattern: cleanDigits, Options: "i"}}})
	} else if phone != "" {
		orConditions = append(orConditions, bson.M{"customer_phone": phone})
	}
	if email != "" {
		orConditions = append(orConditions, bson.M{"customer_email": bson.M{"$regex": primitive.Regex{Pattern: regexp.QuoteMeta(email), Options: "i"}}})
	}

	filter := bson.M{}
	if len(orConditions) > 0 {
		filter["$or"] = orConditions
	}

	findOptions := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}, {Key: "_id", Value: -1}})
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
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")
	collection := db.GetCollection("orders")

	filter := bson.M{}
	if status != "" && status != "ALL" {
		filter["order_status"] = status
	}

	if startDateStr != "" || endDateStr != "" {
		dateFilter := bson.M{}
		if startDateStr != "" {
			if tStart, err := time.Parse("2006-01-02", startDateStr); err == nil {
				dateFilter["$gte"] = tStart
			}
		}
		if endDateStr != "" {
			if tEnd, err := time.Parse("2006-01-02", endDateStr); err == nil {
				dateFilter["$lte"] = tEnd.Add(24*time.Hour - time.Second)
			}
		}
		if len(dateFilter) > 0 {
			filter["created_at"] = dateFilter
		}
	}

	findOptions := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}, {Key: "_id", Value: -1}})
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

	updateFields := bson.M{}
	if targetStatus != "" {
		updateFields["order_status"] = targetStatus
	}
	if payload.PaymentStatus != "" {
		updateFields["payment_status"] = payload.PaymentStatus
	}
	if payload.PaymentMethod != "" {
		updateFields["payment_method"] = payload.PaymentMethod
	}
	if payload.CustomerName != "" {
		updateFields["customer_name"] = payload.CustomerName
	}
	if payload.CustomerPhone != "" {
		updateFields["customer_phone"] = payload.CustomerPhone
	}
	if payload.CustomerEmail != "" {
		updateFields["customer_email"] = payload.CustomerEmail
	}
	if payload.ShippingAddress != "" {
		updateFields["shipping_address"] = payload.ShippingAddress
	}
	if payload.RazorpayPaymentID != "" {
		updateFields["razorpay_payment_id"] = payload.RazorpayPaymentID
	}
	if payload.RazorpayOrderID != "" {
		updateFields["razorpay_order_id"] = payload.RazorpayOrderID
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

	// ArrowCoins Refund & Cancellation logic if order is cancelled or returned
	isCancelledOrReturned := targetStatus == "CANCELLED" || targetStatus == "RETURNED" || targetStatus == "RTO" || targetStatus == "REFUNDED"
	if isCancelledOrReturned && existingOrder.OrderStatus != targetStatus {
		txCol := db.GetCollection("coin_transactions")
		usersCol := db.GetCollection("users")
		now := time.Now()

		// 1. Mark pending credit cashback transaction as CANCELLED with 0 balance credited
		_, _ = txCol.UpdateMany(ctx, bson.M{
			"order_code": existingOrder.OrderID,
			"type":       "CREDIT",
			"status":     "PENDING",
		}, bson.M{
			"$set": bson.M{"status": "CANCELLED"},
		})

		// 2. Refund used coins if customer redeemed ArrowCoins on this order
		if existingOrder.CoinsRedeemed > 0 {
			var debitTx models.CoinTransaction
			if err := txCol.FindOne(ctx, bson.M{"order_code": existingOrder.OrderID, "type": "DEBIT"}).Decode(&debitTx); err == nil {
				var checkRefund models.CoinTransaction
				if err := txCol.FindOne(ctx, bson.M{"order_code": existingOrder.OrderID, "type": "REFUND"}).Decode(&checkRefund); err != nil {
					expiresAt := now.AddDate(1, 0, 0)
					refundTx := models.CoinTransaction{
						ID:          primitive.NewObjectID(),
						UserID:      debitTx.UserID,
						OrderID:     &existingOrder.ID,
						OrderCode:   existingOrder.OrderID,
						Amount:      existingOrder.CoinsRedeemed,
						Type:        "REFUND",
						Status:      "ACTIVE",
						Description: fmt.Sprintf("Refund of used ArrowCoins for %s Order #%s", targetStatus, existingOrder.OrderID),
						CreatedAt:   now,
						ActivatedAt: &now,
						ExpiresAt:   &expiresAt,
					}
					_, _ = txCol.InsertOne(ctx, refundTx)

					_, _ = usersCol.UpdateOne(ctx, bson.M{"_id": debitTx.UserID}, bson.M{
						"$inc": bson.M{"coin_balance": existingOrder.CoinsRedeemed},
						"$set": bson.M{"updated_at": now},
					})
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
