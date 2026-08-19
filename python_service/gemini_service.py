"""
Gemini AI service for Shadow Arrow.
Handles chat sessions, order tracking intents, product catalog lookups,
and Gemini API calls with full fallback chains.

Uses the google-genai SDK (google.genai) with model=gemini-3.7-pro.
"""

import json
import logging
import random
import re
from config import GEMINI_API_KEY, GEMINI_MODEL
from backend_client import track_order, create_support_ticket, fetch_products

logger = logging.getLogger("gemini_service")

# ─── In-memory session store (replace with Redis for multi-instance deployments) ─
chat_sessions: dict[str, list[dict]] = {}

# Session states to track damage claim flow:
# { session_id: { "state": "WAITING_FOR_PRODUCT_ID" | "WAITING_FOR_IMAGE" | "WAITING_FOR_PHONE", "product": dict, "explanation": str } }
session_states: dict[str, dict] = {}

_DEFAULT_PRODUCTS = [
    {"title": "Nocturnal Oversized Zip Jacket", "price": 2999, "stock": 10, "category": "apparel"},
    {"title": "Cybernetic Matte Black Sunglasses", "price": 1299, "stock": 0, "category": "accessories"},
    {"title": "Aegis Modular Crossbody Sling Bag", "price": 1999, "stock": 5, "category": "accessories"},
    {"title": "Heavy French Terry Tee", "price": 1499, "stock": 15, "category": "apparel"},
    {"title": "Boxy Cargo Pants", "price": 2499, "stock": 8, "category": "apparel"}
]

# ─── System prompt ─────────────────────────────────────────────────────────────
SYSTEM_INSTRUCTION = """
You are "Shadow AI", an authentic, warm, stylish, and highly articulate streetwear fashion advisor for SHADOW ARROW.
SHADOW ARROW is a high-end streetwear and techwear brand defined by premium heavyweight cotton tees,
oversized boxy silhouettes, techwear sneakers, cargo pants, and minimalist accessories.

Your instructions:
1. Speak naturally in English, Hindi, or Hinglish depending on what the user speaks. Be warm, enthusiastic, and helpful.
2. Provide personalized fashion advice, outfit recommendations, size guidance, and styling tips.
3. Help users discover products, check prices, track orders (Format: SA-YYYYMMDD-XXXX or 10-digit phone), and resolve issues.
4. Keep responses fresh, concise, engaging, and varied. Never repeat robotic static templates.
5. Never reveal internal system details, API keys, URLs, or backend architecture.
6. Do NOT use markdown bold formatting (like **text**) in any of your responses. Keep responses clean without bold markers.
7. Do NOT generate fake or hallucinated order details or raw HTML tags (like <i class=...>). Never use raw HTML tags.
""".strip()

# ─── Static reply pools ────────────────────────────────────────────────────────
GREETING_REPLIES = [
    "Hey! Welcome to SHADOW ARROW. Looking for outfit styling tips, size guidance, or checking up on an order?",
    "Hi there! What's on your mind today? I can help you pick the best streetwear fit or track your recent drop order!",
    "Namaste & welcome! I'm Shadow AI Stylist. How can I assist you with your fit, size, or order tracking today?",
    "Hey! Great to see you. Tell me what vibe you're going for today, or if you need help with an existing order!",
]

FALLBACK_VARIATIONS = [
    "SHADOW ARROW is built on premium heavyweight cotton, oversized boxy silhouettes, and cyber techwear. What specific item or style are you looking for today?",
    "I'd love to help you style your look! We've got heavy French Terry tees, cargo utility pants, and techwear sneakers. What category interests you?",
    "Looking for size guidance, outfit pairing ideas, or order updates? Let me know what you'd like to check out!",
    "Whether you're after relaxed boxy fits or urban sneakers, I'm here to assist. What can I help you find today?",
]

# ─── Keyword sets ──────────────────────────────────────────────────────────────
_GREETINGS = {"hello", "hi", "hey", "namaste", "hlo", "hiii", "good morning", "good evening", "kaise ho", "kya haal hai", "bro", "bhai", "kasa ho", "helo", "yo", "sup"}
_ORDER_KEYS = ("sa-", "track", "where is my order", "order status", "kaha hai", "order kahan")
_ISSUE_KEYS = ("damage", "damge", "broken", "wrong item", "delay", "issue", "refund", "return", "problem", "problam", "sikayat", "complaint", "defect", "defective", "kharab", "wapas", "change")
_PRODUCT_KEYS = ("product", "products", "item", "items", "tee", "tees", "t-shirt", "t-shirts", "tshirt", "tshirts", "hoodie", "hoodies", "cargo", "cargos", "pant", "pants", "shoe", "shoes", "sneaker", "sneakers", "price", "prices", "collection", "catalog", "buy", "purchase", "dikhao", "kya hai")
_SIZE_KEYS = ("size", "fit", "small", "medium", "large", "xl", "xxl", "measurement")
_SNEAKER_KEYS = ("shoe", "sneaker", "footwear", "boot")
_STYLE_KEYS = ("pair", "match", "outfit", "style", "wear", "combos")


def _has_any(text: str, keywords: tuple | set) -> bool:
    for k in keywords:
        if k.endswith("-"):
            pattern = r'\b' + re.escape(k)
        else:
            pattern = r'\b' + re.escape(k) + r'\b'
        if re.search(pattern, text):
            return True
    return False


# ─── Main function ─────────────────────────────────────────────────────────────
def generate_chat_response(message: str, session_id: str = "default") -> str:
    """
    Generates an AI response using a layered pipeline:
      1. Greeting detection (instant reply, no API call)
      2. Order tracking intent → live backend lookup
      3. Support issue intent → auto-ticket creation
      4. Product catalog intent → live backend lookup
      5. Gemini API call with conversation history
      6. Contextual static fallbacks (size, sneaker, style, generic)
    """
    if session_id not in chat_sessions:
        chat_sessions[session_id] = []

    history = chat_sessions[session_id]
    lower = message.strip().lower()

    # ── 1. Stateful Damage Claim Verification ─────────────────────────────────
    state_data = session_states.get(session_id)
    if state_data:
        current_state = state_data.get("state")
        
        if current_state == "WAITING_FOR_PRODUCT_ID":
            matched_product = _find_product_in_text(lower)
            if matched_product:
                state_data["state"] = "WAITING_FOR_IMAGE"
                state_data["product"] = matched_product
                reply = f"Got it, the {matched_product.get('title')}. Please upload or share a clear photo of the damage so I can verify it."
                _append_history(history, message, reply)
                return reply
            else:
                reply = "Sorry, I couldn't find that product in our catalog. Could you please specify the exact product name (e.g., Nocturnal Oversized Zip Jacket)?"
                _append_history(history, message, reply)
                return reply

        elif current_state == "WAITING_FOR_IMAGE":
            img_url = _extract_image_url(message)
            if img_url:
                is_damaged, explanation = _verify_damage_with_gemini(img_url)
                if is_damaged:
                    phone = _extract_phone(message)
                    if phone:
                        ticket_res = create_support_ticket(phone, f"Verified damage on product {state_data['product'].get('title')}: {explanation}", "HIGH")
                        t_id = ticket_res.get("ticket_id", "TICK-LIVE")
                        reply = f"Thank you. The damage is verified: {explanation}. I've logged a priority support ticket ({t_id}) for phone {phone}. Our team will contact you shortly."
                        session_states.pop(session_id, None)
                        _append_history(history, message, reply)
                        return reply
                    else:
                        state_data["state"] = "WAITING_FOR_PHONE"
                        state_data["explanation"] = explanation
                        reply = f"Thank you. The damage is verified: {explanation}. Please share your 10-digit phone number so I can log a priority support ticket for you."
                        _append_history(history, message, reply)
                        return reply
                else:
                    reply = f"I checked the photo, but it doesn't seem to show clear damage: {explanation}. If you believe this is an error, please share another photo or contact our support team."
                    session_states.pop(session_id, None)
                    _append_history(history, message, reply)
                    return reply
            else:
                if any(w in lower for w in ("cancel", "no photo", "don't have", "nh hai", "nahi hai", "stop")):
                    session_states.pop(session_id, None)
                    reply = "Okay, I've cancelled the verification process. Let me know if you need anything else!"
                    _append_history(history, message, reply)
                    return reply
                reply = "Please share/upload a clear photo of the damage so I can verify it, or type 'cancel' to stop."
                _append_history(history, message, reply)
                return reply

        elif current_state == "WAITING_FOR_PHONE":
            phone = _extract_phone(message)
            if phone:
                ticket_res = create_support_ticket(phone, f"Verified damage on product {state_data['product'].get('title')}: {state_data.get('explanation')}", "HIGH")
                t_id = ticket_res.get("ticket_id", "TICK-LIVE")
                reply = f"I've logged a priority support ticket ({t_id}) for phone {phone}. Our team is reviewing this urgently and will contact you shortly."
                session_states.pop(session_id, None)
                _append_history(history, message, reply)
                return reply
            else:
                reply = "Please share a valid 10-digit phone number so I can create your support ticket."
                _append_history(history, message, reply)
                return reply

    # ── 1b. Check if user is starting a product damage claim ───────────────────
    is_damage_claim = any(k in lower for k in ("damage", "damge", "defect", "defective", "broken", "kharab")) and any(
        w in lower for w in ("product", "item", "jacket", "tee", "shirt", "pant", "cargo", "sneaker", "shoe", "glass", "bag")
    )
    if is_damage_claim:
        matched_product = _find_product_in_text(lower)
        if matched_product:
            img_url = _extract_image_url(message)
            if img_url:
                is_damaged, explanation = _verify_damage_with_gemini(img_url)
                if is_damaged:
                    phone = _extract_phone(message)
                    if phone:
                        ticket_res = create_support_ticket(phone, f"Verified damage on product {matched_product.get('title')}: {explanation}", "HIGH")
                        t_id = ticket_res.get("ticket_id", "TICK-LIVE")
                        reply = f"Thank you. The damage is verified: {explanation}. I've logged a priority support ticket ({t_id}) for phone {phone}. Our team will contact you shortly."
                        _append_history(history, message, reply)
                        return reply
                    else:
                        session_states[session_id] = {
                            "state": "WAITING_FOR_PHONE",
                            "product": matched_product,
                            "explanation": explanation
                        }
                        reply = f"Thank you. The damage is verified: {explanation}. Please share your 10-digit phone number so I can log a priority support ticket for you."
                        _append_history(history, message, reply)
                        return reply
                else:
                    reply = f"I checked the photo, but it doesn't seem to show clear damage: {explanation}. If you believe this is an error, please share another photo or contact our support team."
                    _append_history(history, message, reply)
                    return reply
            else:
                session_states[session_id] = {
                    "state": "WAITING_FOR_IMAGE",
                    "product": matched_product
                }
                reply = f"Got it, the {matched_product.get('title')}. Please upload or share a clear photo of the damage so I can verify it."
                _append_history(history, message, reply)
                return reply
        else:
            session_states[session_id] = {
                "state": "WAITING_FOR_PRODUCT_ID"
            }
            reply = "Which product is damaged? Please tell me the product name (e.g., Nocturnal Oversized Zip Jacket)."
            _append_history(history, message, reply)
            return reply



    # ── 2. Order Tracking ─────────────────────────────────────────────────────
    if _has_any(lower, _ORDER_KEYS):
        tokens = message.replace(":", " ").replace(",", " ").split()
        found_order_lookup = False
        for token in tokens:
            clean = token.strip().upper()
            if clean.startswith("SA-") or (len(clean) >= 10 and clean.isdigit()):
                found_order_lookup = True
                order_info = track_order(clean)
                if not order_info.get("error"):
                    reply = _format_order(order_info)
                    _append_history(history, message, reply)
                    return reply
                else:
                    reply = f"I couldn't find any active order matching '{clean}'. Please double check your Order ID (e.g., SA-20260817-XXXX) or registered 10-digit mobile number!"
                    _append_history(history, message, reply)
                    return reply

        if not found_order_lookup:
            reply = "Please share your Order ID (e.g., SA-20260817-XXXX) or your 10-digit registered mobile number so I can fetch your live order status!"
            _append_history(history, message, reply)
            return reply

    # ── 3. Support Ticket ─────────────────────────────────────────────────────
    if _has_any(lower, _ISSUE_KEYS):
        phone = _extract_phone(message)
        if phone:
            ticket_res = create_support_ticket(phone, message, "HIGH")
            if not ticket_res.get("error"):
                t_id = ticket_res.get("ticket_id", "TICK-LIVE")
                reply = (
                    f"I've logged a priority support ticket ({t_id}) for phone {phone}. "
                    "Our team is reviewing this urgently and will contact you shortly."
                )
                _append_history(history, message, reply)
                return reply
        else:
            # Let Gemini handle the issue dynamically
            gemini_reply = _call_gemini(message, history)
            if gemini_reply:
                _append_history(history, message, gemini_reply)
                return gemini_reply
            reply = "I understand you have an issue. Please share your 10-digit phone number so I can raise a priority support ticket for you."
            _append_history(history, message, reply)
            return reply

    # ── 4. Product Catalog ────────────────────────────────────────────────────
    if _has_any(lower, _PRODUCT_KEYS):
        products = fetch_products()
        if products:
            if any(k in lower for k in ("tee", "t-shirt", "tshirt", "hoodie")):
                matching = [p for p in products if "apparel" in p.get("category", "").lower() or "tee" in p.get("title", "").lower()]
            elif any(k in lower for k in ("pant", "cargo", "bottom")):
                matching = [p for p in products if any(k in p.get("title", "").lower() for k in ("cargo", "pant"))]
            elif any(k in lower for k in ("shoe", "sneaker", "footwear")):
                matching = [p for p in products if "footwear" in p.get("category", "").lower() or "sneaker" in p.get("title", "").lower()]
            else:
                matching = products[:3]

            if matching:
                lines = [
                    f"• {p.get('title')} — ₹{p.get('price', 0)} ({'In Stock' if p.get('stock', 0) > 0 else 'Out of Stock'})"
                    for p in matching[:3]
                ]
                reply = "Here are top SHADOW ARROW picks for you:\n\n" + "\n".join(lines) + "\n\nTap any item to view size options or add to cart!"
                _append_history(history, message, reply)
                return reply

    # ── 5. Gemini API ─────────────────────────────────────────────────────────
    gemini_reply = _call_gemini(message, history)
    if gemini_reply:
        _append_history(history, message, gemini_reply)
        return gemini_reply

    # ── 6. Contextual Static Fallback ─────────────────────────────────────────
    words = lower.split()
    first_word = words[0] if words else ""
    if lower in _GREETINGS or first_word in _GREETINGS or _has_any(lower, {"hello", "hi", "hey", "namaste", "hlo", "bro", "kasa ho", "kaise ho"}):
        reply = random.choice(GREETING_REPLIES)
    elif _has_any(lower, _SIZE_KEYS):
        reply = (
            "SHADOW ARROW pieces feature our signature drop-shoulder boxy fit. "
            "For a relaxed streetwear drape, stick with your normal size. "
            "For a fitted look, go one size down!"
        )
    elif _has_any(lower, _SNEAKER_KEYS):
        reply = "Our Cyber Sneakers feature dual-density EVA soles for maximum street traction and comfort. They run true to standard UK sizes."
    elif _has_any(lower, _STYLE_KEYS):
        reply = "A heavy oversized French Terry tee paired with boxy cargo pants and high-top cyber sneakers creates the ultimate urban street aesthetic."
    else:
        reply = random.choice(FALLBACK_VARIATIONS)

    _append_history(history, message, reply)
    return reply


# ─── Helpers ──────────────────────────────────────────────────────────────────
def _call_gemini(message: str, history: list[dict]) -> str | None:
    """Calls the Gemini SDK (google-genai). Returns None if the key is absent or the call fails."""
    if not GEMINI_API_KEY or len(GEMINI_API_KEY) < 20:
        return None

    try:
        from google import genai  # google-genai SDK (pip install google-genai)
        from google.genai import types

        client = genai.Client(api_key=GEMINI_API_KEY)

        # Include the last 6 exchanges for context
        prompt = f"Conversation history:\n{json.dumps(history[-6:], ensure_ascii=False)}\n\nUser: {message}"

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION
            )
        )
        return response.text.strip()

    except Exception as exc:
        logger.warning("[GEMINI] API call failed: %s", exc)
        return None


def _format_order(info: dict) -> str:
    order_id = info.get('order_id', 'N/A')
    order_status = info.get('order_status', 'PROCESSING')
    payment_status = info.get('payment_status', 'PENDING')
    payment_method = info.get('payment_method', 'N/A')
    courier_name = info.get('courier_partner') or info.get('courier_name') or 'Blue Dart Express'

    tracking_no = info.get('tracking_number') or info.get('awb_number')
    if tracking_no and str(tracking_no).upper() != "ASSIGNED":
        tracking_str = f" (AWB #{tracking_no})"
    else:
        tracking_str = ""

    delivery_eta = info.get('delivery_eta') or "3-5 Business Days"

    return (
        f"Here are your live order tracking details:\n\n"
        f"📦 Order Reference: #{order_id}\n"
        f"⚡ Status: {order_status}\n"
        f"💳 Payment: {payment_status} ({payment_method})\n"
        f"🚚 Courier: {courier_name}{tracking_str}\n"
        f"📅 Est. Delivery: {delivery_eta}"
    )


def _extract_phone(text: str) -> str:
    """Returns the first 10-digit numeric token found in text, or empty string."""
    for token in text.replace("-", " ").split():
        if len(token) == 10 and token.isdigit():
            return token
    return ""


def _append_history(history: list[dict], user_msg: str, assistant_msg: str) -> None:
    history.append({"role": "user", "content": user_msg})
    history.append({"role": "assistant", "content": assistant_msg})
    # Cap history at 20 turns to prevent unbounded memory growth
    if len(history) > 40:
        del history[:2]


def _find_product_in_text(text: str) -> dict | None:
    products = fetch_products()
    if not products:
        products = _DEFAULT_PRODUCTS
    lower_text = text.lower()
    for p in products:
        title = p.get("title", "").lower()
        if title in lower_text:
            return p
        # Check key terms
        ignore_words = {"oversized", "matte", "black", "modular", "crossbody", "sling", "heavy", "boxy"}
        words = [w for w in title.split() if len(w) > 3 and w not in ignore_words]
        if words and all(w in lower_text for w in words):
            return p
        if "jacket" in title and "jacket" in lower_text:
            return p
        if "sunglasses" in title and ("sunglasses" in lower_text or "glass" in lower_text or "glasses" in lower_text):
            return p
        if "bag" in title and ("bag" in lower_text or "sling" in lower_text):
            return p
        if "tee" in title and ("tee" in lower_text or "t-shirt" in lower_text or "tshirt" in lower_text):
            return p
        if "pants" in title and ("pants" in lower_text or "pant" in lower_text or "cargo" in lower_text):
            return p
    return None


def _extract_image_url(text: str) -> str | None:
    urls = re.findall(r'(https?://[^\s<>"]+)', text)
    for url in urls:
        clean_url = url.split("?")[0].lower()
        if any(clean_url.endswith(ext) for ext in (".jpg", ".jpeg", ".png", ".webp", ".gif")):
            return url
    return urls[0] if urls else None


def _verify_damage_with_gemini(img_url: str) -> tuple[bool, str]:
    if not GEMINI_API_KEY or len(GEMINI_API_KEY) < 20:
        return False, "Gemini API key is missing or invalid."

    try:
        import httpx
        from google import genai
        from google.genai import types

        logger.info("[GEMINI MULTIMODAL] Fetching image from %s", img_url)
        resp = httpx.get(img_url, timeout=10.0)
        if resp.status_code != 200:
            return False, f"Failed to download image (status code {resp.status_code})."

        content_type = resp.headers.get("content-type", "image/jpeg")
        image_part = types.Part.from_bytes(
            data=resp.content,
            mime_type=content_type
        )

        client = genai.Client(api_key=GEMINI_API_KEY)
        prompt = (
            "Analyze this product image. Is there visible damage (such as tears, holes, cracks, "
            "broken parts, major stains, or defects)? "
            "Respond in a strict format:\n"
            "Result: YES or NO\n"
            "Reason: <brief explanation of the damage or lack thereof in 1-2 sentences>"
        )

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[image_part, prompt]
        )

        resp_text = response.text.strip()
        logger.info("[GEMINI MULTIMODAL] Response: %s", resp_text)

        is_damaged = False
        reason = "Could not parse damage check details."

        for line in resp_text.split("\n"):
            line = line.strip()
            if line.upper().startswith("RESULT:"):
                result_val = line.split(":", 1)[1].strip().upper()
                if "YES" in result_val:
                    is_damaged = True
            elif line.upper().startswith("REASON:"):
                reason = line.split(":", 1)[1].strip()

        if "YES" not in resp_text.upper() and "NO" not in resp_text.upper():
            if "YES" in resp_text.upper() or "DAMAGED" in resp_text.upper() or "TEAR" in resp_text.upper() or "BROKEN" in resp_text.upper():
                is_damaged = True
            reason = resp_text

        return is_damaged, reason

    except Exception as exc:
        logger.exception("[GEMINI MULTIMODAL] Error verifying damage:")
        return False, f"Error calling Gemini multimodal: {str(exc)}"
