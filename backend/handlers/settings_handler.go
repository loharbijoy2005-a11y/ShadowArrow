package handlers

import (
	"context"
	"net/http"
	"time"

	"shadow-arrow-backend/db"
	"shadow-arrow-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetDefaultThemeSettings() models.SiteThemeSettings {
	return models.SiteThemeSettings{
		StoreName:          "SHADOW ARROW",
		SupportEmail:       "support.shadowarrow@gmail.com",
		SupportPhone:       "+91 9002376609",
		CurrencySymbol:     "₹",
		PrimaryColor:       "#2563eb",
		BuyNowBtnColor:     "#16a34a",
		AddCartBtnColor:    "#0f172a",
		NavbarBgColor:      "#0f172a",
		BgColor:            "#020617",
		CardBgColor:        "#0f172a",
		TextPrimaryColor:   "#ffffff",
		TextSecondaryColor: "#94a3b8",
		UpdatedAt:          time.Now(),
	}
}

func GetThemeSettings(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := db.GetCollection("site_settings")

	var settings models.SiteThemeSettings
	err := collection.FindOne(ctx, bson.M{}).Decode(&settings)
	if err != nil {
		defaultSettings := GetDefaultThemeSettings()
		c.JSON(http.StatusOK, defaultSettings)
		return
	}

	c.JSON(http.StatusOK, settings)
}

func UpdateThemeSettings(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var payload models.SiteThemeSettings
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	payload.UpdatedAt = time.Now()
	collection := db.GetCollection("site_settings")

	opts := options.Update().SetUpsert(true)
	update := bson.M{
		"$set": bson.M{
			"store_name":           payload.StoreName,
			"support_email":        payload.SupportEmail,
			"support_phone":        payload.SupportPhone,
			"currency_symbol":      payload.CurrencySymbol,
			"primary_color":        payload.PrimaryColor,
			"buy_now_btn_color":    payload.BuyNowBtnColor,
			"add_cart_btn_color":   payload.AddCartBtnColor,
			"navbar_bg_color":      payload.NavbarBgColor,
			"bg_color":             payload.BgColor,
			"card_bg_color":        payload.CardBgColor,
			"text_primary_color":   payload.TextPrimaryColor,
			"text_secondary_color": payload.TextSecondaryColor,
			"updated_at":           payload.UpdatedAt,
		},
	}

	_, err := collection.UpdateOne(ctx, bson.M{}, update, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save theme & settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Storefront theme & settings updated successfully",
		"settings": payload,
	})
}
