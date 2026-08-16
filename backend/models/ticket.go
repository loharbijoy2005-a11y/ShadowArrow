package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SupportTicket struct {
	ID            primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	TicketID      string             `json:"ticket_id" bson:"ticket_id"` // TICK-XXXX
	CustomerPhone string             `json:"customer_phone" bson:"customer_phone"`
	CustomerEmail string             `json:"customer_email" bson:"customer_email"`
	Category      string             `json:"category" bson:"category"`
	IssueText     string             `json:"issue_text" bson:"issue_text" binding:"required"`
	ImageURL      string             `json:"image_url" bson:"image_url"`
	Status        string             `json:"status" bson:"status"`     // OPEN, IN_PROGRESS, RESOLVED
	Priority      string             `json:"priority" bson:"priority"` // HIGH, MEDIUM, LOW
	CreatedAt     time.Time          `json:"created_at" bson:"created_at"`
}

type AdminUser struct {
	ID        primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Username  string             `json:"username" bson:"username"`
	Password  string             `json:"password" bson:"password"` // Hashed
	Role      string             `json:"role" bson:"role"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
}
