# 🎬 Animation Generation Setup

## ✅ System Status

Your animation generation pipeline is **ready to use**!

### Installed Dependencies
- ✅ **Manim Community v0.18.0** - Whiteboard animations
- ✅ **Edge-TTS** - FREE text-to-speech (no API key needed)
- ✅ **MoviePy** - Video editing and composition
- ✅ **Gemini 2.5 Flash** - AI content processing (updated for better rate limits)
- ✅ **Pollinations.ai** - FREE sketch-style image generation

### Backend Services
- ✅ **FastAPI server** running on `http://localhost:8000`
- ✅ **Next.js frontend** on `http://localhost:3000`

## 🎨 Animation Styles Available

### 1. Sketch Explainer (FREE - Recommended)
- **Cost:** 100% FREE
- **Services:** Pollinations.ai + Edge-TTS
- **Style:** Hand-drawn, rough sketch aesthetic
- **Speed:** Fast (~2-3 minutes per video)
- **Best for:** Quick explainer videos, educational content

### 2. Manim Whiteboard (Advanced)
- **Cost:** FREE (local rendering)
- **Services:** Manim + Edge-TTS
- **Style:** Professional whiteboard animations
- **Speed:** Slower (~3-5 minutes per video)
- **Best for:** Mathematical content, professional presentations

## 🚀 How to Generate Videos

### Via Frontend (Recommended)
1. Open `http://localhost:3000`
2. Upload/paste your learning content
3. Choose your interest/personalization
4. Select animation style: **"✏️ Sketch Explainer (Free)"**
5. Click "Generate Video"

### Via API
```bash
curl -X POST http://localhost:8000/api/generate-video \
  -H "Content-Type: application/json" \
  -d '{
    "extracted_text": "Your learning content here",
    "interest_description": "No Interest",
    "duration_seconds": 60,
    "animation_style": "sketch"
  }'
```

## 📊 Rate Limits & Quotas

### Gemini API (Free Tier)
- **Model:** gemini-2.5-flash (optimized for higher limits)
- **Rate Limit:** 15 requests/minute, 1500 requests/day
- **If you hit limits:** Wait 30-60 seconds, or use fallback summaries

### Edge-TTS
- **No rate limits** ✅
- **No API key needed** ✅
- **Unlimited usage** ✅

### Pollinations.ai
- **No rate limits** ✅
- **No API key needed** ✅
- **Free forever** ✅

## 🔧 Configuration

### Animation Settings
Edit `config.py` to adjust:
```python
VIDEO_DURATIONS = {
    "0.5 minutes": 30,
    "1 minute": 60,
    "1.5 minutes": 90,
    "2 minutes": 120,
    "3 minutes": 180
}

MAX_CONTENT_LENGTH = 3000  # words
```

### Voice Settings
Edit `utils/sketch_animator.py` to change voice:
```python
DEFAULT_VOICE = "en-US-ChristopherNeural"  # Male voice
# Other options:
# "en-US-JennyNeural"  # Female
# "en-GB-RyanNeural"   # British Male
# "en-AU-NatashaNeural"  # Australian Female
```

## 🎯 Recommended Workflow

1. **Start with Sketch Explainer** - It's fast and free
2. **Test with short content** - Start with 30-60 second videos
3. **Monitor Gemini usage** - Check https://ai.dev/usage
4. **Scale up gradually** - Once comfortable, try longer videos

## 📁 Output Files

Generated videos are saved to:
```
generated_videos/
├── sophi_video_20251220_143000.mp4
├── sophi_video_20251220_143000_metadata.json
└── sophi_video_20251220_143000.srt (subtitles)
```

## 🐛 Troubleshooting

### "Rate limit exceeded"
- **Solution:** Wait 30-60 seconds, or switch to a different Gemini model
- **Prevention:** Space out requests, use shorter content

### "LaTeX not found" (Manim only)
- **Solution:** Install MiKTeX from https://miktex.org/download
- **Note:** Only needed for mathematical equations

### "Video generation failed"
- **Check:** Backend logs in terminal running port 8000
- **Check:** Gemini API key is valid in `.env`
- **Try:** Use "Sketch Explainer" style instead

### "Subtitles not showing"
- **Solution:** Subtitles are in `.srt` format, use a video player that supports them
- **Players:** VLC, MPV, or modern browsers

## 📚 API Endpoints

### Text Extraction
- `POST /api/extract/text` - Process plain text
- `POST /api/extract/pdf` - Extract from PDF
- `POST /api/extract/image` - OCR from image
- `POST /api/extract/url` - Scrape from URL

### Video Generation
- `POST /api/generate-video` - Generate video
- `GET /api/library` - List all videos
- `GET /api/video/{id}` - Get specific video
- `DELETE /api/library/clear` - Clear all videos

### System
- `GET /api/health` - Check API status
- `GET /api/settings` - Get configuration

## 🎓 Example Use Cases

### 1. Quick Study Notes
- Paste your notes (500-1000 words)
- Select "No Interest" for general explanations
- Use 1-minute Sketch Explainer
- Get video in ~2 minutes

### 2. Personalized Learning
- Upload PDF or paste content
- Describe your interests (e.g., "I love basketball")
- AI will create analogies using your interests
- Get engaging, personalized video

### 3. Batch Processing
- Use API to generate multiple videos
- Process entire course materials
- Build a video library

## 🔐 Security Notes

- ✅ `.env` is in `.gitignore`
- ✅ API keys are not committed to Git
- ✅ Use environment variables in production
- ⚠️ Rotate API keys if exposed

## 🚀 Next Steps

1. **Test the system:** Generate your first video via frontend
2. **Monitor usage:** Check Gemini API dashboard
3. **Customize:** Adjust voices, styles, durations
4. **Scale:** Deploy to production (Railway, Vercel, etc.)

## 📞 Support

- **Gemini API:** https://ai.google.dev/gemini-api/docs
- **Manim Docs:** https://docs.manim.community/
- **Edge-TTS:** https://github.com/rany2/edge-tts

---

**Your animation pipeline is ready! Start generating videos now! 🎉**
