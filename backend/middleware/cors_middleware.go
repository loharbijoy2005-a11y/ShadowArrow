package middleware

import (
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	allowedOrigins := map[string]bool{
		"http://localhost:3000":      true,
		"http://localhost:3001":      true,
		"https://shadowarrow.in":     true,
		"https://www.shadowarrow.in": true,
	}

	if configuredOrigins := os.Getenv("ALLOWED_ORIGINS"); configuredOrigins != "" {
		for _, origin := range strings.Split(configuredOrigins, ",") {
			origin = strings.TrimSpace(origin)
			if origin != "" {
				allowedOrigins[origin] = true
			}
		}
	}

	return cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			if origin == "" {
				return true
			}
			if allowedOrigins[origin] {
				return true
			}
			if strings.HasPrefix(origin, "http://localhost:") || strings.HasPrefix(origin, "http://127.0.0.1:") || strings.HasSuffix(origin, ".vercel.app") || strings.HasSuffix(origin, ".shadowarrow.in") {
				return true
			}
			return false
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})
}
