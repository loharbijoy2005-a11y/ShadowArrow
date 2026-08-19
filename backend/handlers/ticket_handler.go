package handlers

import (
	"context"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"shadow-arrow-backend/db"
	"shadow-arrow-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type UpdateTicketStatusPayload struct {
	Status string `json:"status" binding:"required"`
}

type ReplyTicketPayload struct {
	Sender     string `json:"sender" binding:"required"` // "customer" or "admin"
	SenderName string `json:"sender_name"`
	Message    string `json:"message" binding:"required"`
	MediaURL   string `json:"media_url"`
	MediaType  string `json:"media_type"` // "image" or "video"
}

func generateTicketID() string {
	return fmt.Sprintf("TICK-%d", rand.Intn(9000)+1000)
}

func CreateTicket(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var ticket models.SupportTicket
	if err := c.ShouldBindJSON(&ticket); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Enforce strict size limit on base64 image attachments (Max 3MB binary, approx 4MB base64)
	if len(ticket.ImageURL) > 4*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Attached image size must be under 3MB"})
		return
	}

	now := time.Now()
	ticket.TicketID = generateTicketID()
	ticket.CreatedAt = now
	ticket.UpdatedAt = now
	if ticket.Status == "" {
		ticket.Status = "OPEN"
	}
	if ticket.Priority == "" {
		ticket.Priority = "HIGH"
	}

	// Initialize message thread with initial issue
	initialMsg := models.TicketMessage{
		ID:         primitive.NewObjectID().Hex(),
		Sender:     "customer",
		SenderName: "Customer",
		Message:    ticket.IssueText,
		MediaURL:   ticket.ImageURL,
		MediaType:  "image",
		CreatedAt:  now,
	}
	ticket.Messages = []models.TicketMessage{initialMsg}

	collection := db.GetCollection("support_tickets")

	// Limit check: Maximum 5 active tickets (OPEN / IN_PROGRESS) per customer
	if ticket.CustomerPhone != "" || ticket.CustomerEmail != "" {
		activeFilter := bson.M{
			"status": bson.M{"$in": []string{"OPEN", "IN_PROGRESS"}},
		}
		if ticket.CustomerPhone != "" && ticket.CustomerEmail != "" {
			activeFilter["$or"] = []bson.M{
				{"customer_phone": ticket.CustomerPhone},
				{"customer_email": ticket.CustomerEmail},
			}
		} else if ticket.CustomerPhone != "" {
			activeFilter["customer_phone"] = ticket.CustomerPhone
		} else {
			activeFilter["customer_email"] = ticket.CustomerEmail
		}

		activeCount, err := collection.CountDocuments(ctx, activeFilter)
		if err == nil && activeCount >= 5 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Maximum limit of 5 active support tickets reached. Please wait until existing open tickets are resolved."})
			return
		}
	}

	result, err := collection.InsertOne(ctx, ticket)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create support ticket"})
		return
	}

	ticket.ID = result.InsertedID.(primitive.ObjectID)

	c.JSON(http.StatusCreated, gin.H{
		"message":   "Support ticket logged successfully",
		"ticket_id": ticket.TicketID,
		"ticket":    ticket,
	})
}

func GetTickets(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := db.GetCollection("support_tickets")
	opts := options.Find().SetSort(bson.D{{Key: "updated_at", Value: -1}, {Key: "created_at", Value: -1}})

	cursor, err := collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch support tickets"})
		return
	}
	defer cursor.Close(ctx)

	var tickets []models.SupportTicket
	if err = cursor.All(ctx, &tickets); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode tickets"})
		return
	}

	if tickets == nil {
		tickets = []models.SupportTicket{}
	}

	c.JSON(http.StatusOK, tickets)
}

func GetCustomerTickets(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	contact := c.Query("contact")
	if contact == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Customer contact query parameter is required"})
		return
	}

	collection := db.GetCollection("support_tickets")
	filter := bson.M{
		"$or": []bson.M{
			{"customer_phone": contact},
			{"customer_email": contact},
		},
	}
	opts := options.Find().SetSort(bson.D{{Key: "updated_at", Value: -1}, {Key: "created_at", Value: -1}})

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch customer tickets"})
		return
	}
	defer cursor.Close(ctx)

	var allTickets []models.SupportTicket
	if err = cursor.All(ctx, &allTickets); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode tickets"})
		return
	}

	// Filter out closed tickets older than 7 days
	sevenDaysAgo := time.Now().Add(-7 * 24 * time.Hour)
	var visibleTickets []models.SupportTicket
	for _, t := range allTickets {
		if t.Status == "CLOSED" && t.ClosedAt != nil && t.ClosedAt.Before(sevenDaysAgo) {
			continue // Auto-archived after 7 days
		}
		visibleTickets = append(visibleTickets, t)
	}

	if visibleTickets == nil {
		visibleTickets = []models.SupportTicket{}
	}

	c.JSON(http.StatusOK, visibleTickets)
}

func GetTicketByID(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	ticketIDParam := c.Param("id")
	collection := db.GetCollection("support_tickets")

	var filter bson.M
	if objID, err := primitive.ObjectIDFromHex(ticketIDParam); err == nil {
		filter = bson.M{"_id": objID}
	} else {
		filter = bson.M{"ticket_id": ticketIDParam}
	}

	var ticket models.SupportTicket
	err := collection.FindOne(ctx, filter).Decode(&ticket)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
		return
	}

	c.JSON(http.StatusOK, ticket)
}

func ReplyToTicket(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	ticketIDParam := c.Param("id")
	var payload ReplyTicketPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Enforce strict size limit on base64 media attachment (Max 3MB binary, approx 4MB base64)
	if len(payload.MediaURL) > 4*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Attached media size must be under 3MB"})
		return
	}

	// Only the protected admin route may create admin messages. Public callers
	// are always treated as customers, even if they forge the request payload.
	if _, isAdmin := c.Get("role"); !isAdmin {
		payload.Sender = "customer"
	}

	collection := db.GetCollection("support_tickets")

	var filter bson.M
	if objID, err := primitive.ObjectIDFromHex(ticketIDParam); err == nil {
		filter = bson.M{"_id": objID}
	} else {
		filter = bson.M{"ticket_id": ticketIDParam}
	}

	var existingTicket models.SupportTicket
	err := collection.FindOne(ctx, filter).Decode(&existingTicket)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
		return
	}

	// Lock messaging if ticket is CLOSED
	if existingTicket.Status == "CLOSED" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This support ticket is CLOSED. Closed tickets do not accept new messages."})
		return
	}

	// Restrict customer photo/video uploads unless explicitly unlocked by Support Admin
	if payload.Sender == "customer" && payload.MediaURL != "" && !existingTicket.AllowMediaAttachment {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Photo/video attachments are disabled for customer chat until requested by Support Team."})
		return
	}

	senderName := payload.SenderName
	if senderName == "" {
		if payload.Sender == "admin" {
			senderName = "Support Team"
		} else {
			senderName = "Customer"
		}
	}

	newMsg := models.TicketMessage{
		ID:         primitive.NewObjectID().Hex(),
		Sender:     payload.Sender,
		SenderName: senderName,
		Message:    payload.Message,
		MediaURL:   payload.MediaURL,
		MediaType:  payload.MediaType,
		CreatedAt:  time.Now(),
	}

	newStatus := existingTicket.Status
	if payload.Sender == "admin" && existingTicket.Status == "OPEN" {
		newStatus = "IN_PROGRESS"
	}

	update := bson.M{
		"$push": bson.M{"messages": newMsg},
		"$set": bson.M{
			"status":     newStatus,
			"updated_at": time.Now(),
		},
	}

	_, err = collection.UpdateOne(ctx, filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to post message reply"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Reply sent successfully",
		"ticket_id":   existingTicket.TicketID,
		"new_message": newMsg,
		"status":      newStatus,
	})
}

func UpdateTicketStatus(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	ticketIDParam := c.Param("id")
	var payload UpdateTicketStatusPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := db.GetCollection("support_tickets")

	var filter bson.M
	if objID, err := primitive.ObjectIDFromHex(ticketIDParam); err == nil {
		filter = bson.M{"_id": objID}
	} else {
		filter = bson.M{"ticket_id": ticketIDParam}
	}

	now := time.Now()
	setFields := bson.M{
		"status":     payload.Status,
		"updated_at": now,
	}

	if payload.Status == "CLOSED" {
		setFields["closed_at"] = now
	}

	update := bson.M{
		"$set": setFields,
	}

	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil || result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found or update failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Ticket status updated successfully",
		"status":  payload.Status,
	})
}

type ToggleMediaPermissionPayload struct {
	AllowMediaAttachment bool `json:"allow_media_attachment"`
}

func ToggleMediaPermission(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	ticketIDParam := c.Param("id")
	var payload ToggleMediaPermissionPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := db.GetCollection("support_tickets")

	var filter bson.M
	if objID, err := primitive.ObjectIDFromHex(ticketIDParam); err == nil {
		filter = bson.M{"_id": objID}
	} else {
		filter = bson.M{"ticket_id": ticketIDParam}
	}

	update := bson.M{
		"$set": bson.M{
			"allow_media_attachment": payload.AllowMediaAttachment,
			"updated_at":             time.Now(),
		},
	}

	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil || result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found or update failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":                "Media upload permission updated",
		"allow_media_attachment": payload.AllowMediaAttachment,
	})
}
