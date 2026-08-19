"""
Shadow Arrow AI Microservice
Standalone FastAPI server — deploy independently on Render, Railway, or any Python host.
Exposes POST /chat which calls Google Gemini and returns a JSON response.
"""

import logging
import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from config import PORT
from gemini_service import generate_chat_response

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ai_service")

# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Shadow Arrow AI Stylist Microservice",
    description="Standalone Gemini-powered AI assistant for Shadow Arrow streetwear.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Tighten to your frontend domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Schemas ──────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User message text")
    session_id: str = Field(default="default", description="Optional session ID for conversation history")


class ChatResponse(BaseModel):
    response: str
    status: str = "success"


# ─── Routes ───────────────────────────────────────────────────────────────────
@app.get("/", summary="Service info")
def root():
    return {
        "status": "online",
        "service": "Shadow Arrow AI Stylist Microservice",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", summary="Health check")
def health_check():
    return {"status": "healthy", "service": "shadow-arrow-ai-service", "port": PORT}


@app.post("/chat", response_model=ChatResponse, summary="AI chat endpoint")
async def chat_endpoint(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty.")

    logger.info("[CHAT] session=%s | message=%s", req.session_id, req.message[:80])

    try:
        reply = generate_chat_response(req.message, req.session_id)
        return ChatResponse(response=reply, status="success")
    except Exception as exc:
        logger.error("[CHAT ERROR] %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="AI service encountered an internal error.")


# ─── Global error handler ─────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error("[UNHANDLED] %s %s → %s", request.method, request.url, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "An unexpected error occurred in the AI service.", "status": "error"},
    )


# ─── Entry point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    logger.info("Starting Shadow Arrow AI Service on port %d...", PORT)
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=False)
