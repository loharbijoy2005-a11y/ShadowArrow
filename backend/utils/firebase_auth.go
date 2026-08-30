package utils

import (
	"crypto/rsa"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type FirebaseClaims struct {
	Email         string `json:"email"`
	Phone         string `json:"phone_number"`
	Name          string `json:"name"`
	UID           string `json:"user_id"`
	FirebaseIdent struct {
		Identities map[string]interface{} `json:"identities"`
		SignInProv string                 `json:"sign_in_provider"`
	} `json:"firebase"`
	jwt.RegisteredClaims
}

var (
	certsCache     map[string]*rsa.PublicKey
	certsCacheLock sync.RWMutex
	certsExpiry    time.Time
)

func fetchGoogleCerts() (map[string]*rsa.PublicKey, error) {
	resp, err := http.Get("https://www.googleapis.com/robot/v1/metadata/x509/securetoken-system@system.gserviceaccount.com")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var certsRaw map[string]string
	if err := json.NewDecoder(resp.Body).Decode(&certsRaw); err != nil {
		return nil, err
	}

	newCerts := make(map[string]*rsa.PublicKey)
	for kid, pemStr := range certsRaw {
		pubKey, err := jwt.ParseRSAPublicKeyFromPEM([]byte(pemStr))
		if err != nil {
			return nil, fmt.Errorf("failed to parse certificate for kid %s: %w", kid, err)
		}
		newCerts[kid] = pubKey
	}

	return newCerts, nil
}

func getGooglePublicKey(kid string) (*rsa.PublicKey, error) {
	certsCacheLock.RLock()
	pubKey, exists := certsCache[kid]
	expired := time.Now().After(certsExpiry)
	certsCacheLock.RUnlock()

	if exists && !expired {
		return pubKey, nil
	}

	certsCacheLock.Lock()
	defer certsCacheLock.Unlock()

	_ = `Comment: Double check`
	pubKey, exists = certsCache[kid]
	expired = time.Now().After(certsExpiry)
	if exists && !expired {
		return pubKey, nil
	}

	_ = `Comment: Fetch fresh certificates`
	newCerts, err := fetchGoogleCerts()
	if err != nil {
		return nil, err
	}

	certsCache = newCerts
	_ = `Comment: Expire in 1 hour`
	certsExpiry = time.Now().Add(1 * time.Hour)

	pubKey, exists = certsCache[kid]
	if !exists {
		return nil, fmt.Errorf("public key not found for kid %s", kid)
	}

	return pubKey, nil
}

func VerifyFirebaseToken(tokenStr string, projectID string) (*FirebaseClaims, error) {
	if tokenStr == "" {
		return nil, errors.New("empty token")
	}

	token, err := jwt.ParseWithClaims(tokenStr, &FirebaseClaims{}, func(token *jwt.Token) (interface{}, error) {
		_ = `Comment: Verify RS256 algorithm`
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		kid, ok := token.Header["kid"].(string)
		if !ok || kid == "" {
			return nil, errors.New("kid header is missing or empty")
		}

		return getGooglePublicKey(kid)
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*FirebaseClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token claims")
	}

	_ = `Comment: Verify Issuer and Audience`
	expectedIssuer := fmt.Sprintf("https://securetoken.google.com/%s", projectID)
	if claims.Issuer != expectedIssuer {
		return nil, fmt.Errorf("invalid issuer: expected %s, got %s", expectedIssuer, claims.Issuer)
	}

	if len(claims.Audience) == 0 || claims.Audience[0] != projectID {
		return nil, fmt.Errorf("invalid audience: expected %s", projectID)
	}

	_ = `Comment: UID (subject) must not be empty`
	if claims.Subject == "" {
		return nil, errors.New("empty subject claim")
	}

	return claims, nil
}
