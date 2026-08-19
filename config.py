"""
Configuration loader for the Shadow Arrow AI Microservice.
All settings are read from environment variables (or a .env file via python-dotenv).
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Server port — Render injects $PORT automatically; fall back to 5001 for local dev.
PORT: int = int(os.getenv("PORT", os.getenv("AI_PORT", 5001)))

# Google Gemini credentials
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.7-flash")

# URL of the Shadow Arrow Go backend (used for order tracking & ticket creation callbacks)
BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8080")

# Sanity check at startup — warn if API key is missing or looks like a placeholder
if not GEMINI_API_KEY or len(GEMINI_API_KEY) < 20:
    import warnings
    warnings.warn(
        "[CONFIG] GEMINI_API_KEY is missing or too short. "
        "AI responses will fall back to static replies.",
        RuntimeWarning,
        stacklevel=1,
    )
