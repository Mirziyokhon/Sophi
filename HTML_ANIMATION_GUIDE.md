# 🎨 HTML Animation to MP4 Guide

## Overview

Your Sophi app now supports **automatic HTML5 animation to MP4 conversion** with synchronized voiceover!

When you select the "HTML" animation style, the system will:
1. ✅ Generate HTML5 canvas animation using **Gemini 3 Pro**
2. ✅ Generate voiceover narration using **Edge-TTS** (FREE)
3. ✅ Capture the HTML animation as video using **Playwright**
4. ✅ Combine animation + voiceover into final MP4
5. ✅ Deliver ready-to-watch video to user

## How It Works

### Pipeline Flow

```
User Input (Text)
    ↓
Gemini 3 Pro generates HTML5 animation code
    ↓
Edge-TTS generates voiceover audio
    ↓
Playwright captures HTML animation in browser
    ↓
MoviePy combines video + audio
    ↓
Final MP4 with voiceover delivered
```

### Technologies Used

- **Gemini 3 Pro Preview** - Advanced HTML/JavaScript code generation
- **Edge-TTS** - FREE high-quality text-to-speech (Andrew Multilingual Neural voice)
- **Playwright** - Headless browser automation for video capture
- **MoviePy** - Video/audio composition
- **Chromium** - Browser engine for rendering HTML animations

## API Usage

### Generate HTML Animation Video

```bash
curl -X POST http://localhost:8000/api/generate-video \
  -H "Content-Type: application/json" \
  -d '{
    "extracted_text": "Your learning content here",
    "interest_description": "No Interest",
    "duration_seconds": 60,
    "animation_style": "html"
  }'
```

**Animation Style Options:**
- `"sketch"` - Pollinations.ai sketch images + Edge-TTS (fastest)
- `"html"` - Gemini 3 Pro HTML5 animation + Edge-TTS (best quality)
- `"manim"` - Manim whiteboard animations (for math content)

## Frontend Integration

To use HTML animations from your Next.js frontend:

```typescript
const response = await api.generateVideo({
  extracted_text: content,
  interest_description: interest,
  duration_seconds: 60,
  animation_style: "html"  // Use HTML animation
});
```

## Features

### HTML Animation Capabilities

The Gemini 3 Pro generated animations include:

✅ **Interactive Canvas** - 1920x1080 HTML5 canvas
✅ **Hand-drawn Aesthetic** - Rough sketch style with wobble effects
✅ **Stick Figure Characters** - Multiple poses (idle, thinking, running, pointing, writing)
✅ **Synchronized Subtitles** - Auto-generated from narration
✅ **Scene Transitions** - Smooth animations between concepts
✅ **Math Support** - LaTeX-style equation rendering
✅ **Personalization** - Adapts visuals to user interests
✅ **Export Controls** - Play/pause, timeline, duration controls

### Voiceover Features

✅ **FREE Edge-TTS** - No API costs
✅ **Natural Voice** - Andrew Multilingual Neural (male)
✅ **Perfect Sync** - Audio matches animation timing
✅ **High Quality** - Clear, professional narration

## Processing Time

Typical generation times for a 60-second video:

1. **Content Processing** (Gemini 2.5 Flash): ~5-10 seconds
2. **HTML Generation** (Gemini 3 Pro): ~15-20 seconds
3. **Voiceover Generation** (Edge-TTS): ~5 seconds
4. **Animation Capture** (Playwright): ~60 seconds (matches video duration)
5. **Video Composition** (MoviePy): ~10 seconds

**Total: ~2-3 minutes** for a complete HTML animation video

## Output Files

Generated files are saved to `generated_videos/`:

```
generated_videos/
├── sophi_video_20251220_153000.mp4          # Final video with voiceover
├── sophi_video_20251220_153000_metadata.json # Video metadata
└── temp/html_animations/                     # Temporary files (auto-cleaned)
    ├── animation_*.html                      # Generated HTML
    ├── voiceover.mp3                         # Audio narration
    └── animation_no_audio.mp4                # Video before audio merge
```

## Advantages Over Other Styles

### vs Sketch Style (Pollinations)
- ✅ More dynamic animations (not just static images)
- ✅ Better scene transitions
- ✅ Interactive elements and motion
- ❌ Slower generation (2-3 min vs 1-2 min)

### vs Manim Style
- ✅ More creative freedom in visuals
- ✅ Better for non-mathematical content
- ✅ Easier to personalize to interests
- ❌ Requires browser automation (Playwright)

## Requirements

### Python Packages (Already Installed)
```
playwright==1.40.0
edge-tts==6.1.12
moviepy==1.0.3
google-generativeai==0.8.5
```

### System Requirements
- **Chromium Browser** (installed via `playwright install chromium`)
- **FFmpeg** (included with Playwright)
- **Disk Space**: ~500MB for Playwright browsers

## Configuration

### Change Voice

Edit `utils/html_to_video.py`:

```python
self.voice = "en-US-AndrewMultilingualNeural"  # Current
# Other options:
# "en-US-JennyNeural"        # Female
# "en-GB-RyanNeural"         # British Male
# "en-AU-NatashaNeural"      # Australian Female
```

### Adjust Video Quality

Edit `utils/html_to_video.py`:

```python
video_clip.write_videofile(
    str(output_path),
    codec='libx264',
    audio_codec='aac',
    fps=24,           # Increase for smoother animation
    preset='medium',  # Change to 'slow' for better quality
    bitrate='5000k'   # Add for higher quality
)
```

## Troubleshooting

### "Playwright not found"
```bash
pip install playwright
playwright install chromium
```

### "Video capture failed"
- Check that Chromium is installed: `playwright install chromium`
- Ensure HTML animation has a Play button or auto-plays
- Verify animation duration matches voiceover duration

### "Audio/video out of sync"
- The system automatically matches video duration to audio
- If issues persist, check HTML animation timing code

### "Generation too slow"
- HTML animations take longer due to browser capture
- Use "sketch" style for faster results
- Reduce video duration for quicker generation

## Best Practices

1. **Start with short videos** (30-60 seconds) to test
2. **Use clear, concise content** for better animations
3. **Provide specific interests** for more personalized visuals
4. **Monitor Gemini 3 Pro usage** - it has lower rate limits than 2.5 Flash
5. **Clean temp files periodically** to save disk space

## Rate Limits

### Gemini 3 Pro (HTML Generation)
- **Free Tier**: Lower limits than 2.5 Flash
- **Recommendation**: Use HTML style selectively for best content
- **Fallback**: System uses 2.5 Flash for other tasks

### Edge-TTS (Voiceover)
- **No rate limits** ✅
- **Unlimited usage** ✅
- **Completely FREE** ✅

## Future Enhancements

Potential improvements:
- [ ] Multiple voice options in frontend
- [ ] Custom animation styles/themes
- [ ] Real-time preview before rendering
- [ ] Batch HTML animation generation
- [ ] Cloud browser rendering for faster capture

## Support

For issues or questions:
- Check Playwright docs: https://playwright.dev/python/
- Check Edge-TTS docs: https://github.com/rany2/edge-tts
- Review Gemini API docs: https://ai.google.dev/gemini-api/docs

---

**Your HTML animation pipeline is ready! Start generating professional animated videos with voiceover! 🎬**
