package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SavedAddress struct {
	ID        string `json:"id" bson:"id"`
	Name      string `json:"name" bson:"name"`
	Phone     string `json:"phone" bson:"phone"`
	Street    string `json:"street" bson:"street"`
	City      string `json:"city" bson:"city"`
	Pincode   string `json:"pincode" bson:"pincode"`
	IsDefault bool   `json:"is_default" bson:"is_default"`
}

type UserTier struct {
	CurrentTier     string     `json:"current_tier" bson:"current_tier"`
	LastEvaluatedAt *time.Time `json:"last_evaluated_at,omitempty" bson:"last_evaluated_at,omitempty"`
}

type UserProfile struct {
	ID                  primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	UID                 string             `json:"uid" bson:"uid"`
	Name                string             `json:"name" bson:"name"`
	Email               string             `json:"email" bson:"email"`
	Phone               string             `json:"phone" bson:"phone"`
	PhotoURL            string             `json:"photo_url" bson:"photo_url"`
	Addresses           []SavedAddress     `json:"addresses" bson:"addresses"`
	CoinBalance         float64            `json:"coin_balance" bson:"coin_balance"`
	Tier                UserTier           `json:"tier" bson:"tier"`
	DeletionRequested   bool               `json:"deletion_requested" bson:"deletion_requested"`
	DeletionRequestedAt *time.Time         `json:"deletion_requested_at,omitempty" bson:"deletion_requested_at,omitempty"`
	DeletionReason      string             `json:"deletion_reason,omitempty" bson:"deletion_reason,omitempty"`
	UpdatedAt           time.Time          `json:"updated_at" bson:"updated_at"`
	Token               string             `json:"token,omitempty" bson:"-"`
}
