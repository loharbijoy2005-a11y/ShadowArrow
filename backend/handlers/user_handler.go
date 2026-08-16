package handlers

import (
	"context"
	"net/http"
	"time"

	"shadow-arrow-backend/db"
	"shadow-arrow-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

type PhoneLoginPayload struct {
	Name  string `json:"name"`
	Phone string `json:"phone" binding:"required"`
	Email string `json:"email"`
}

func GoogleSync(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var payload models.UserProfile
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if payload.Email == "" && payload.UID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Google email or UID required"})
		return
	}

	collection := db.GetCollection("users")

	// Search by email, phone, or UID
	orConditions := []bson.M{}
	if payload.Email != "" {
		orConditions = append(orConditions, bson.M{"email": payload.Email})
	}
	if payload.Phone != "" {
		orConditions = append(orConditions, bson.M{"phone": payload.Phone})
	}
	if payload.UID != "" {
		orConditions = append(orConditions, bson.M{"uid": payload.UID})
	}

	filter := bson.M{"$or": orConditions}

	var existing models.UserProfile
	err := collection.FindOne(ctx, filter).Decode(&existing)

	now := time.Now()
	if err == nil {
		// Existing user found -> Merge details without overwriting non-empty phone/email with empty strings
		updateFields := bson.M{
			"updated_at": now,
		}
		if payload.UID != "" {
			updateFields["uid"] = payload.UID
		}
		if payload.Name != "" {
			updateFields["name"] = payload.Name
		}
		if payload.Email != "" {
			updateFields["email"] = payload.Email
		}
		if payload.PhotoURL != "" {
			updateFields["photo_url"] = payload.PhotoURL
		}
		if payload.Phone != "" {
			updateFields["phone"] = payload.Phone
		}

		_, _ = collection.UpdateOne(ctx, bson.M{"_id": existing.ID}, bson.M{"$set": updateFields})
		_ = collection.FindOne(ctx, bson.M{"_id": existing.ID}).Decode(&existing)
		c.JSON(http.StatusOK, existing)
		return
	}

	// New user -> Insert
	payload.UpdatedAt = now
	res, err := collection.InsertOne(ctx, payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user document"})
		return
	}

	_ = collection.FindOne(ctx, bson.M{"_id": res.InsertedID}).Decode(&existing)
	c.JSON(http.StatusCreated, existing)
}

func PhoneLogin(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var payload PhoneLoginPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if payload.Phone == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Phone number required"})
		return
	}

	collection := db.GetCollection("users")

	orConditions := []bson.M{
		{"phone": payload.Phone},
	}
	if payload.Email != "" && !c.GetBool("ignore_email") {
		orConditions = append(orConditions, bson.M{"email": payload.Email})
	}

	filter := bson.M{"$or": orConditions}

	var existing models.UserProfile
	err := collection.FindOne(ctx, filter).Decode(&existing)

	now := time.Now()
	if err == nil {
		// Existing user found -> Merge details
		updateFields := bson.M{
			"phone":      payload.Phone,
			"updated_at": now,
		}
		if payload.Name != "" {
			updateFields["name"] = payload.Name
		}
		if payload.Email != "" && existing.Email == "" {
			updateFields["email"] = payload.Email
		}

		_, _ = collection.UpdateOne(ctx, bson.M{"_id": existing.ID}, bson.M{"$set": updateFields})
		_ = collection.FindOne(ctx, bson.M{"_id": existing.ID}).Decode(&existing)
		c.JSON(http.StatusOK, existing)
		return
	}

	// New user -> Insert
	newUser := models.UserProfile{
		Name:      payload.Name,
		Phone:     payload.Phone,
		Email:     payload.Email,
		Addresses: []models.SavedAddress{},
		UpdatedAt: now,
	}

	res, err := collection.InsertOne(ctx, newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create phone user document"})
		return
	}

	_ = collection.FindOne(ctx, bson.M{"_id": res.InsertedID}).Decode(&existing)
	c.JSON(http.StatusCreated, existing)
}

func UpdateUserProfile(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var payload models.UserProfile
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if payload.Email == "" && payload.Phone == "" && payload.UID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email, Phone, or UID required to update profile"})
		return
	}

	collection := db.GetCollection("users")

	orConditions := []bson.M{}
	if payload.Email != "" {
		orConditions = append(orConditions, bson.M{"email": payload.Email})
	}
	if payload.Phone != "" {
		orConditions = append(orConditions, bson.M{"phone": payload.Phone})
	}
	if payload.UID != "" {
		orConditions = append(orConditions, bson.M{"uid": payload.UID})
	}

	filter := bson.M{"$or": orConditions}

	var existing models.UserProfile
	err := collection.FindOne(ctx, filter).Decode(&existing)

	now := time.Now()
	updateFields := bson.M{
		"updated_at": now,
	}

	if payload.Name != "" {
		updateFields["name"] = payload.Name
	}
	if payload.Phone != "" {
		updateFields["phone"] = payload.Phone
	}
	if payload.Email != "" {
		updateFields["email"] = payload.Email
	}
	if payload.PhotoURL != "" {
		updateFields["photo_url"] = payload.PhotoURL
	}
	if payload.Addresses != nil {
		updateFields["addresses"] = payload.Addresses
	}

	if err == nil {
		_, err = collection.UpdateOne(ctx, bson.M{"_id": existing.ID}, bson.M{"$set": updateFields})
		_ = collection.FindOne(ctx, bson.M{"_id": existing.ID}).Decode(&existing)
		c.JSON(http.StatusOK, existing)
		return
	}

	// Insert if not found
	payload.UpdatedAt = now
	res, err := collection.InsertOne(ctx, payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user profile in MongoDB"})
		return
	}

	_ = collection.FindOne(ctx, bson.M{"_id": res.InsertedID}).Decode(&existing)
	c.JSON(http.StatusOK, existing)
}

func GetUserProfile(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	email := c.Query("email")
	phone := c.Query("phone")

	if email == "" && phone == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email or phone required"})
		return
	}

	filter := bson.M{}
	if email != "" && phone != "" {
		filter["$or"] = []bson.M{
			{"email": email},
			{"phone": phone},
		}
	} else if email != "" {
		filter["email"] = email
	} else {
		filter["phone"] = phone
	}

	collection := db.GetCollection("users")
	var profile models.UserProfile
	err := collection.FindOne(ctx, filter).Decode(&profile)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	c.JSON(http.StatusOK, profile)
}
