package handlers

import (
	"context"
	"net/http"
	"time"

	"shadow-arrow-backend/db"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

type BannerItem struct {
	ID         string `json:"id" bson:"id"`
	Heading    string `json:"heading" bson:"heading"`
	Subtext    string `json:"subtext" bson:"subtext"`
	ImageURL   string `json:"image_url" bson:"image_url"`
	TargetLink string `json:"target_link" bson:"target_link"`
}

type SaveBannersRequest struct {
	Banners []BannerItem `json:"banners" binding:"required"`
}

func GetBanners(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := db.GetCollection("cms_banners")

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch banners"})
		return
	}

	var banners []BannerItem
	if err := cursor.All(ctx, &banners); err != nil || len(banners) == 0 {
		// Default Initial Hero Banners
		banners = []BannerItem{
			{
				ID:         "1",
				Heading:    "SHADOW ARROW PREMIUM OVERSIZED COLLECTION",
				Subtext:    "Crafted from heavy 350-450 GSM French Terry cotton. Signature drop-shoulder boxy fits engineered for urban comfort.",
				ImageURL:   "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
				TargetLink: "/product/over-1",
			},
			{
				ID:         "2",
				Heading:    "FESTIVE URBAN DROP • UP TO 40% OFF",
				Subtext:    "Ergonomic dual-density EVA midsoles paired with ballistic nylon uppers. All-terrain durability and street performance.",
				ImageURL:   "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800",
				TargetLink: "/checkout",
			},
		}
	}

	c.JSON(http.StatusOK, banners)
}

func SaveBanners(c *gin.Context) {
	var req SaveBannersRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := db.GetCollection("cms_banners")

	// Wipe existing and insert new active banners list
	_, _ = collection.DeleteMany(ctx, bson.M{})

	if len(req.Banners) > 0 {
		var docs []interface{}
		for _, b := range req.Banners {
			docs = append(docs, b)
		}
		_, err := collection.InsertMany(ctx, docs)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save banners"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Hero banners updated successfully",
		"banners": req.Banners,
	})
}
