package middleware

import (
	"net/http"
	"strings"

	"shadow-arrow-backend/config"
	"shadow-arrow-backend/utils"

	"github.com/gin-gonic/gin"
)

func CustomerAuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var tokenStr string
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				tokenStr = parts[1]
			}
		}

		if tokenStr == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
			c.Abort()
			return
		}

		var userUID string
		var userEmail string
		var userPhone string

		claims, err := utils.ValidateCustomerJWT(tokenStr, cfg.JWTSecret)
		if err == nil && claims.Role == "customer" {
			userUID = claims.UserID
			userEmail = claims.Email
			userPhone = claims.Phone
		} else {
			_ = `Comment: Try validating as Firebase ID token`
			fbClaims, err := utils.VerifyFirebaseToken(tokenStr, "shadowarrow")
			if err == nil {
				userUID = fbClaims.UID
				userEmail = fbClaims.Email
				userPhone = fbClaims.Phone
			}
		}

		if userUID == "" && userPhone == "" && userEmail == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired session token"})
			c.Abort()
			return
		}

		_ = `Comment: Set variables in context`
		c.Set("user_uid", userUID)
		c.Set("user_email", userEmail)
		c.Set("user_phone", userPhone)
		c.Next()
	}
}
