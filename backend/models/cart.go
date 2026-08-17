package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CartSyncItem struct {
	ProductID string  `json:"product_id" bson:"product_id"`
	Title     string  `json:"title" bson:"title"`
	Price     float64 `json:"price" bson:"price"`
	Quantity  int     `json:"quantity" bson:"quantity"`
	Size      string  `json:"size" bson:"size"`
	Image     string  `json:"image" bson:"image"`
}

type AbandonedCart struct {
	ID            primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	SessionID     string             `json:"session_id" bson:"session_id"`
	CustomerName  string             `json:"customer_name" bson:"customer_name"`
	CustomerPhone string             `json:"customer_phone" bson:"customer_phone"`
	CustomerEmail string             `json:"customer_email" bson:"customer_email"`
	Items         []CartSyncItem     `json:"items" bson:"items"`
	TotalAmount   float64            `json:"total_amount" bson:"total_amount"`
	Status        string             `json:"status" bson:"status"` // ACTIVE, CHECKOUT_STARTED, ABANDONED, COMPLETED
	UpdatedAt     time.Time          `json:"updated_at" bson:"updated_at"`
}
