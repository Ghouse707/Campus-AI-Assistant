import os
from pathlib import Path
from dotenv import load_dotenv

# Base backend directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file
load_dotenv(BASE_DIR / ".env")

# Database Path
DB_PATH = BASE_DIR / "campus_ai.db"

# Upload Directories
UPLOADS_DIR = BASE_DIR / "uploads"
PDFS_DIR = UPLOADS_DIR / "pdfs"
IMAGES_DIR = UPLOADS_DIR / "images"

# Ensure directories exist
PDFS_DIR.mkdir(parents=True, exist_ok=True)
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# Authentication Settings
JWT_SECRET = os.getenv("JWT_SECRET", "campus_ai_super_secret_jwt_key_2026")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# AI API Keys (Optional - works out of the box with local RAG)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()

# OCR Settings
TESSERACT_CMD = os.getenv("TESSERACT_CMD", "").strip()
