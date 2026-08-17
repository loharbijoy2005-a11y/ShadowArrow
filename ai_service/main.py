from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import logging
from config import PORT
from services.gemini_service import generate_chat_response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_service")

app = FastAPI(title="Shadow AI Stylist & Support Microservice", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"

class ChatResponse(BaseModel):
    response: str
    status: str = "success"

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Shadow AI Stylist & Support Microservice",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai_service", "port": PORT}

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty")
    
    reply = generate_chat_response(req.message, req.session_id)
    return ChatResponse(response=reply, status="success")

if __name__ == "__main__":
    logger.info(f"Starting Python AI Service on port {PORT}...")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
