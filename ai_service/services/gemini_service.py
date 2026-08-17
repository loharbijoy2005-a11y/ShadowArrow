import logging
import json
import os
import random
from config import GEMINI_API_KEY, GEMINI_MODEL
from services.backend_client import track_order, create_support_ticket, fetch_products

logger = logging.getLogger("gemini_service")

chat_sessions = {}

SYSTEM_INSTRUCTION = """
You are "Shadow AI", an authentic, warm, stylish, and highly articulate streetwear fashion advisor for SHADOW ARROW.
SHADOW ARROW is a high-end streetwear and techwear brand defined by premium heavyweight cotton tees, oversized boxy silhouettes, techwear sneakers, cargo pants, and minimalist accessories.

Your instructions:
1. Speak naturally in English, Hindi, or Hinglish depending on what the user speaks. Be warm, enthusiastic, and helpful.
2. Provide personalized fashion advice, outfit recommendations, size guidance, and styling tips.
3. Help users discover products, check prices, track orders (Format: SA-YYYYMMDD-XXXX or 10-digit phone), and resolve issues.
4. Keep responses fresh, concise, engaging, and varied. Never repeat robotic static templates.
"""

GREETING_REPLIES = [
    "Hey! Welcome to SHADOW ARROW. Looking for outfit styling tips, size guidance, or checking up on an order?",
    "Hi there! What's on your mind today? I can help you pick the best streetwear fit or track your recent drop order!",
    "Namaste & welcome! I'm Shadow AI Stylist. How can I assist you with your fit, size, or order tracking today?",
    "Hey! Great to see you. Tell me what vibe you're going for today, or if you need help with an existing order!",
]

FALLBACK_VARIATIONS = [
    "SHADOW ARROW is built on premium heavyweight cotton, oversized boxy silhouettes, and cyber techwear. What specific item or style are you looking for today?",
    "I'd love to help you style your look! We've got heavy French Terry tees, cargo utility pants, and techwear sneakers. What category interest you?",
    "Looking for size guidance, outfit pairing ideas, or order updates? Let me know what you'd like to check out!",
    "Whether you're after relaxed boxy fits or urban sneakers, I'm here to assist. What can I help you find today?",
]

def generate_chat_response(message: str, session_id: str = "default") -> str:
    """Generates AI response using Gemini with tool calling, product catalog & session history."""
    if session_id not in chat_sessions:
        chat_sessions[session_id] = []
    
    history = chat_sessions[session_id]
    lower_msg = message.strip().lower()
    
    # 1. Natural Greeting Check
    greetings = ["hello", "hi", "hey", "namaste", "hlo", "hiii", "good morning", "good evening", "kaise ho", "kya haal hai"]
    if lower_msg in greetings or any(lower_msg == g for g in greetings):
        reply = random.choice(GREETING_REPLIES)
        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": reply})
        return reply

    # 2. Order Tracking Check
    if "sa-" in lower_msg or "track" in lower_msg or "where is my order" in lower_msg or "order status" in lower_msg or "kaha hai" in lower_msg:
        words = message.replace(":", " ").replace(",", " ").split()
        for word in words:
            clean_word = word.strip().upper()
            if clean_word.startswith("SA-") or (len(clean_word) >= 10 and clean_word.isdigit()):
                order_info = track_order(clean_word)
                if not order_info.get("error"):
                    summary = (
                        f"📦 **Order Reference:** #{order_info.get('order_id')}\n"
                        f"⚡ **Status:** {order_info.get('order_status')}\n"
                        f"💳 **Payment:** {order_info.get('payment_status')} ({order_info.get('payment_method')})\n"
                        f"🚚 **Courier:** {order_info.get('courier_name', 'BlueDart Express')} (AWB #{order_info.get('tracking_number', 'ASSIGNED')})\n"
                        f"📅 **Estimated Delivery:** {order_info.get('delivery_eta')}"
                    )
                    return f"Here are your live order tracking details:\n\n{summary}\n\nNeed help with anything else?"

    # 3. Support Ticket Check
    if any(k in lower_msg for k in ["damage", "broken", "wrong item", "delay", "issue", "refund", "return", "problem", "sikayat"]):
        words = message.replace("-", "").split()
        phone = ""
        for w in words:
            if len(w) == 10 and w.isdigit():
                phone = w
                break
        if phone:
            ticket_res = create_support_ticket(phone, message, "HIGH")
            if not ticket_res.get("error"):
                t_id = ticket_res.get("ticket_id", "TICK-LIVE")
                return f"I've logged a priority support ticket (**{t_id}**) for your phone number **{phone}**. Our team is reviewing this urgently and will get back to you shortly."

    # 4. Product Search & Catalog Assist
    if any(k in lower_msg for k in ["product", "item", "tee", "t-shirt", "tshirt", "hoodie", "cargo", "pant", "shoe", "sneaker", "price", "collection", "catalog", "buy", "purchase", "dikhao", "dikhaye", "kya hai"]):
        products = fetch_products()
        if products:
            matching = []
            if "tee" in lower_msg or "t-shirt" in lower_msg or "tshirt" in lower_msg:
                matching = [p for p in products if p.get('category') == 'Apparel' or 'tee' in p.get('title', '').lower()]
            elif "pant" in lower_msg or "cargo" in lower_msg or "bottom" in lower_msg:
                matching = [p for p in products if 'cargo' in p.get('title', '').lower() or 'pant' in p.get('title', '').lower()]
            elif "shoe" in lower_msg or "sneaker" in lower_msg or "footwear" in lower_msg:
                matching = [p for p in products if p.get('category') == 'Footwear' or 'sneaker' in p.get('title', '').lower()]
            else:
                matching = products[:3]

            if matching:
                item_lines = []
                for p in matching[:3]:
                    price = p.get('price', 0)
                    stock_str = "In Stock" if p.get('stock', 0) > 0 else "Out of Stock"
                    item_lines.append(f"• **{p.get('title')}** - ₹{price} ({stock_str})")
                
                reply_list = "\n".join(item_lines)
                return f"Here are top SHADOW ARROW catalog recommendations for you:\n\n{reply_list}\n\nClick on any product to view size options or add to cart!"

    # 5. Gemini API Call (if valid API key present)
    try:
        import google.generativeai as genai
        if GEMINI_API_KEY and len(GEMINI_API_KEY) > 25 and not GEMINI_API_KEY.startswith("AQ."):
            genai.configure(api_key=GEMINI_API_KEY)
            try:
                model = genai.GenerativeModel(model_name=GEMINI_MODEL, system_instruction=SYSTEM_INSTRUCTION)
            except Exception:
                model = genai.GenerativeModel(model_name="gemini-1.5-flash", system_instruction=SYSTEM_INSTRUCTION)
            
            prompt_content = f"Conversation history: {json.dumps(history[-6:])}\nUser: {message}"
            response = model.generate_content(prompt_content)
            reply_text = response.text.strip()
            
            history.append({"role": "user", "content": message})
            history.append({"role": "assistant", "content": reply_text})
            return reply_text
    except Exception as e:
        logger.warning(f"Gemini API note: {e}")

    # 6. Dynamic Fashion Advisor Fallbacks (Varied & Contextual)
    if any(k in lower_msg for k in ["size", "fit", "small", "medium", "large", "xl", "xxl", "measurement"]):
        reply = "SHADOW ARROW pieces feature our signature drop-shoulder boxy fit. If you prefer a relaxed streetwear drape, stick with your normal size. For a fitted look, go one size down!"
    elif any(k in lower_msg for k in ["shoe", "sneaker", "footwear", "boot"]):
        reply = "Our Cyber Sneakers feature dual-density EVA soles for maximum street traction and comfort. They fit true to standard UK sizes."
    elif any(k in lower_msg for k in ["pair", "match", "outfit", "style", "wear", "combos"]):
        reply = "A heavy oversized French Terry tee paired with boxy cargo pants and high-top cyber sneakers creates the ultimate urban street aesthetic."
    else:
        reply = random.choice(FALLBACK_VARIATIONS)
    
    history.append({"role": "user", "content": message})
    history.append({"role": "assistant", "content": reply})
    return reply
