package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                   string
	MongoURI               string
	DatabaseName           string
	JWTSecret              string
	RazorpayKeyID          string
	RazorpayKeySecret      string
	AIServiceURL           string
	AdminMasterPass        string
	ShiprocketEmail        string
	ShiprocketPassword     string
	ShiprocketPickupLoc    string
	RedisAddr              string
	RedisPassword          string
}

func LoadConfig() *Config {
	// Try loading .env from backend directory or parent directory
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")

	port := getEnv("PORT", "8080")
	mongoURI := getEnv("MONGO_URI", getEnv("MONGODB_URI", "mongodb://localhost:27017"))
	dbName := getEnv("DATABASE_NAME", "shadow_arrow_db")
	jwtSecret := getEnv("JWT_SECRET", "shadow_arrow_jwt_secret_key_2026")
	razorpayKeyID := getEnv("RAZORPAY_KEY_ID", "rzp_test_key_id")
	razorpayKeySecret := getEnv("RAZORPAY_KEY_SECRET", "rzp_test_key_secret")
	aiServiceURL := getEnv("AI_SERVICE_URL", "http://localhost:5001")
	adminPass := getEnv("ADMIN_MASTER_PASS", "admin123")
	srEmail := getEnv("SHIPROCKET_EMAIL", "shiprocket_email@example.com")
	srPass := getEnv("SHIPROCKET_PASSWORD", "shiprocket_password_placeholder")
	srPickup := getEnv("SHIPROCKET_PICKUP_LOCATION", "warehouse")
	redisAddr := getEnv("REDIS_ADDR", "localhost:6379")
	redisPassword := getEnv("REDIS_PASSWORD", "")

	log.Printf("[CONFIG] Loaded configuration. Database: %s, Port: %s", dbName, port)

	return &Config{
		Port:                port,
		MongoURI:            mongoURI,
		DatabaseName:        dbName,
		JWTSecret:           jwtSecret,
		RazorpayKeyID:       razorpayKeyID,
		RazorpayKeySecret:   razorpayKeySecret,
		AIServiceURL:        aiServiceURL,
		AdminMasterPass:     adminPass,
		ShiprocketEmail:     srEmail,
		ShiprocketPassword:  srPass,
		ShiprocketPickupLoc: srPickup,
		RedisAddr:           redisAddr,
		RedisPassword:       redisPassword,
	}
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return fallback
}
