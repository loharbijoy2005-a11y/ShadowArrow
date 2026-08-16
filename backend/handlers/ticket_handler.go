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

	ticket.TicketID = generateTicketID()
	ticket.CreatedAt = time.Now()
	if ticket.Status == "" {
		ticket.Status = "OPEN"
	}
	if ticket.Priority == "" {
		ticket.Priority = "HIGH"
	}

	collection := db.GetCollection("support_tickets")
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
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})

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

	update := bson.M{
		"$set": bson.M{
			"status": payload.Status,
		},
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
