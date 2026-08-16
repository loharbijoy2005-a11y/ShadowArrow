import os
from dotenv import load_dotenv

load_dotenv()

# Use AI_PORT or default to 5001 so it doesn't collide with Golang backend PORT=8080
PORT = int(os.getenv("AI_PORT", os.getenv("PYTHON_PORT", 5001)))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.7-flash")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8080")
