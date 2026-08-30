package main

import (
	"log"
	"net/http"

	"time"

	"shadow-arrow-backend/config"
	"shadow-arrow-backend/cron"
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

	// 2.5 Connect to Redis
	db.ConnectRedis(cfg)

	// 3. Seed Database if empty
	seed.SeedDatabase()

	// 4. Start ArrowCoins Cron Scheduler (7-day activation & 365-day expiration)
	cron.StartCronScheduler()

	// 4. Initialize Gin Router
	r := gin.Default()

	// 5. Apply Global Security & CORS Middlewares (Anti-DDoS, OWASP Headers, Sensitive File Protection)
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.SecurityHeadersMiddleware())
	r.Use(middleware.BlockSensitiveFilesMiddleware())
	r.Use(middleware.RateLimiterMiddleware("global", 120, time.Minute))

	// Root Endpoint
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "online",
			"service": "Shadow Arrow Golang API Backend",
			"version": "1.0.0",
			"health":  "/health",
			"api_v1":  "/api/v1/products",
		})
	})

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
		// Public Product & CMS Routes
		v1.GET("/products", handlers.GetProducts)
		v1.GET("/products/:id", handlers.GetProductByID)
		v1.GET("/cms/banners", handlers.GetBanners)
		v1.GET("/banners", handlers.GetBanners)

		// Public Order & Tracking Routes (Strict Order Creation Rate Limit)
		v1.POST("/orders/create", middleware.RateLimiterMiddleware("order_create", 6, 2*time.Minute), handlers.CreateOrder(cfg))
		v1.POST("/orders/verify-payment", handlers.VerifyPayment(cfg))
		v1.POST("/payment/verify", handlers.VerifyPayment(cfg))
		v1.GET("/orders/track/:id", handlers.TrackOrder(cfg))

		// Public Auth & Account Verification Routes
		v1.POST("/auth/google-sync", handlers.GoogleSync(cfg))
		v1.POST("/auth/phone-login", middleware.RateLimiterMiddleware("auth_login", 6, 3*time.Minute), handlers.PhoneLogin(cfg))
		v1.GET("/auth/check-exists", handlers.CheckAccountExists)

		// Protected Customer Routes (Customer JWT / Firebase Token authenticated)
		customer := v1.Group("/user")
		customer.Use(middleware.CustomerAuthMiddleware(cfg))
		{
			customer.GET("/profile", handlers.GetUserProfile)
			customer.PUT("/profile", handlers.UpdateUserProfile)
			customer.GET("/orders", handlers.GetUserOrders)
			customer.GET("/rewards", handlers.GetUserRewards)
			customer.GET("/clones", handlers.GetCloneAccounts)
			customer.POST("/clones/set-default", handlers.SetDefaultAccount)
			customer.POST("/clones/unlink", handlers.UnlinkPhoneFromAccount)
			customer.POST("/request-deletion", middleware.RateLimiterMiddleware("deletion_req", 3, 10*time.Minute), handlers.RequestAccountDeletion)
			customer.GET("/tickets", handlers.GetCustomerTickets)
		}

		v1.GET("/loyalty/config", handlers.AdminGetLoyaltyConfigHandler)

		// Support Ticket & Cart Sync Routes (Strict Ticket Creation Rate Limit)
		v1.POST("/tickets/create", middleware.RateLimiterMiddleware("ticket_create", 3, 5*time.Minute), handlers.CreateTicket)
		v1.POST("/support/tickets", middleware.RateLimiterMiddleware("ticket_create", 3, 5*time.Minute), handlers.CreateTicket)
		v1.GET("/tickets/:id", middleware.CustomerAuthMiddleware(cfg), handlers.GetTicketByID)
		v1.POST("/tickets/:id/reply", middleware.CustomerAuthMiddleware(cfg), handlers.ReplyToTicket)
		v1.POST("/cart/sync", handlers.SyncCart)

		// Coupon Code Validation Route
		v1.POST("/coupons/validate", handlers.ValidateCoupon)

		// Public Site Theme Settings Route
		v1.GET("/settings/theme", handlers.GetThemeSettings)

		// AI Chat Proxy Route (Rate Limited to Prevent Prompt Token Abuse)
		v1.POST("/ai/chat", middleware.RateLimiterMiddleware("ai_chat", 20, time.Minute), handlers.AIChatProxy(cfg))

		// Admin Auth Route (Strict Brute-Force Rate Limiter)
		v1.POST("/admin/login", middleware.RateLimiterMiddleware("admin_login", 5, 5*time.Minute), handlers.AdminLogin(cfg))
		v1.POST("/admin/logout", handlers.AdminLogout)

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
			admin.GET("/customers", handlers.GetAdminCustomers)
			admin.GET("/abandoned-carts", handlers.GetAbandonedCarts)

			admin.GET("/tickets", handlers.GetTickets)
			admin.PUT("/tickets/:id/status", handlers.UpdateTicketStatus)
			admin.PUT("/tickets/:id/allow-media", handlers.ToggleMediaPermission)
			admin.POST("/tickets/:id/reply", handlers.ReplyToTicket)

			admin.GET("/coupons", handlers.GetCoupons)
			admin.POST("/coupons", handlers.CreateCoupon)
			admin.PUT("/coupons/:id/status", handlers.ToggleCouponStatus)
			admin.DELETE("/coupons/:id", handlers.DeleteCoupon)

			admin.PUT("/settings/theme", handlers.UpdateThemeSettings)

			admin.POST("/cms/banners", handlers.SaveBanners)

			// Loyalty & ArrowCoins System Admin Routes
			admin.GET("/loyalty/config", handlers.AdminGetLoyaltyConfigHandler)
			admin.PUT("/loyalty/config", handlers.AdminUpdateLoyaltyConfigHandler)
			admin.POST("/loyalty/adjust", handlers.AdminManualAdjustCoins)
			admin.GET("/loyalty/analytics", handlers.AdminGetCoinAnalytics)
			admin.GET("/loyalty/top-holders", handlers.AdminGetTopCoinHolders)
		}
	}

	log.Printf("[SHADOW ARROW] Backend listening on port %s...", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("[FATAL] Server failed to start: %v", err)
	}
}
