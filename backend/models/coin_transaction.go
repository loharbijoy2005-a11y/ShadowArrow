package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// CoinTransaction represents an ArrowCoins transaction entry
type CoinTransaction struct {
	ID          primitive.ObjectID  `json:"id,omitempty" bson:"_id,omitempty"`
	UserID      primitive.ObjectID  `json:"user_id" bson:"user_id"`
	OrderID     *primitive.ObjectID `json:"order_id,omitempty" bson:"order_id,omitempty"`
	OrderCode   string              `json:"order_code,omitempty" bson:"order_code,omitempty"`
	Amount      float64             `json:"amount" bson:"amount"`
	Type        string              `json:"type" bson:"type"`     // CREDIT, DEBIT, REFUND
	Status      string              `json:"status" bson:"status"` // PENDING, ACTIVE, USED, EXPIRED, CANCELLED
	Description string              `json:"description" bson:"description"`
	CreatedAt   time.Time           `json:"created_at" bson:"created_at"`
	ActivatedAt *time.Time          `json:"activated_at,omitempty" bson:"activated_at,omitempty"`
	ExpiresAt   *time.Time          `json:"expires_at,omitempty" bson:"expires_at,omitempty"`
}

type LoyaltyConfig struct {
	ID                 primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	ConversionRate     float64            `json:"conversion_rate" bson:"conversion_rate"`         // 1 Coin = X INR (default 1)
	MaxRedemptionPct   float64            `json:"max_redemption_pct" bson:"max_redemption_pct"`   // e.g. 20 for 20% cap
	ReturnHoldDelayDays int               `json:"return_hold_delay_days" bson:"return_hold_delay_days"` // default 7
	UpdatedAt          time.Time          `json:"updated_at" bson:"updated_at"`
}
