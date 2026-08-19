"""
Backend client — makes HTTP calls back to the Shadow Arrow Go backend
for order tracking and support ticket creation from within the AI service.
Uses httpx with explicit timeouts so a slow backend never blocks the AI response.
"""

import logging
import httpx
from config import BACKEND_URL

logger = logging.getLogger("backend_client")

# Single shared async-compatible client with sensible timeouts
_TIMEOUT = httpx.Timeout(connect=3.0, read=6.0, write=3.0, pool=3.0)


def track_order(order_id_or_phone: str) -> dict:
    """
    GET /api/v1/orders/track/{id}
    Accepts either a Shadow Arrow order ID (SA-YYYYMMDD-XXXX) or a 10-digit phone number.
    Returns the parsed JSON dict on success, or {"error": True, "message": "..."} on failure.
    """
    url = f"{BACKEND_URL}/api/v1/orders/track/{order_id_or_phone}"
    try:
        with httpx.Client(timeout=_TIMEOUT) as client:
            resp = client.get(url)
        if resp.status_code == 200:
            return resp.json()
        logger.warning("[BACKEND CLIENT] Order not found (%s): %s", resp.status_code, order_id_or_phone)
        return {
            "error": True,
            "message": f"No order found for '{order_id_or_phone}'. Please check the order ID or phone number.",
        }
    except httpx.TimeoutException:
        logger.error("[BACKEND CLIENT] Timeout while tracking order: %s", order_id_or_phone)
        return {"error": True, "message": "Order tracking is temporarily slow. Please try again in a moment."}
    except Exception as exc:
        logger.error("[BACKEND CLIENT] Unexpected error tracking order: %s", exc)
        return {"error": True, "message": "Backend service unavailable. Please try again shortly."}


def create_support_ticket(customer_phone: str, issue_text: str, priority: str = "HIGH") -> dict:
    """
    POST /api/v1/tickets/create
    Creates a support ticket in the Go backend.
    Returns the parsed JSON dict on success, or {"error": True, "message": "..."} on failure.
    """
    url = f"{BACKEND_URL}/api/v1/tickets/create"
    payload = {
        "customer_phone": customer_phone,
        "issue_text": issue_text,
        "priority": priority,
        "status": "OPEN",
    }
    try:
        with httpx.Client(timeout=_TIMEOUT) as client:
            resp = client.post(url, json=payload)
        if resp.status_code in (200, 201):
            return resp.json()
        logger.warning("[BACKEND CLIENT] Ticket creation failed (%s)", resp.status_code)
        return {"error": True, "message": "Could not log the support ticket automatically."}
    except httpx.TimeoutException:
        logger.error("[BACKEND CLIENT] Timeout creating support ticket for: %s", customer_phone)
        return {"error": True, "message": "Support service is temporarily slow. Please try again."}
    except Exception as exc:
        logger.error("[BACKEND CLIENT] Unexpected error creating ticket: %s", exc)
        return {"error": True, "message": "Support service temporarily offline."}


def fetch_products(category: str = "") -> list:
    """
    GET /api/v1/products?limit=50[&category=...]
    Returns a list of product dicts, or [] on any error.
    """
    url = f"{BACKEND_URL}/api/v1/products?limit=50"
    if category:
        url += f"&category={category}"
    try:
        with httpx.Client(timeout=_TIMEOUT) as client:
            resp = client.get(url)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, dict):
                return data.get("products", [])
            if isinstance(data, list):
                return data
        logger.warning("[BACKEND CLIENT] Product fetch returned %s", resp.status_code)
        return []
    except Exception as exc:
        logger.error("[BACKEND CLIENT] Failed to fetch products: %s", exc)
        return []
