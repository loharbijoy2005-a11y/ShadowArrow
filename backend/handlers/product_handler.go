package handlers

import (
	"context"
	"net/http"
	"strconv"
	"strings"
	"time"

	"shadow-arrow-backend/db"
	"shadow-arrow-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetProducts(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := db.GetCollection("products")

	category := c.Query("category")
	sortPrice := c.Query("sort") // asc or desc
	limitStr := c.Query("limit")
	pageStr := c.Query("page")

	limit := 12
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	page := 1
	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	skip := int64((page - 1) * limit)

	filter := bson.M{}
	if category != "" && strings.ToLower(category) != "all" {
		filter["category"] = bson.M{"$regex": primitive.Regex{Pattern: "^" + category + "$", Options: "i"}}
	}

	findOptions := options.Find()
	findOptions.SetLimit(int64(limit))
	findOptions.SetSkip(skip)

	if sortPrice == "asc" {
		findOptions.SetSort(bson.D{{Key: "price", Value: 1}})
	} else if sortPrice == "desc" {
		findOptions.SetSort(bson.D{{Key: "price", Value: -1}})
	} else {
		findOptions.SetSort(bson.D{{Key: "created_at", Value: -1}})
	}

	cursor, err := collection.Find(ctx, filter, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}
	defer cursor.Close(ctx)

	var products []models.Product
	if err = cursor.All(ctx, &products); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode products"})
		return
	}

	if products == nil {
		products = []models.Product{}
	}

	totalCount, _ := collection.CountDocuments(ctx, filter)
	hasMore := (skip + int64(len(products))) < totalCount

	c.JSON(http.StatusOK, gin.H{
		"products": products,
		"total":    totalCount,
		"page":     page,
		"limit":    limit,
		"has_more": hasMore,
	})
}

func GetProductByID(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	param := c.Param("id")
	collection := db.GetCollection("products")

	var product models.Product
	var err error

	objID, errID := primitive.ObjectIDFromHex(param)
	if errID == nil {
		err = collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&product)
	} else {
		err = collection.FindOne(ctx, bson.M{"slug": param}).Decode(&product)
	}

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, product)
}

func CreateProduct(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if product.Slug == "" {
		product.Slug = strings.ToLower(strings.ReplaceAll(product.Title, " ", "-"))
	}
	product.CreatedAt = time.Now()

	collection := db.GetCollection("products")
	result, err := collection.InsertOne(ctx, product)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}

	product.ID = result.InsertedID.(primitive.ObjectID)
	c.JSON(http.StatusCreated, product)
}

func UpdateProduct(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	idParam := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := db.GetCollection("products")
	update := bson.M{
		"$set": bson.M{
			"title":         product.Title,
			"slug":          product.Slug,
			"category":      product.Category,
			"price":         product.Price,
			"compare_price": product.ComparePrice,
			"stock":         product.Stock,
			"description":   product.Description,
			"specs":         product.Specs,
			"sizes":         product.Sizes,
			"images":        product.Images,
		},
	}

	_, err = collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
		return
	}

	product.ID = objID
	c.JSON(http.StatusOK, product)
}

func DeleteProduct(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	idParam := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	collection := db.GetCollection("products")
	_, err = collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}
