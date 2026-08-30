package db

import (
	"context"
	"log"
	"time"

	"shadow-arrow-backend/config"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

func ConnectRedis(cfg *config.Config) *redis.Client {
	log.Printf("[REDIS] Connecting to Redis at %s...", cfg.RedisAddr)

	client := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       0, // Use default DB
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := client.Ping(ctx).Result()
	if err != nil {
		log.Printf("[REDIS] Warning: Failed to connect/ping Redis (caching will fail on request): %v", err)
	} else {
		log.Println("[REDIS] Successfully connected to Redis!")
	}

	RedisClient = client
	return RedisClient
}
