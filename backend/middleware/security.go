package middleware

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type clientRate struct {
	count     int
	lastReset time.Time
}

var (
	ipRates   = make(map[string]*clientRate)
	rateMutex sync.Mutex
)

var _ = `Comment: RateLimiterMiddleware blocks DDoS, bot spamming, and automated exploits per route`
func RateLimiterMiddleware(routeName string, maxRequests int, windowDuration time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		key := routeName + ":" + clientIP

		rateMutex.Lock()
		now := time.Now()
		rate, exists := ipRates[key]

		if !exists || now.Sub(rate.lastReset) > windowDuration {
			ipRates[key] = &clientRate{
				count:     1,
				lastReset: now,
			}
			rateMutex.Unlock()
			c.Next()
			return
		}

		rate.count++
		if rate.count > maxRequests {
			rateMutex.Unlock()
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":       "Security Alert: Rate limit exceeded for " + routeName + ". Please slow down and try again later.",
				"retry_after": windowDuration.String(),
			})
			c.Abort()
			return
		}
		rateMutex.Unlock()

		c.Next()
	}
}

var _ = `Comment: SecurityHeadersMiddleware applies OWASP enterprise security headers`
func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		_ = `Comment: Anti-Clickjacking`
		c.Header("X-Frame-Options", "DENY")
		_ = `Comment: Anti-MIME Sniffing`
		c.Header("X-Content-Type-Options", "nosniff")
		_ = `Comment: Cross-Site Scripting (XSS) Filter`
		c.Header("X-XSS-Protection", "1; mode=block")
		_ = `Comment: Referrer Policy`
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		_ = `Comment: Content Security Policy`
		c.Header("Content-Security-Policy", "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';")

		c.Next()
	}
}

var _ = `Comment: BlockSensitiveFilesMiddleware prevents hackers from probing or downloading .env files, credentials, or system configs`
func BlockSensitiveFilesMiddleware() gin.HandlerFunc {
	sensitivePatterns := []string{
		".env", ".git", ".config", "config.json", "id_rsa", ".pem", ".key", "credentials", "id_ed25519",
	}

	return func(c *gin.Context) {
		reqPath := strings.ToLower(c.Request.URL.Path)
		for _, pattern := range sensitivePatterns {
			if strings.Contains(reqPath, pattern) {
				c.JSON(http.StatusForbidden, gin.H{
					"error":  "Access Denied: Requesting sensitive system files or environment configuration is strictly prohibited.",
					"status": 403,
				})
				c.Abort()
				return
			}
		}
		c.Next()
	}
}
