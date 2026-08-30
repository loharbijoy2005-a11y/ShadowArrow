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
		CurrencySymbol:     "â‚¹",
		
		AccentHue:          217,
		BgDarkness:         96,
		GlowIntensity:      70,
		BuyNowHue:          142,
		AddCartHue:         217,
		CheckoutHue:        217,

		PrimaryColor:       "#2563eb",
		BuyNowBtnColor:     "#16a34a",
		AddCartBtnColor:    "#0f172a",
		NavbarBgColor:      "#0f172a",
		NavbarTextColor:    "#ffffff",
		BgColor:            "#020617",
		CardBgColor:        "#0f172a",
		CheckoutBgColor:    "#020617",
		CheckoutCardColor:  "#0f172a",
		CheckoutBtnColor:   "#2563eb",
		FooterBgColor:      "#0f172a",
		FooterTextColor:    "#94a3b8",
		TextPrimaryColor:   "#ffffff",
		TextSecondaryColor: "#94a3b8",
		AdminBgColor:       "#0b0f19",
		AdminAccentColor:   "#2563eb",
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
			"accent_hue":           payload.AccentHue,
			"bg_darkness":          payload.BgDarkness,
			"glow_intensity":       payload.GlowIntensity,
			"buy_now_hue":          payload.BuyNowHue,
			"add_cart_hue":         payload.AddCartHue,
			"checkout_hue":         payload.CheckoutHue,
			"primary_color":        payload.PrimaryColor,
			"buy_now_btn_color":    payload.BuyNowBtnColor,
			"add_cart_btn_color":   payload.AddCartBtnColor,
			"navbar_bg_color":      payload.NavbarBgColor,
			"navbar_text_color":    payload.NavbarTextColor,
			"bg_color":             payload.BgColor,
			"card_bg_color":        payload.CardBgColor,
			"checkout_bg_color":    payload.CheckoutBgColor,
			"checkout_card_color":  payload.CheckoutCardColor,
			"checkout_btn_color":   payload.CheckoutBtnColor,
			"footer_bg_color":      payload.FooterBgColor,
			"footer_text_color":    payload.FooterTextColor,
			"text_primary_color":   payload.TextPrimaryColor,
			"text_secondary_color": payload.TextSecondaryColor,
			"admin_bg_color":       payload.AdminBgColor,
			"admin_accent_color":   payload.AdminAccentColor,
			"updated_at":           payload.UpdatedAt,
		},
	}

	_, err := collection.UpdateOne(ctx, bson.M{}, update, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save theme & settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Storefront & Admin HSL Master theme settings updated successfully",
		"settings": payload,
	})
}
