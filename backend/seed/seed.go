package seed

import (
	"context"
	"log"
	"strings"
	"time"

	"shadow-arrow-backend/db"
	"shadow-arrow-backend/models"

	"go.mongodb.org/mongo-driver/bson"
)

func SeedDatabase() {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	collection := db.GetCollection("products")

	// Check if database already has products
	count, err := collection.CountDocuments(ctx, bson.M{})
	if err == nil && count > 0 {
		log.Printf("[SEED] Database already has %d products. Skipping seeding.", count)
		return
	}

	log.Println("[SEED] Seeding database with initial catalog items...")

	products := []models.Product{
		{
			Title:        "Cyberpunk Tactical Heavy Tee",
			Slug:         "cyberpunk-tactical-heavy-tee",
			Category:     "Apparel",
			Price:        2499,
			ComparePrice: 3499,
			Stock:        25,
			Description:  "Ultra-heavyweight 350 GSM French Terry cotton t-shirt with signature drop-shoulder boxy fit and high-density matte print on back.",
			Specs: models.ProductSpecs{
				FabricGSM: "350 GSM",
				Material:  "100% French Terry Heavy Cotton",
				Fit:       "Oversized Boxy Fit",
				HSNCode:   "61091000",
			},
			Sizes:  []string{"S", "M", "L", "XL", "XXL"},
			Images: []string{"https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800"},
		},
		{
			Title:        "Shadow Ops Oversized Hoodie",
			Slug:         "shadow-ops-oversized-hoodie",
			Category:     "Apparel",
			Price:        4999,
			ComparePrice: 6499,
			Stock:        18,
			Description:  "Premium 450 GSM double-fleece lined thermal hoodie engineered for extreme comfort, deep kangaroo pocket, and rib-knit cuffs.",
			Specs: models.ProductSpecs{
				FabricGSM: "450 GSM",
				Material:  "Organic Heavy Fleece Cotton",
				Fit:       "Extreme Boxy Fit",
				HSNCode:   "61091000",
			},
			Sizes:  []string{"S", "M", "L", "XL", "XXL"},
			Images: []string{"https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800", "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800"},
		},
		{
			Title:        "Matrix Stealth Utility Cargo Pants",
			Slug:         "matrix-stealth-utility-cargo-pants",
			Category:     "Apparel",
			Price:        3899,
			ComparePrice: 4999,
			Stock:        14,
			Description:  "Reinforced ripstop cotton cargo pants with 6 modular utility pockets, adjustable drawstring cuffs, and matte black hardware.",
			Specs: models.ProductSpecs{
				FabricGSM: "280 GSM",
				Material:  "Cotton Twill Ripstop",
				Fit:       "Relaxed Tapered Fit",
				HSNCode:   "62034200",
			},
			Sizes:  []string{"S", "M", "L", "XL"},
			Images: []string{"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800"},
		},
		{
			Title:        "Ghost Protocol Acid Wash Tee",
			Slug:         "ghost-protocol-acid-wash-tee",
			Category:     "Apparel",
			Price:        2199,
			ComparePrice: 2999,
			Stock:        30,
			Description:  "Custom handcrafted vintage acid wash tee in 300 GSM combed cotton featuring distressed seam detailing.",
			Specs: models.ProductSpecs{
				FabricGSM: "300 GSM",
				Material:  "Combed Ring-Spun Cotton",
				Fit:       "Boxy Vintage Fit",
				HSNCode:   "61091000",
			},
			Sizes:  []string{"S", "M", "L", "XL", "XXL"},
			Images: []string{"https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800"},
		},
		{
			Title:        "Quantum Stealth Cyber Sneaker",
			Slug:         "quantum-stealth-cyber-sneaker",
			Category:     "Footwear",
			Price:        7999,
			ComparePrice: 9999,
			Stock:        12,
			Description:  "High-top futuristic techwear sneakers crafted with waterproof ballistic nylon upper, responsive EVA midsole, and high-traction rubber outsole.",
			Specs: models.ProductSpecs{
				Material: "Ballistic Nylon & Full Grain Synthetic Leather",
				HSNCode:  "64039990",
			},
			Sizes:  []string{"UK 7", "UK 8", "UK 9", "UK 10", "UK 11"},
			Images: []string{"https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"},
		},
		{
			Title:        "Vortex Tactical High Boots",
			Slug:         "vortex-tactical-high-boots",
			Category:     "Footwear",
			Price:        8499,
			ComparePrice: 10999,
			Stock:        8,
			Description:  "All-terrain urban combat boots featuring memory foam cushioning, quick-zip speed lacing system, and oil-resistant grip sole.",
			Specs: models.ProductSpecs{
				Material: "Action Leather & Anti-Abrasion Cordura",
				HSNCode:  "64039990",
			},
			Sizes:  []string{"UK 7", "UK 8", "UK 9", "UK 10", "UK 11"},
			Images: []string{"https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800"},
		},
		{
			Title:        "Phantom EVA Slip-On Mules",
			Slug:         "phantom-eva-slip-on-mules",
			Category:     "Footwear",
			Price:        3499,
			ComparePrice: 4499,
			Stock:        20,
			Description:  "Ultra-lightweight molded EVA foam slip-on mules designed with ergonomic arch support and breathable airflow ventilation channels.",
			Specs: models.ProductSpecs{
				Material: "High-Density Molded EVA Foam",
				HSNCode:  "64039990",
			},
			Sizes:  []string{"UK 7", "UK 8", "UK 9", "UK 10"},
			Images: []string{"https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800"},
		},
		{
			Title:        "Shadow Precision Wireless Mouse",
			Slug:         "shadow-precision-wireless-mouse",
			Category:     "Accessories",
			Price:        4499,
			ComparePrice: 5999,
			Stock:        15,
			Description:  "Pro-grade 26,000 DPI optical sensor gaming mouse with ultra-lightweight 58g body, low-latency 2.4GHz wireless connectivity, and 80-hour battery life.",
			Specs: models.ProductSpecs{
				DPI:     "26,000 DPI Sensor",
				Weight:  "58 Grams",
				HSNCode: "84716060",
			},
			Sizes:  []string{},
			Images: []string{"https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800"},
		},
		{
			Title:        "Tactical Insulated Steel Hydro Flask",
			Slug:         "tactical-insulated-steel-hydro-flask",
			Category:     "Accessories",
			Price:        1899,
			ComparePrice: 2499,
			Stock:        40,
			Description:  "Double-wall vacuum insulated 1000ml flask crafted from 304 grade stainless steel. Keeps beverages cold for 24h or piping hot for 12h.",
			Specs: models.ProductSpecs{
				Material: "304 Food-Grade Stainless Steel",
				Weight:   "450 Grams",
				HSNCode:  "73239390",
			},
			Sizes:  []string{},
			Images: []string{"https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800"},
		},
		{
			Title:        "Aegis Modular Crossbody Sling Bag",
			Slug:         "aegis-modular-crossbody-sling-bag",
			Category:     "Accessories",
			Price:        2999,
			ComparePrice: 3999,
			Stock:        22,
			Description:  "Weatherproof 1000D Cordura crossbody sling featuring Fidlock magnetic buckle, waterproof YKK zippers, and padded tablet compartment.",
			Specs: models.ProductSpecs{
				Material: "1000D Cordura & YKK Waterproof Zippers",
				Weight:   "380 Grams",
				HSNCode:  "42029200",
			},
			Sizes:  []string{},
			Images: []string{"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"},
		},
		{
			Title:        "Cybernetic Matte Black Sunglasses",
			Slug:         "cybernetic-matte-black-sunglasses",
			Category:     "Accessories",
			Price:        2299,
			ComparePrice: 3199,
			Stock:        16,
			Description:  "Architectural shield frame sunglasses featuring polarized UV400 anti-reflective lenses with matte black titanium structure.",
			Specs: models.ProductSpecs{
				Material: "TR90 Memory Polymer & TAC Polarized Lens",
				Weight:   "32 Grams",
				HSNCode:  "90041000",
			},
			Sizes:  []string{},
			Images: []string{"https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800"},
		},
		{
			Title:        "Nocturnal Oversized Zip Jacket",
			Slug:         "nocturnal-oversized-zip-jacket",
			Category:     "Apparel",
			Price:        5499,
			ComparePrice: 6999,
			Stock:        10,
			Description:  "Heavy nylon bomber jacket with dual front zip pockets, thermal quilted inner lining, and rib collar.",
			Specs: models.ProductSpecs{
				FabricGSM: "380 GSM",
				Material:  "Water-Resistant Technical Nylon",
				Fit:       "Oversized Fit",
				HSNCode:   "62019300",
			},
			Sizes:  []string{"S", "M", "L", "XL"},
			Images: []string{"https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800"},
		},
	}

	for _, p := range products {
		if p.Slug == "" {
			p.Slug = strings.ToLower(strings.ReplaceAll(p.Title, " ", "-"))
		}
		p.CreatedAt = time.Now()
		_, err := collection.InsertOne(ctx, p)
		if err != nil {
			log.Printf("[SEED ERROR] Could not seed product %s: %v", p.Title, err)
		}
	}

	log.Println("[SEED] Successfully seeded database with catalog items!")
}
