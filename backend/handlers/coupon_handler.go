package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"shadow-arrow-backend/db"
	"shadow-arrow-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ValidateCouponRequest struct {
	Code      string  `json:"code" binding:"required"`
	CartTotal float64 `json:"cart_total" binding:"required"`
}

func GetCoupons(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := db.GetCollection("coupons")
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch coupons"})
		return
	}
	defer cursor.Close(ctx)

	var coupons []models.Coupon
	if err = cursor.All(ctx, &coupons); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode coupons"})
		return
	}

	if coupons == nil {
		coupons = []models.Coupon{}
	}

	c.JSON(http.StatusOK, coupons)
}

func CreateCoupon(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var coupon models.Coupon
	if err := c.ShouldBindJSON(&coupon); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	coupon.Code = strings.ToUpper(strings.TrimSpace(coupon.Code))
	coupon.CreatedAt = time.Now()
	coupon.Active = true

	collection := db.GetCollection("coupons")

	// Check if coupon code already exists
	var existing models.Coupon
	err := collection.FindOne(ctx, bson.M{"code": coupon.Code}).Decode(&existing)
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Coupon code already exists"})
		return
	}

	result, err := collection.InsertOne(ctx, coupon)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create coupon"})
		return
	}

	coupon.ID = result.InsertedID.(primitive.ObjectID)
	c.JSON(http.StatusCreated, gin.H{
		"message": "Coupon created successfully",
		"coupon":  coupon,
	})
}

func ToggleCouponStatus(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	couponID := c.Param("id")
	collection := db.GetCollection("coupons")

	var filter bson.M
	if objID, err := primitive.ObjectIDFromHex(couponID); err == nil {
		filter = bson.M{"_id": objID}
	} else {
		filter = bson.M{"code": strings.ToUpper(couponID)}
	}

	var existing models.Coupon
	if err := collection.FindOne(ctx, filter).Decode(&existing); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Coupon not found"})
		return
	}

	update := bson.M{"$set": bson.M{"active": !existing.Active}}
	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to toggle coupon status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Coupon status updated",
		"active":  !existing.Active,
	})
}

func DeleteCoupon(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	couponID := c.Param("id")
	collection := db.GetCollection("coupons")

	var filter bson.M
	if objID, err := primitive.ObjectIDFromHex(couponID); err == nil {
		filter = bson.M{"_id": objID}
	} else {
		filter = bson.M{"code": strings.ToUpper(couponID)}
	}

	res, err := collection.DeleteOne(ctx, filter)
	if err != nil || res.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Coupon not found or delete failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Coupon deleted successfully"})
}

func ValidateCoupon(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var req ValidateCouponRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	codeUpper := strings.ToUpper(strings.TrimSpace(req.Code))
	collection := db.GetCollection("coupons")

	var coupon models.Coupon
	err := collection.FindOne(ctx, bson.M{"code": codeUpper}).Decode(&coupon)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid coupon code"})
		return
	}

	if !coupon.Active {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This coupon code is currently disabled"})
		return
	}

	if coupon.UsageLimit > 0 && coupon.UsedCount >= coupon.UsageLimit {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Coupon usage limit has been reached"})
		return
	}

	if coupon.MinOrderValue > 0 && req.CartTotal < coupon.MinOrderValue {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Minimum cart value of ₹%.0f required for this coupon", coupon.MinOrderValue)})
		return
	}

	if coupon.ExpiryDate != "" {
		if expTime, err := time.Parse("2006-01-02", coupon.ExpiryDate); err == nil {
			// Compare date (end of day)
			expTime = expTime.Add(23*time.Hour + 59*time.Minute)
			if time.Now().After(expTime) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "This coupon code has expired"})
				return
			}
		}
	}

	var discountAmount float64
	if coupon.Type == "PERCENTAGE" {
		discountAmount = (req.CartTotal * coupon.DiscountValue) / 100.0
	} else {
		discountAmount = coupon.DiscountValue
	}

	if discountAmount > req.CartTotal {
		discountAmount = req.CartTotal
	}

	finalTotal := req.CartTotal - discountAmount
	if finalTotal < 0 {
		finalTotal = 0
	}

	c.JSON(http.StatusOK, gin.H{
		"valid":           true,
		"code":            coupon.Code,
		"type":            coupon.Type,
		"discount_value":  coupon.DiscountValue,
		"discount_amount": discountAmount,
		"final_total":     finalTotal,
		"message":         fmt.Sprintf("Coupon %s applied! Saved ₹%.2f", coupon.Code, discountAmount),
	})
}
