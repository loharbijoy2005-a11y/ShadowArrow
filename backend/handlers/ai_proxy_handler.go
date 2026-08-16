package handlers

import (
	"bytes"
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
		log.Printf("[AI PROXY] Proxying request to Python service: %s", targetURL)

		client := &http.Client{Timeout: 30 * time.Second}
		req, err := http.NewRequest("POST", targetURL, bytes.NewBuffer(body))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to construct proxy request"})
			return
		}
		req.Header.Set("Content-Type", "application/json")

		resp, err := client.Do(req)
		if err != nil {
			log.Printf("[AI PROXY ERROR] Python AI service on port 5001 unreachable: %v", err)
			c.JSON(http.StatusOK, gin.H{
				"response": "I'm Shadow AI, your personal stylist! Our dedicated AI server is starting up. Feel free to ask about our oversized fits, French Terry GSM weights, or track your order with your phone number!",
				"status":   "fallback",
			})
			return
		}
		defer resp.Body.Close()

		respBody, err := io.ReadAll(resp.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read AI response"})
			return
		}

		c.Data(resp.StatusCode, "application/json", respBody)
	}
}
