package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Coupon struct {
	ID            primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Code          string             `json:"code" bson:"code" binding:"required"`
	Type          string             `json:"type" bson:"type" binding:"required"` // "PERCENTAGE" or "FLAT"
	DiscountValue float64            `json:"discount_value" bson:"discount_value" binding:"required"`
	MinOrderValue float64            `json:"min_order_value" bson:"min_order_value"`
	UsageLimit    int                `json:"usage_limit" bson:"usage_limit"`
	UsedCount     int                `json:"used_count" bson:"used_count"`
	Active        bool               `json:"active" bson:"active"`
	ExpiryDate    string             `json:"expiry_date" bson:"expiry_date"` // YYYY-MM-DD
	CreatedAt     time.Time          `json:"created_at" bson:"created_at"`
}
