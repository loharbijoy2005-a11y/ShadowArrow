package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OrderItem struct {
	ProductID string  `json:"product_id" bson:"product_id"`
	Title     string  `json:"title" bson:"title"`
	Price     float64 `json:"price" bson:"price"`
	Quantity  int     `json:"quantity" bson:"quantity"`
	Size      string  `json:"size" bson:"size"`
	Image     string  `json:"image" bson:"image"`
}

type Order struct {
	ID                   primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	OrderID              string             `json:"order_id" bson:"order_id"` // SA-YYYYMMDD-XXXX
	CustomerName         string             `json:"customer_name" bson:"customer_name" binding:"required"`
	CustomerPhone        string             `json:"customer_phone" bson:"customer_phone" binding:"required"`
	CustomerEmail        string             `json:"customer_email" bson:"customer_email" binding:"required"`
	ShippingAddress      string             `json:"shipping_address" bson:"shipping_address" binding:"required"`
	Items                []OrderItem        `json:"items" bson:"items" binding:"required"`
	TotalAmount          float64            `json:"total_amount" bson:"total_amount"`
	PaymentMethod        string             `json:"payment_method" bson:"payment_method"` // ONLINE or COD
	PaymentStatus        string             `json:"payment_status" bson:"payment_status"` // PENDING, PAID, REFUNDED
	RazorpayOrderID      string             `json:"razorpay_order_id" bson:"razorpay_order_id"`
	RazorpayPaymentID    string             `json:"razorpay_payment_id" bson:"razorpay_payment_id"`
	RazorpaySignature    string             `json:"razorpay_signature" bson:"razorpay_signature"`
	OrderStatus          string             `json:"order_status" bson:"order_status"` // CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
	CourierPartner       string             `json:"courier_partner" bson:"courier_partner"`
	CourierName          string             `json:"courier_name" bson:"courier_name"`
	AWBNumber            string             `json:"awb_number" bson:"awb_number"`
	TrackingNumber       string             `json:"tracking_number" bson:"tracking_number"`
	ShiprocketOrderID    int                `json:"shiprocket_order_id" bson:"shiprocket_order_id"`
	ShiprocketShipmentID int                `json:"shiprocket_shipment_id" bson:"shiprocket_shipment_id"`
	CreatedAt            time.Time          `json:"created_at" bson:"created_at"`
}
