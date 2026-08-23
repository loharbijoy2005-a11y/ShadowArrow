package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"
	"shadow-arrow-backend/models"
	"strings"
	"time"
)

func getShiprocketEmail() string {
	if val := os.Getenv("SHIPROCKET_EMAIL"); val != "" {
		return val
	}
	return "shiprocket_email@example.com"
}

func getShiprocketPassword() string {
	if val := os.Getenv("SHIPROCKET_PASSWORD"); val != "" {
		return val
	}
	return "shiprocket_password_placeholder"
}

func getShiprocketPickupLocation() string {
	if val := os.Getenv("SHIPROCKET_PICKUP_LOCATION"); val != "" {
		return val
	}
	return "warehouse"
}

// ParseAddressDetails parses shipping address to extract pincode, city, and state.
// It tries to parse pincode using regex and fetch details from India Post API,
// falling back to parsed pincode and default state/city if the API fails or is slow.
func ParseAddressDetails(address string) (string, string, string) {
	defaultPincode := "722157"
	defaultCity := "Bankura"
	defaultState := "West Bengal"

	// Find 6 digit pincode using regex
	re := regexp.MustCompile(`\b\d{6}\b`)
	pincodes := re.FindAllString(address, -1)
	pincode := defaultPincode
	if len(pincodes) > 0 {
		// Use the last match which is usually the pincode (e.g. PIN: 722157)
		pincode = pincodes[len(pincodes)-1]
	}

	// Try fetching city/state from postal API with 2 second timeout
	type PostOfficeInfo struct {
		Name     string `json:"Name"`
		District string `json:"District"`
		State    string `json:"State"`
	}
	type PincodeResponse struct {
		Status     string           `json:"Status"`
		PostOffice []PostOfficeInfo `json:"PostOffice"`
	}

	client := &http.Client{Timeout: 2 * time.Second}
	resp, err := client.Get(fmt.Sprintf("https://api.postalpincode.in/pincode/%s", pincode))
	if err == nil {
		defer resp.Body.Close()
		var apiResps []PincodeResponse
		if bodyBytes, err := io.ReadAll(resp.Body); err == nil {
			if err := json.Unmarshal(bodyBytes, &apiResps); err == nil && len(apiResps) > 0 && apiResps[0].Status == "Success" && len(apiResps[0].PostOffice) > 0 {
				po := apiResps[0].PostOffice[0]
				city := po.District
				if city == "" {
					city = po.Name
				}
				state := po.State
				if city != "" && state != "" {
					return pincode, city, state
				}
			}
		}
	}

	// Fallback if API fails
	return pincode, defaultCity, defaultState
}

type ShiprocketAuthResponse struct {
	Token string `json:"token"`
}

type ShiprocketOrderItem struct {
	Name         string  `json:"name"`
	SKU          string  `json:"sku"`
	Units        int     `json:"units"`
	SellingPrice float64 `json:"selling_price"`
}

type ShiprocketOrderRequest struct {
	OrderID              string                `json:"order_id"`
	OrderDate            string                `json:"order_date"`
	PickupLocation       string                `json:"pickup_location"`
	BillingCustomerName  string                `json:"billing_customer_name"`
	BillingLastName      string                `json:"billing_last_name"`
	BillingAddress       string                `json:"billing_address"`
	BillingCity          string                `json:"billing_city"`
	BillingPincode       string                `json:"billing_pincode"`
	BillingState         string                `json:"billing_state"`
	BillingCountry       string                `json:"billing_country"`
	BillingEmail         string                `json:"billing_email"`
	BillingPhone         string                `json:"billing_phone"`
	ShippingIsBilling    bool                  `json:"shipping_is_billing"`
	OrderItems           []ShiprocketOrderItem `json:"order_items"`
	PaymentMethod        string                `json:"payment_method"`
	SubTotal             float64               `json:"sub_total"`
	Length               float64               `json:"length"`
	Breadth              float64               `json:"breadth"`
	Height               float64               `json:"height"`
	Weight               float64               `json:"weight"`
}

type ShiprocketOrderResponse struct {
	OrderID    int    `json:"order_id"`
	ShipmentID int    `json:"shipment_id"`
	Status     string `json:"status"`
}

func GetShiprocketToken() (string, error) {
	authPayload := map[string]string{
		"email":    getShiprocketEmail(),
		"password": getShiprocketPassword(),
	}
	jsonData, _ := json.Marshal(authPayload)

	resp, err := http.Post("https://apiv2.shiprocket.in/v1/external/auth/login", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("shiprocket auth request failed: %v", err)
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	var authResp ShiprocketAuthResponse
	if err := json.Unmarshal(bodyBytes, &authResp); err != nil {
		return "", fmt.Errorf("shiprocket auth parse failed: %v", err)
	}

	if authResp.Token == "" {
		return "", fmt.Errorf("shiprocket auth token empty. Response: %s", string(bodyBytes))
	}

	return authResp.Token, nil
}

func DispatchToShiprocket(order *models.Order) (int, int, error) {
	token, err := GetShiprocketToken()
	if err != nil {
		log.Printf("[SHIPROCKET ERROR] Auth failed: %v", err)
		return 0, 0, err
	}

	var srItems []ShiprocketOrderItem
	for i, item := range order.Items {
		sku := item.ProductID
		if sku == "" {
			sku = fmt.Sprintf("SKU-%d", i+1)
		}
		srItems = append(srItems, ShiprocketOrderItem{
			Name:         item.Title,
			SKU:          sku,
			Units:        item.Quantity,
			SellingPrice: item.Price,
		})
	}

	pincode, city, state := ParseAddressDetails(order.ShippingAddress)

	firstName := order.CustomerName
	lastName := "."
	parts := strings.Fields(strings.TrimSpace(order.CustomerName))
	if len(parts) > 1 {
		firstName = parts[0]
		lastName = strings.Join(parts[1:], " ")
	} else if len(parts) == 1 {
		firstName = parts[0]
	}

	srReq := ShiprocketOrderRequest{
		OrderID:             order.OrderID,
		OrderDate:           order.CreatedAt.Format("2006-01-02 15:04"),
		PickupLocation:      getShiprocketPickupLocation(),
		BillingCustomerName: firstName,
		BillingLastName:     lastName,
		BillingAddress:      order.ShippingAddress,
		BillingCity:         city,
		BillingPincode:      pincode,
		BillingState:        state,
		BillingCountry:      "India",
		BillingEmail:        order.CustomerEmail,
		BillingPhone:        order.CustomerPhone,
		ShippingIsBilling:   true,
		OrderItems:          srItems,
		PaymentMethod:       strings.ToUpper(order.PaymentMethod),
		SubTotal:            order.TotalAmount,
		Length:              10,
		Breadth:             10,
		Height:              10,
		Weight:              0.5,
	}

	jsonData, _ := json.Marshal(srReq)

	req, err := http.NewRequest("POST", "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", bytes.NewBuffer(jsonData))
	if err != nil {
		return 0, 0, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[SHIPROCKET ERROR] Order creation request failed: %v", err)
		return 0, 0, err
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	log.Printf("[SHIPROCKET RESPONSE] Status: %d, Body: %s", resp.StatusCode, string(bodyBytes))
	var srResp ShiprocketOrderResponse
	if err := json.Unmarshal(bodyBytes, &srResp); err != nil {
		log.Printf("[SHIPROCKET WARN] Response parse error: %s", string(bodyBytes))
		return 0, 0, nil
	}

	log.Printf("[SHIPROCKET SUCCESS] Order %s dispatched! Shiprocket Order ID: %d, Shipment ID: %d", order.OrderID, srResp.OrderID, srResp.ShipmentID)
	return srResp.OrderID, srResp.ShipmentID, nil
}
