package handlers

import (
	"bytes"
	"context"
	"io"
	"log"
	"net/http"
	"time"

	"shadow-arrow-backend/config"

	"github.com/gin-gonic/gin"
)

func AIChatProxy(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		body, err := io.ReadAll(c.Request.Body)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read request body"})
			return
		}

		targetURL := cfg.AIServiceURL + "/chat"
		log.Printf("[AI PROXY] Forwarding request to AI microservice: %s", targetURL)

		// Use a context-scoped request with a 30-second timeout
		ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
		defer cancel()

		req, err := http.NewRequestWithContext(ctx, http.MethodPost, targetURL, bytes.NewBuffer(body))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to construct proxy request"})
			return
		}
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			log.Printf("[AI PROXY ERROR] AI microservice unreachable at %s: %v", targetURL, err)
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"error":  "AI service is temporarily unavailable. Please try again shortly.",
				"status": "service_unavailable",
			})
			return
		}
		defer resp.Body.Close()

		respBody, err := io.ReadAll(resp.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read AI service response"})
			return
		}

		// Forward the AI service's status code and body directly to the client
		c.Data(resp.StatusCode, "application/json", respBody)
	}
}
