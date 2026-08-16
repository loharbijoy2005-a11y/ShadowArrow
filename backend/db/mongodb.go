package db

import (
	"context"
	"log"
	"time"

	"shadow-arrow-backend/config"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Database struct {
	Client   *mongo.Client
	Database *mongo.Database
}

var DB *Database

func ConnectDB(cfg *config.Config) *Database {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(cfg.MongoURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatalf("[DATABASE] Failed to create MongoDB client: %v", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Printf("[DATABASE] Warning: Ping MongoDB failed (will retry on requests): %v", err)
	} else {
		log.Println("[DATABASE] Successfully connected to MongoDB Atlas!")
	}

	database := client.Database(cfg.DatabaseName)

	DB = &Database{
		Client:   client,
		Database: database,
	}

	return DB
}

func GetCollection(name string) *mongo.Collection {
	if DB == nil || DB.Database == nil {
		log.Fatal("[DATABASE] Database connection is not initialized")
	}
	return DB.Database.Collection(name)
}
