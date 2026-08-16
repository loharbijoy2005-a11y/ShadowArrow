package main

import (
	"log"
	"net/http"

	"shadow-arrow-backend/config"
	"shadow-arrow-backend/db"
	"shadow-arrow-backend/handlers"
	"shadow-arrow-backend/middleware"
	"shadow-arrow-backend/seed"

	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("[SHADOW ARROW] Starting Golang API Backend...")

	// 1. Load Configuration
	cfg := config.LoadConfig()

	// 2. Connect to MongoDB
	db.ConnectDB(cfg)

	// 3. Seed Database if empty
	seed.SeedDatabase()

	// 4. Initialize Gin Router
	r := gin.Default()

	// 5. Apply CORS Middleware
	r.Use(middleware.CORSMiddleware())

	// Healthcheck Endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "shadow-arrow-backend",
			"version": "1.0.0",
		})
	})

	// V1 API Group
	v1 := r.Group("/api/v1")
	{
		// Public Product Routes
		v1.GET("/products", handlers.GetProducts)
		v1.GET("/products/:id", handlers.GetProductByID)

		// Public Order & Tracking Routes
		v1.POST("/orders/create", handlers.CreateOrder(cfg))
		v1.POST("/orders/verify-payment", handlers.VerifyPayment(cfg))
		v1.POST("/payment/verify", handlers.VerifyPayment(cfg))
		v1.GET("/orders/track/:id", handlers.TrackOrder)
		v1.GET("/user/orders", handlers.GetUserOrders)

		// Auth & Account Sync Routes
		v1.POST("/auth/google-sync", handlers.GoogleSync)
		v1.POST("/auth/phone-login", handlers.PhoneLogin)

		// User Profile Routes
		v1.PUT("/user/profile", handlers.UpdateUserProfile)
		v1.GET("/user/profile", handlers.GetUserProfile)

		// Support Ticket Routes
		v1.POST("/tickets/create", handlers.CreateTicket)
		v1.POST("/support/tickets", handlers.CreateTicket)

		// AI Chat Proxy Route
		v1.POST("/ai/chat", handlers.AIChatProxy(cfg))

		// Admin Auth Route
		v1.POST("/admin/login", handlers.AdminLogin(cfg))

		// Protected Admin Routes (JWT authenticated)
		admin := v1.Group("/admin")
		admin.Use(middleware.AdminAuthMiddleware(cfg))
		{
			admin.POST("/products", handlers.CreateProduct)
			admin.PUT("/products/:id", handlers.UpdateProduct)
			admin.DELETE("/products/:id", handlers.DeleteProduct)

			admin.GET("/orders", handlers.GetAdminOrders)
			admin.PUT("/orders/:id/status", handlers.UpdateOrderStatus)
			admin.PUT("/orders/:id/shipment", handlers.UpdateOrderStatus)

			admin.GET("/analytics", handlers.GetAnalytics)
			admin.GET("/tickets", handlers.GetTickets)
			admin.PUT("/tickets/:id/status", handlers.UpdateTicketStatus)
		}
	}

	log.Printf("[SHADOW ARROW] Backend listening on port %s...", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("[FATAL] Server failed to start: %v", err)
	}
}
