"""
FastAPI Backend Server for Sophi
Handles API requests from Next.js frontend on port 3000
"""
from fastapi import FastAPI, HTTPException, UploadFile, File, Request, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Union
from datetime import datetime
import uvicorn
import json
from pathlib import Path
import os
import sys
import shutil

import config
from auth import models
from utils.text_extractor import TextExtractor
from utils.ai_processor import AIProcessor
from utils.video_generator import VideoGenerator
from utils.html_to_video import HTMLToVideoConverter
from utils.sketch_animator import SketchAnimator
from utils.queue_handler import request_queue, user_rate_limiter
from utils.duration_recommender import DurationRecommender
from auth.router import router as auth_router
from auth.dependencies import require_current_user, require_verified_user

app = FastAPI(title="Sophi API", version="1.0.0")

# CORS configuration for Next.js frontend
frontend_origin = os.getenv(
    "FRONTEND_URL",
    "https://sophi-frontend-1115776966.europe-west1.run.app",
)
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    frontend_origin,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for video serving
if os.path.exists(config.VIDEO_OUTPUT_DIR):
    app.mount("/videos", StaticFiles(directory=config.VIDEO_OUTPUT_DIR), name="videos")

# Authentication routes
app.include_router(auth_router)

class PDFInfoRequest(BaseModel):
    pass

class PDFExtractRequest(BaseModel):
    pages: Union[str, List[int]] = "all"

# Pydantic models
class TextExtractRequest(BaseModel):
    text: str
    content_type: str = "text"

class VideoGenerationRequest(BaseModel):
    extracted_text: str
    interest_description: str
    duration_seconds: int
    animation_style: str = "html"

class ExtractResponse(BaseModel):
    success: bool
    text: str
    word_count: int
    content_type: str

class VideoData(BaseModel):
    video_id: str
    filename: str
    video_url: str
    timestamp: str
    duration: int
    interest: str
    word_count: int
    script: Optional[str] = None
    summary: Optional[str] = None
    key_points: Optional[List[str]] = None
    takeaway: Optional[str] = None
    media_type: Optional[str] = "video"
    subtitle_path: Optional[str] = None
    subtitle_url: Optional[str] = None

# Helper functions
def save_uploaded_file(upload_file: UploadFile) -> str:
    """Save uploaded file to uploads directory"""
    os.makedirs(config.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(config.UPLOAD_DIR, upload_file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return file_path

def get_video_metadata_path(video_id: str) -> Path:
    """Get path to video metadata JSON file"""
    return Path(config.VIDEO_OUTPUT_DIR) / f"{video_id}_metadata.json"

def save_video_metadata(video_data: dict):
    """Save video metadata to JSON file"""
    metadata_path = get_video_metadata_path(video_data['video_id'])
    with open(metadata_path, 'w') as f:
        json.dump(video_data, f, indent=2)

def load_video_metadata(video_id: str) -> Optional[dict]:
    """Load video metadata from JSON file"""
    metadata_path = get_video_metadata_path(video_id)
    if metadata_path.exists():
        with open(metadata_path, 'r') as f:
            return json.load(f)
    return None

def get_all_videos() -> List[dict]:
    """Get all video metadata from directory"""
    videos = []
    video_dir = Path(config.VIDEO_OUTPUT_DIR)
    if video_dir.exists():
        for metadata_file in video_dir.glob("*_metadata.json"):
            try:
                with open(metadata_file, 'r') as f:
                    videos.append(json.load(f))
            except Exception as e:
                print(f"Error loading {metadata_file}: {e}")
    return sorted(videos, key=lambda x: x.get('timestamp', ''), reverse=True)

# API Routes
@app.get("/")
async def root():
    return {"message": "Sophi API Server", "status": "running"}

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "openai_configured": bool(config.OPENAI_API_KEY),
        "gemini_configured": bool(config.GEMINI_API_KEY),
        "elevenlabs_configured": bool(config.ELEVENLABS_API_KEY),
        "stability_configured": bool(config.STABILITY_API_KEY),
    }

@app.post("/api/pdf/info")
async def get_pdf_info(file: UploadFile = File(...)):
    """Get PDF information including page count and previews"""
    try:
        file_path = save_uploaded_file(file)
        pdf_info = TextExtractor.get_pdf_info(file_path)
        
        # Generate previews for all pages
        previews = TextExtractor.generate_pdf_previews(file_path)
        
        return {
            "success": True,
            "pdf_info": pdf_info,
            "previews": previews,
            "preview_count": len(previews)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/extract/pdf")
async def extract_pdf(file: UploadFile = File(...), pages: str = Form("all")):
    """Extract text from PDF file with page selection"""
    try:
        file_path = save_uploaded_file(file)
        
        # Parse pages parameter
        if pages == "all":
            pages_param = "all"
        elif "," in pages:
            # Multiple pages (e.g., "1,3,5")
            pages_param = [int(p.strip()) for p in pages.split(",") if p.strip().isdigit()]
        elif pages.isdigit():
            # Single page
            pages_param = int(pages)
        else:
            raise ValueError("Invalid pages format. Use 'all', single page number, or comma-separated page numbers.")
        
        extracted_text, word_count, was_truncated = TextExtractor.extract('pdf', (file_path, pages_param))
        
        # Add truncation message if needed
        if was_truncated:
            extracted_text = f"[Content truncated to first 3000 words]\n\n{extracted_text}"
        
        return ExtractResponse(
            success=True,
            text=extracted_text,
            word_count=word_count,
            content_type="pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/extract/image")
async def extract_image(file: UploadFile = File(...)):
    """Extract text from image using OCR"""
    try:
        file_path = save_uploaded_file(file)
        extracted_text, word_count, was_truncated = TextExtractor.extract('image', file_path)
        
        # Add truncation message if needed
        if was_truncated:
            extracted_text = f"[Content truncated to first 3000 words]\n\n{extracted_text}"
        
        return ExtractResponse(
            success=True,
            text=extracted_text,
            word_count=word_count,
            content_type="image"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/extract/url")
async def extract_url(url: str = Form(...)):
    """Extract text from URL"""
    try:
        extracted_text, word_count, was_truncated = TextExtractor.extract('url', url)
        
        # Add truncation message to the text if it was truncated
        if was_truncated:
            extracted_text = f"[Content truncated to first 3000 words]\n\n{extracted_text}"
        
        return ExtractResponse(
            success=True,
            text=extracted_text,
            word_count=word_count,
            content_type="url"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/extract/text")
async def extract_text(request: TextExtractRequest):
    """Process plain text input"""
    try:
        extracted_text, word_count, was_truncated = TextExtractor.extract('text', request.text)
        
        # Add truncation message if needed
        if was_truncated:
            extracted_text = f"[Content truncated to first 3000 words]\n\n{extracted_text}"
        
        return ExtractResponse(
            success=True,
            text=extracted_text,
            word_count=word_count,
            content_type="text"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/recommend-duration")
async def recommend_duration(request: dict):
    """Get intelligent duration recommendation based on content"""
    try:
        text = request.get('text', '')
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text provided")
        
        # Get recommendation
        recommendation = DurationRecommender.get_duration_recommendation(text)
        
        # Get quality scores for all options
        quality_scores = []
        for duration in recommendation['all_options']:
            score = DurationRecommender.get_duration_quality_score(
                duration, 
                recommendation['word_count'], 
                recommendation['complexity_score']
            )
            quality_scores.append(score)
        
        return {
            "success": True,
            "recommendation": recommendation,
            "quality_scores": quality_scores
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

async def _generate_video_logic(
    request: VideoGenerationRequest,
    http_request: Request,
    current_user: models.User,
):
    """Generate personalized learning video with rate limiting and queue management"""
    try:
        user_id = str(current_user.id)

        # Check user rate limit
        can_proceed, error_msg = user_rate_limiter.can_make_request(user_id)
        if not can_proceed:
            raise HTTPException(status_code=429, detail=error_msg)

        # Record the request
        user_rate_limiter.record_request(user_id)

        # Get queue status for logging
        queue_status = request_queue.get_queue_status()
        print(f"📊 Queue status: {queue_status['message']}")

        # Initialize processors
        print("🔧 Initializing AI processor...")
        ai_processor = AIProcessor()
        is_sketch = request.animation_style.lower() == "sketch"

        # Enhance interest profile
        print("🧠 Enhancing interest profile...")
        enhanced_profile = ai_processor.enhance_interest_profile(request.interest_description)
        print(f"✅ Enhanced profile: {enhanced_profile[:100]}...")

        # Process content
        print(f"📝 Processing content (length: {len(request.extracted_text)} chars)...")
        processed_content = ai_processor.process_content(
            request.extracted_text,
            enhanced_profile,
            request.duration_seconds,
        )
        print("✅ Content processed successfully")

        # Generate video
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"sophi_video_{timestamp}.mp4"

        if is_sketch:
            sketch_animator = SketchAnimator()
            scene_plan = []

            for i, point in enumerate(processed_content["key_points"][:5]):
                scene_plan.append(
                    {
                        "scene_number": i,
                        "narration": point,
                        "visual_description": f"Illustration of: {point}",
                        "duration": request.duration_seconds
                        / len(processed_content["key_points"][:5]),
                    }
                )

            video_result = sketch_animator.generate_video_from_scenes(
                scene_plan, output_filename=output_filename
            )
        elif request.animation_style.lower() == "html":
            print(f"\n{'='*60}")
            print("📹 VIDEO GENERATION PIPELINE STARTED")
            print(f"{'='*60}")

            print("\n🔵 CHECKPOINT 1/4: Generating HTML Animation with Gemini 3 Pro...")
            html_content = ai_processor.generate_sketch_html(
                request.extracted_text,
                processed_content,
                request.duration_seconds,
                request.interest_description,
            )
            print(f"✅ CHECKPOINT 1/4: HTML animation generated ({len(html_content)} bytes)")

            print("\n🔵 CHECKPOINT 2/4: Saving HTML animation to file...")
            html_filename = output_filename.replace(".mp4", ".html")
            html_path = Path(config.VIDEO_OUTPUT_DIR) / html_filename
            html_path.parent.mkdir(parents=True, exist_ok=True)

            with open(html_path, "w", encoding="utf-8") as f:
                f.write(html_content)
            print(f"✅ CHECKPOINT 2/4: HTML saved to {html_path}")

            print("\n🔵 CHECKPOINT 3/4: Recording HTML with Playwright...")
            mp4_path = Path(config.VIDEO_OUTPUT_DIR) / output_filename

            import subprocess

            recorder_script = Path(__file__).parent / "utils" / "html_recorder.py"

            print(f"   📍 Recorder script: {recorder_script}")
            print(f"   📍 HTML path: {html_path.absolute()}")
            print(f"   📍 MP4 path: {mp4_path.absolute()}")
            print(f"   📍 Duration: {request.duration_seconds}s")
            print(f"   ⏳ Recording in progress (this takes ~{request.duration_seconds + 10}s)...")

            try:
                result = subprocess.run(
                    [
                        sys.executable,
                        str(recorder_script),
                        str(html_path.absolute()),
                        str(mp4_path.absolute()),
                        "--duration",
                        str(request.duration_seconds),
                    ],
                    capture_output=True,
                    text=True,
                    timeout=request.duration_seconds + 120,
                )

                if result.stdout:
                    print("   📝 Recorder output:")
                    for line in result.stdout.strip().split("\n"):
                        print(f"      {line}")
                if result.stderr:
                    print("   ⚠️ Recorder errors:")
                    for line in result.stderr.strip().split("\n"):
                        print(f"      {line}")

                if result.returncode == 0 and mp4_path.exists():
                    mp4_size = mp4_path.stat().st_size / (1024 * 1024)
                    print(f"✅ CHECKPOINT 3/4: Playwright recording complete ({mp4_size:.2f} MB)")

                    print("\n🔵 CHECKPOINT 4/4: Finalizing MP4 video...")
                    print("✅ CHECKPOINT 4/4: MP4 video ready!")
                    print(f"\n{'='*60}")
                    print("🎉 VIDEO GENERATION PIPELINE COMPLETED SUCCESSFULLY")
                    print(f"   Output: {mp4_path}")
                    print(f"{'='*60}\n")

                    video_result = {
                        "video_path": str(mp4_path),
                        "duration": request.duration_seconds,
                        "media_type": "video",
                    }
                else:
                    print(
                        f"❌ CHECKPOINT 3/4: Playwright recording FAILED (exit code: {result.returncode})"
                    )
                    print(f"\n{'='*60}")
                    print("⚠️ FALLING BACK TO HTML ANIMATION")
                    print(f"{'='*60}\n")
                    video_result = {
                        "video_path": str(html_path),
                        "html_path": str(html_path),
                        "html_url": f"/videos/{html_filename}",
                        "html_content": html_content,
                        "duration": request.duration_seconds,
                        "media_type": "html_animation",
                    }
            except subprocess.TimeoutExpired:
                print("❌ CHECKPOINT 3/4: Playwright recording TIMED OUT")
                print(f"\n{'='*60}")
                print("⚠️ FALLING BACK TO HTML ANIMATION")
                print(f"{'='*60}\n")
                video_result = {
                    "video_path": str(html_path),
                    "html_path": str(html_path),
                    "html_url": f"/videos/{html_filename}",
                    "html_content": html_content,
                    "duration": request.duration_seconds,
                    "media_type": "html_animation",
                }
            except Exception as e:
                print(f"❌ CHECKPOINT 3/4: Playwright recording ERROR: {e}")
                print(f"\n{'='*60}")
                print("⚠️ FALLING BACK TO HTML ANIMATION")
                print(f"{'='*60}\n")
                video_result = {
                    "video_path": str(html_path),
                    "html_path": str(html_path),
                    "html_url": f"/videos/{html_filename}",
                    "html_content": html_content,
                    "duration": request.duration_seconds,
                    "media_type": "html_animation",
                }
        else:
            video_generator = VideoGenerator(use_manim=False)
            video_result = video_generator.generate_complete_video(
                processed_content["script"],
                processed_content["visual_prompts"],
                request.duration_seconds,
                output_filename,
                processed_content.get("scene_details"),
            )

        video_id = timestamp
        is_html_animation = video_result.get("media_type") == "html_animation"

        video_data = {
            "video_id": video_id,
            "filename": output_filename.replace(".mp4", ".html")
            if is_html_animation
            else output_filename,
            "video_url": video_result.get("html_url")
            if is_html_animation
            else f"/videos/{output_filename}",
            "timestamp": datetime.now().isoformat(),
            "duration": request.duration_seconds,
            "interest": request.interest_description,
            "word_count": len(request.extracted_text.split()),
            "script": processed_content["script"],
            "summary": processed_content["summary"],
            "key_points": processed_content["key_points"],
            "takeaway": processed_content["takeaway"],
            "media_type": "html_animation" if is_html_animation else "video",
            "subtitle_path": video_result.get("subtitle_path"),
            "subtitle_url": f"/videos/{Path(video_result.get('subtitle_path', '')).name}"
            if video_result.get("subtitle_path")
            else None,
        }

        if is_html_animation:
            video_data["html_content"] = video_result.get("html_content")
            video_data["html_url"] = video_result.get("html_url")

        save_video_metadata(video_data)

        return {
            "success": True,
            "video_data": video_data,
            "processed_content": processed_content,
        }

    except Exception as e:
        print(f"❌ Error in generate_video: {type(e).__name__}: {str(e)}")
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-video")
async def generate_video(
    request: VideoGenerationRequest,
    http_request: Request,
    current_user: models.User = Depends(require_verified_user),
):
    return await _generate_video_logic(request, http_request, current_user)


@app.post("/api/generate-mp4-video")
async def generate_mp4_video(
    request: VideoGenerationRequest,
    http_request: Request,
    current_user: models.User = Depends(require_verified_user),
):
    return await _generate_video_logic(request, http_request, current_user)

@app.get("/api/library")
async def get_library():
    """Get all generated videos"""
    try:
        videos = get_all_videos()
        return {
            'success': True,
            'videos': videos,
            'total_count': len(videos)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/video/{video_id}")
async def get_video(video_id: str):
    """Get specific video by ID"""
    try:
        video_data = load_video_metadata(video_id)
        if not video_data:
            raise HTTPException(status_code=404, detail="Video not found")
        
        return {
            'success': True,
            'video': video_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/queue/status")
async def get_queue_status():
    """Get current queue status for UI feedback"""
    try:
        status = request_queue.get_queue_status()
        return {
            'success': True,
            'queue': status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/stats")
async def get_user_stats(http_request: Request):
    """Get user's rate limit statistics"""
    try:
        user_id = http_request.client.host if http_request.client else "unknown"
        stats = user_rate_limiter.get_user_stats(user_id)
        return {
            'success': True,
            'stats': stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cache/stats")
async def get_cache_stats():
    """Get cache statistics for monitoring"""
    try:
        ai_processor = AIProcessor()
        stats = ai_processor.cache.get_stats()
        return {
            'success': True,
            'cache': stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/library/clear")
async def clear_library():
    """Clear all videos from library"""
    try:
        video_dir = Path(config.VIDEO_OUTPUT_DIR)
        if video_dir.exists():
            for file in video_dir.glob("*"):
                if file.is_file():
                    file.unlink()
        
        return {
            'success': True,
            'message': 'Library cleared successfully'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/settings")
async def get_settings():
    """Get application settings"""
    try:
        videos = get_all_videos()
        return {
            'success': True,
            'api_keys': {
                'openai': bool(config.OPENAI_API_KEY),
                'gemini': bool(config.GEMINI_API_KEY),
                'elevenlabs': bool(config.ELEVENLABS_API_KEY),
                'stability': bool(config.STABILITY_API_KEY),
            },
            'preset_interests': config.PRESET_INTERESTS,
            'video_durations': config.VIDEO_DURATIONS,
            'max_content_length': config.MAX_CONTENT_LENGTH,
            'stats': {
                'total_videos': len(videos)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
