package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TicketMessage struct {
	ID         string    `json:"id,omitempty" bson:"id,omitempty"`
	Sender     string    `json:"sender" bson:"sender"`           // "customer" or "admin"
	SenderName string    `json:"sender_name" bson:"sender_name"` // "Customer" or "Support Team"
	Message    string    `json:"message" bson:"message"`
	MediaURL   string    `json:"media_url,omitempty" bson:"media_url,omitempty"`
	MediaType  string    `json:"media_type,omitempty" bson:"media_type,omitempty"` // "image" or "video"
	CreatedAt  time.Time `json:"created_at" bson:"created_at"`
}

type SupportTicket struct {
	ID            primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	TicketID      string             `json:"ticket_id" bson:"ticket_id"` // TICK-XXXX
	CustomerPhone string             `json:"customer_phone" bson:"customer_phone"`
	CustomerEmail string             `json:"customer_email" bson:"customer_email"`
	Category      string             `json:"category" bson:"category"`
	IssueText     string             `json:"issue_text" bson:"issue_text" binding:"required"`
	ImageURL      string             `json:"image_url" bson:"image_url"`
	Status                string             `json:"status" bson:"status"`     // OPEN, IN_PROGRESS, RESOLVED, CLOSED
	Priority              string             `json:"priority" bson:"priority"` // HIGH, MEDIUM, LOW
	AllowMediaAttachment  bool               `json:"allow_media_attachment" bson:"allow_media_attachment"`
	Messages              []TicketMessage    `json:"messages" bson:"messages"`
	CreatedAt             time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt     time.Time          `json:"updated_at" bson:"updated_at"`
	ClosedAt      *time.Time         `json:"closed_at,omitempty" bson:"closed_at,omitempty"`
}

type AdminUser struct {
	ID        primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Username  string             `json:"username" bson:"username"`
	Password  string             `json:"password" bson:"password"` // Hashed
	Role      string             `json:"role" bson:"role"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
}
