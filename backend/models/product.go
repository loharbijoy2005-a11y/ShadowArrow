package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ProductSpecs struct {
	FabricGSM string `json:"fabric_gsm" bson:"fabric_gsm"`
	Material  string `json:"material" bson:"material"`
	Fit       string `json:"fit" bson:"fit"`
	HSNCode   string `json:"hsn_code" bson:"hsn_code"`
	DPI       string `json:"dpi" bson:"dpi"`
	Weight    string `json:"weight" bson:"weight"`
}

type Product struct {
	ID           primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Title        string             `json:"title" bson:"title" binding:"required"`
	Slug         string             `json:"slug" bson:"slug"`
	Category     string             `json:"category" bson:"category" binding:"required"` // Apparel, Footwear, Accessories
	Price        float64            `json:"price" bson:"price" binding:"required"`
	ComparePrice float64            `json:"compare_price" bson:"compare_price"`
	Stock        int                `json:"stock" bson:"stock"`
	Description  string             `json:"description" bson:"description"`
	Specs        ProductSpecs       `json:"specs" bson:"specs"`
	Sizes        []string           `json:"sizes" bson:"sizes"`
	Images       []string           `json:"images" bson:"images"`
	CreatedAt    time.Time          `json:"created_at" bson:"created_at"`
}
