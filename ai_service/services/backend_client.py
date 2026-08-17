import requests
import logging
from config import BACKEND_URL

logger = logging.getLogger("backend_client")

def track_order(order_id_or_phone: str) -> dict:
    """Queries Golang backend GET /api/v1/orders/track/:id using phone number or order ID."""
    url = f"{BACKEND_URL}/api/v1/orders/track/{order_id_or_phone}"
    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            return resp.json()
        else:
            return {
                "error": True,
                "message": f"Order not found for '{order_id_or_phone}'. Please check the order ID or phone number."
            }
    except Exception as e:
        logger.error(f"Failed to query backend for order track: {e}")
        return {"error": True, "message": "Backend service unavailable at the moment."}

def create_support_ticket(customer_phone: str, issue_text: str, priority: str = "HIGH") -> dict:
    """Creates a support ticket in Golang backend POST /api/v1/tickets/create when user reports damage, delay, or wrong item."""
    url = f"{BACKEND_URL}/api/v1/tickets/create"
    payload = {
        "customer_phone": customer_phone,
        "issue_text": issue_text,
        "priority": priority,
        "status": "OPEN"
    }
    try:
        resp = requests.post(url, json=payload, timeout=5)
        if resp.status_code in [200, 201]:
            return resp.json()
        else:
            return {"error": True, "message": "Could not log support ticket automatically."}
    except Exception as e:
        logger.error(f"Failed to create support ticket: {e}")
        return {"error": True, "message": "Support service temporarily offline."}

def fetch_products(category: str = "") -> list:
    """Queries Golang backend GET /api/v1/products."""
    url = f"{BACKEND_URL}/api/v1/products?limit=50"
    if category:
        url += f"&category={category}"
    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, dict):
                return data.get("products", [])
            elif isinstance(data, list):
                return data
        return []
    except Exception as e:
        logger.error(f"Failed to fetch products for AI service: {e}")
        return []
