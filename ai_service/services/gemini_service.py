import logging
import json
import os
import random
from config import GEMINI_API_KEY, GEMINI_MODEL
from services.backend_client import track_order, create_support_ticket

logger = logging.getLogger("gemini_service")

chat_sessions = {}

SYSTEM_INSTRUCTION = """
You are "Shadow AI", an authentic, warm, and articulate streetwear fashion stylist for SHADOW ARROW.
SHADOW ARROW is a high-end streetwear and techwear brand defined by premium heavyweight cotton tees, oversized boxy silhouettes, techwear sneakers, and minimalist accessories.

Your instructions:
1. Greet the user naturally and warmly in their language (English, Hindi, or Hinglish).
   - If they say "hello", "hi", "hey", or "namaste", respond with: "Hi there! Welcome to SHADOW ARROW. How can I help you find the perfect fit, style, or order today?"
2. Act as a knowledgeable, creative, and human fashion advisor. Suggest outfit pairings, color styling, layer recommendations, and size guidance without repeating robotic GSM specs.
3. If the user asks to track an order (Order ID format: SA-YYYYMMDD-XXXX or phone number), look up their order details and present them clearly.
4. If the user reports damaged items or delivery issues, offer immediate assistance and log a support ticket for them.
"""

def generate_chat_response(message: str, session_id: str = "default") -> str:
    """Generates AI response using Gemini with tool calling & session history."""
    if session_id not in chat_sessions:
        chat_sessions[session_id] = []
    
    history = chat_sessions[session_id]
    lower_msg = message.strip().lower()
    
    # 1. Greeting Check
    greetings = ["hello", "hi", "hey", "namaste", "hlo", "hiii", "good morning", "good evening"]
    if lower_msg in greetings:
        reply = "Hi there! Welcome to SHADOW ARROW. How can I help you find the perfect fit, style, or order today?"
        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": reply})
        return reply

    # 2. Order Tracking Check
    if "sa-" in lower_msg or "track" in lower_msg or "where is my order" in lower_msg or "order status" in lower_msg:
        words = message.replace(":", " ").replace(",", " ").split()
        for word in words:
            if word.upper().startswith("SA-") or (len(word) >= 10 and word.isdigit()):
                order_info = track_order(word.strip())
                if not order_info.get("error"):
                    summary = (
                        f"• Order Ref: #{order_info.get('order_id')}\n"
                        f"• Current Status: {order_info.get('order_status')}\n"
                        f"• Payment: {order_info.get('payment_status')} ({order_info.get('payment_method')})\n"
                        f"• Courier: {order_info.get('courier_name', 'BlueDart Express')} (Tracking #{order_info.get('tracking_number', 'AWB-ASSIGNED')})\n"
                        f"• Estimated Delivery: {order_info.get('delivery_eta')}"
                    )
                    return f"Here are your live order details:\n\n{summary}\n\nIs there anything else I can help you style or track today?"

    # 3. Support Ticket Check
    if any(k in lower_msg for k in ["damage", "broken", "wrong item", "delay", "issue", "refund", "return"]):
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
                return f"I'm so sorry to hear that! I've opened a priority support ticket ({t_id}) with our customer care team for your contact ({phone}). We'll get this sorted out for you right away."

    # 4. Gemini API Call via google.generativeai SDK
    try:
        import google.generativeai as genai
        if GEMINI_API_KEY and len(GEMINI_API_KEY) > 10:
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
        logger.warning(f"Gemini API fallback note: {e}")

    # 5. Natural Fashion Advisor Fallbacks
    if any(k in lower_msg for k in ["size", "fit", "small", "medium", "large", "xl", "measurement"]):
        reply = "SHADOW ARROW pieces feature our signature drop-shoulder boxy silhouette. If you prefer a relaxed streetwear drape, go with your true size. For a tailored fit, size down!"
    elif any(k in lower_msg for k in ["shoe", "sneaker", "footwear", "boot"]):
        reply = "Our Cyber Sneakers feature dual-density EVA soles for urban traction and day-long street comfort. They fit true to standard UK sizing."
    elif any(k in lower_msg for k in ["pair", "match", "outfit", "style", "wear"]):
        reply = "Try pairing an oversized black French Terry tee with dark cargo utility pants or techwear joggers, finished with high-top cyber sneakers for a clean urban aesthetic."
    else:
        reply = "SHADOW ARROW streetwear is built for urban comfort and minimal aesthetics. How can I help you style or track your order today?"
    
    history.append({"role": "user", "content": message})
    history.append({"role": "assistant", "content": reply})
    return reply
