package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SiteThemeSettings struct {
	ID                 primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	StoreName          string             `json:"store_name" bson:"store_name"`
	SupportEmail       string             `json:"support_email" bson:"support_email"`
	SupportPhone       string             `json:"support_phone" bson:"support_phone"`
	CurrencySymbol     string             `json:"currency_symbol" bson:"currency_symbol"`
	
	// Enterprise Master HSL & Slider Controls
	AccentHue          int                `json:"accent_hue" bson:"accent_hue"`                   // 0-360Â°
	BgDarkness         int                `json:"bg_darkness" bson:"bg_darkness"`                 // 0-100%
	GlowIntensity      int                `json:"glow_intensity" bson:"glow_intensity"`           // 0-100%
	BuyNowHue          int                `json:"buy_now_hue" bson:"buy_now_hue"`                 // 0-360Â°
	AddCartHue         int                `json:"add_cart_hue" bson:"add_cart_hue"`               // 0-360Â°
	CheckoutHue        int                `json:"checkout_hue" bson:"checkout_hue"`               // 0-360Â°

	PrimaryColor       string             `json:"primary_color" bson:"primary_color"`
	BuyNowBtnColor     string             `json:"buy_now_btn_color" bson:"buy_now_btn_color"`
	AddCartBtnColor    string             `json:"add_cart_btn_color" bson:"add_cart_btn_color"`
	NavbarBgColor      string             `json:"navbar_bg_color" bson:"navbar_bg_color"`
	NavbarTextColor    string             `json:"navbar_text_color" bson:"navbar_text_color"`
	BgColor            string             `json:"bg_color" bson:"bg_color"`
	CardBgColor        string             `json:"card_bg_color" bson:"card_bg_color"`
	CheckoutBgColor    string             `json:"checkout_bg_color" bson:"checkout_bg_color"`
	CheckoutCardColor  string             `json:"checkout_card_color" bson:"checkout_card_color"`
	CheckoutBtnColor   string             `json:"checkout_btn_color" bson:"checkout_btn_color"`
	FooterBgColor      string             `json:"footer_bg_color" bson:"footer_bg_color"`
	FooterTextColor    string             `json:"footer_text_color" bson:"footer_text_color"`
	TextPrimaryColor   string             `json:"text_primary_color" bson:"text_primary_color"`
	TextSecondaryColor string             `json:"text_secondary_color" bson:"text_secondary_color"`
	AdminBgColor       string             `json:"admin_bg_color" bson:"admin_bg_color"`
	AdminAccentColor   string             `json:"admin_accent_color" bson:"admin_accent_color"`
	
	UpdatedAt          time.Time          `json:"updated_at" bson:"updated_at"`
}
