"""
Configuration settings for Rusaldo application
"""
import os
from dotenv import load_dotenv
import pytesseract

load_dotenv()

# Configure Tesseract path for Windows
if os.name == 'nt':  # Windows
    tesseract_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    if os.path.exists(tesseract_path):
        pytesseract.pytesseract.tesseract_cmd = tesseract_path

# API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
REPLICATE_API_KEY = os.getenv("REPLICATE_API_KEY", "")
LUMA_API_KEY = os.getenv("LUMA_API_KEY", "")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "")
STABILITY_API_KEY = os.getenv("STABILITY_API_KEY", "")
PIKA_API_KEY = os.getenv("PIKA_API_KEY", "")
RUNWAY_API_KEY = os.getenv("RUNWAY_API_KEY", "")

# AWS Configuration
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME", "rusaldo-videos")

# Application Settings
MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", "3000"))
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
VIDEO_STORAGE_DAYS = int(os.getenv("VIDEO_STORAGE_DAYS", "30"))

# Directories
UPLOAD_DIR = "uploads"
VIDEO_OUTPUT_DIR = "generated_videos"
TEMP_DIR = "temp"

# Supported formats
SUPPORTED_PDF_EXTENSIONS = [".pdf"]
SUPPORTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".bmp", ".tiff"]
SUPPORTED_EXTENSIONS = SUPPORTED_PDF_EXTENSIONS + SUPPORTED_IMAGE_EXTENSIONS

# Video duration options (in seconds)
VIDEO_DURATIONS = {
    "0.5 minutes": 30,
    "1 minute": 60,
    "1.5 minutes": 90,
    "2 minutes": 120,
    "3 minutes": 180
}

# Preset interests
PRESET_INTERESTS = [
    "No Interest",
    "Football & Soccer",
    "Basketball",
    "Art & Design",
    "Business & Entrepreneurship",
    "Gaming & Esports",
    "Music & Instruments",
    "Cooking & Food",
    "Technology & Coding",
    "Fashion & Style",
    "Travel & Adventure",
    "History & Culture"
]

# Create necessary directories
for directory in [UPLOAD_DIR, VIDEO_OUTPUT_DIR, TEMP_DIR]:
    os.makedirs(directory, exist_ok=True)
