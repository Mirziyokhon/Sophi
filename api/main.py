"""
FastAPI Backend for Rusaldo
Exposes all Streamlit functionality as REST APIs
"""
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List
import os
import json
import time
from datetime import datetime
from pathlib import Path
import shutil

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import config
from utils.text_extractor import TextExtractor
from utils.ai_processor import AIProcessor
from utils.video_generator import VideoGenerator
from utils.sketch_animator import SketchAnimator

app = FastAPI(title="Rusaldo API", version="1.0.0")

# CORS middleware to allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated videos
app.mount("/videos", StaticFiles(directory=config.VIDEO_OUTPUT_DIR), name="videos")

# Serve subtitle files
app.mount("/subtitles", StaticFiles(directory=config.VIDEO_OUTPUT_DIR), name="subtitles")


# Pydantic models
class ContentInput(BaseModel):
    text: str
    content_type: str = "text"


class PersonalizationInput(BaseModel):
    extracted_text: str
    interest_description: str
    duration_seconds: int


class VideoResponse(BaseModel):
    video_id: str
    filename: str
    video_url: str
    timestamp: str
    duration: int
    interest: str
    word_count: int
    media_type: str = "html"
    animation_html: Optional[str] = None


class HistoryResponse(BaseModel):
    videos: List[VideoResponse]
    total_count: int


# Helper functions
def save_uploaded_file(uploaded_file: UploadFile) -> str:
    """Save uploaded file and return path"""
    file_path = os.path.join(config.UPLOAD_DIR, uploaded_file.filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(uploaded_file.file, f)
    return file_path


def load_video_history():
    """Load video generation history"""
    history_file = os.path.join(config.VIDEO_OUTPUT_DIR, "history.json")
    if os.path.exists(history_file):
        with open(history_file, 'r') as f:
            return json.load(f)
    return []


def save_video_history(video_data):
    """Save video to history"""
    history_file = os.path.join(config.VIDEO_OUTPUT_DIR, "history.json")
    history = load_video_history()
    history.append(video_data)
    with open(history_file, 'w') as f:
        json.dump(history, f, indent=2)


# API Routes
@app.get("/")
async def root():
    return {"message": "Rusaldo API is running", "version": "1.0.0"}


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "openai_configured": bool(config.OPENAI_API_KEY),
        "gemini_configured": bool(config.GEMINI_API_KEY),
        "elevenlabs_configured": bool(config.ELEVENLABS_API_KEY),
        "stability_configured": bool(config.STABILITY_API_KEY),
    }


@app.post("/api/extract/pdf")
async def extract_pdf(file: UploadFile = File(...)):
    """Extract text from PDF"""
    try:
        file_path = save_uploaded_file(file)
        extracted_text, word_count = TextExtractor.extract('pdf', file_path)
        return {
            "success": True,
            "text": extracted_text,
            "word_count": word_count,
            "content_type": "pdf"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/extract/image")
async def extract_image(file: UploadFile = File(...)):
    """Extract text from image using OCR"""
    try:
        file_path = save_uploaded_file(file)
        extracted_text, word_count = TextExtractor.extract('image', file_path)
        return {
            "success": True,
            "text": extracted_text,
            "word_count": word_count,
            "content_type": "image"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/extract/url")
async def extract_url(url: str = Form(...)):
    """Extract text from web URL"""
    try:
        extracted_text, word_count = TextExtractor.extract('url', url)
        return {
            "success": True,
            "text": extracted_text,
            "word_count": word_count,
            "content_type": "url"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/extract/text")
async def extract_text(content: ContentInput):
    """Process plain text input"""
    try:
        word_count = len(content.text.split())
        if word_count > config.MAX_CONTENT_LENGTH:
            raise HTTPException(
                status_code=400,
                detail=f"Content exceeds maximum length of {config.MAX_CONTENT_LENGTH} words"
            )
        return {
            "success": True,
            "text": content.text,
            "word_count": word_count,
            "content_type": "text"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-video")
async def generate_video(data: PersonalizationInput):
    """Generate personalized video"""
    try:
        # Check API keys
        if not config.OPENAI_API_KEY and not config.GEMINI_API_KEY:
            raise HTTPException(
                status_code=500,
                detail="No AI API key configured. Please add OPENAI_API_KEY or GEMINI_API_KEY to .env"
            )
        
        # Initialize processors
        ai_processor = AIProcessor()
        
        # Step 1: Enhance interest profile
        enhanced_profile = ai_processor.enhance_interest_profile(data.interest_description)
        
        # Step 2: Process content
        processed_content = ai_processor.process_content(
            data.extracted_text,
            enhanced_profile,
            data.duration_seconds
        )

        # Step 3: Generate HTML sketch animation via Gemini
        html_document = ai_processor.generate_sketch_html(
            data.extracted_text,
            processed_content,
            data.duration_seconds,
            data.interest_description
        )

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"rusaldo_animation_{timestamp}.html"
        output_path = os.path.join(config.VIDEO_OUTPUT_DIR, output_filename)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_document)
        
        # Save to history
        video_data = {
            'video_id': timestamp,
            'filename': output_filename,
            'path': output_path,
            'video_url': f"/videos/{output_filename}",
            'timestamp': timestamp,
            'duration': data.duration_seconds,
            'interest': data.interest_description,
            'word_count': len(data.extracted_text.split()),
            'script': processed_content['script'],
            'summary': processed_content['summary'],
            'key_points': processed_content['key_points'],
            'takeaway': processed_content['takeaway'],
            'scene_details': processed_content.get('scene_details', []),
            'media_type': 'html',
            'animation_html': html_document
        }

        history_entry = video_data.copy()
        history_entry['animation_html'] = None
        save_video_history(history_entry)
        
        return {
            "success": True,
            "video_data": video_data,
            "processed_content": {
                "summary": processed_content['summary'],
                "key_points": processed_content['key_points'],
                "takeaway": processed_content['takeaway'],
                "script": processed_content['script'],
                "scene_details": processed_content.get('scene_details', [])
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-mp4-video")
async def generate_mp4_video(data: PersonalizationInput):
    """Generate personalized MP4 video with subtitles"""
    try:
        # Check API keys
        if not config.OPENAI_API_KEY and not config.GEMINI_API_KEY:
            raise HTTPException(
                status_code=500,
                detail="No AI API key configured. Please add OPENAI_API_KEY or GEMINI_API_KEY to .env"
            )
        
        # Initialize processors
        ai_processor = AIProcessor()
        
        # Step 1: Enhance interest profile
        enhanced_profile = ai_processor.enhance_interest_profile(data.interest_description)
        
        # Step 2: Process content
        processed_content = ai_processor.process_content(
            data.extracted_text,
            enhanced_profile,
            data.duration_seconds
        )

        # Step 3: Generate HTML animation (not MP4 video)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"rusaldo_animation_{timestamp}.html"
        output_path = os.path.join(config.VIDEO_OUTPUT_DIR, output_filename)
        
        # Generate HTML sketch animation via Gemini
        html_document = ai_processor.generate_sketch_html(
            data.extracted_text,
            processed_content,
            data.duration_seconds,
            data.interest_description
        )
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_document)
        
        # Save to history as HTML animation
        video_data = {
            'video_id': timestamp,
            'filename': output_filename,
            'path': output_path,
            'video_url': f"/videos/{output_filename}",
            'timestamp': timestamp,
            'duration': data.duration_seconds,
            'interest': data.interest_description,
            'word_count': len(data.extracted_text.split()),
            'script': processed_content['script'],
            'summary': processed_content['summary'],
            'key_points': processed_content['key_points'],
            'takeaway': processed_content['takeaway'],
            'scene_details': processed_content.get('scene_details', []),
            'media_type': 'html',
            'animation_html': html_document
        }

        history_entry = video_data.copy()
        save_video_history(history_entry)
        
        return {
            "success": True,
            "video_data": video_data,
            "processed_content": {
                "summary": processed_content['summary'],
                "key_points": processed_content['key_points'],
                "takeaway": processed_content['takeaway'],
                "script": processed_content['script'],
                "scene_details": processed_content.get('scene_details', [])
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/library")
async def get_library():
    """Get all generated videos"""
    try:
        history = load_video_history()
        return {
            "success": True,
            "videos": history,
            "total_count": len(history)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/video/{video_id}")
async def get_video(video_id: str):
    """Get specific video by ID"""
    try:
        history = load_video_history()
        video = next((v for v in history if v.get('video_id') == video_id), None)
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        return {"success": True, "video": video}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/library/clear")
async def clear_library():
    """Clear all video history"""
    try:
        history_file = os.path.join(config.VIDEO_OUTPUT_DIR, "history.json")
        if os.path.exists(history_file):
            os.remove(history_file)
        return {"success": True, "message": "Library cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/settings")
async def get_settings():
    """Get current settings and configuration"""
    try:
        videos_count = len(load_video_history())
        return {
            "success": True,
            "api_keys": {
                "openai": bool(config.OPENAI_API_KEY),
                "gemini": bool(config.GEMINI_API_KEY),
                "elevenlabs": bool(config.ELEVENLABS_API_KEY),
                "stability": bool(config.STABILITY_API_KEY),
            },
            "preset_interests": config.PRESET_INTERESTS,
            "video_durations": config.VIDEO_DURATIONS,
            "max_content_length": config.MAX_CONTENT_LENGTH,
            "stats": {
                "total_videos": videos_count
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Helper functions
def load_video_history():
    """Load video history from JSON file"""
    history_file = os.path.join(config.VIDEO_OUTPUT_DIR, "history.json")
    if os.path.exists(history_file):
        with open(history_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_video_history(video_data):
    """Save video data to history file"""
    history_file = os.path.join(config.VIDEO_OUTPUT_DIR, "history.json")
    history = load_video_history()
    history.append(video_data)
    
    # Keep only last 100 videos
    if len(history) > 100:
        history = history[-100:]
    
    os.makedirs(config.VIDEO_OUTPUT_DIR, exist_ok=True)
    with open(history_file, 'w', encoding='utf-8') as f:
        json.dump(history, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
