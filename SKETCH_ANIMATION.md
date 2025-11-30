# ✏️ Sketch Animation Feature

## Overview

The Sketch Animation feature transforms your learning content into engaging whiteboard-style explainer videos, similar to popular educational channels like TED-Ed and Khan Academy.

## How It Works

### Pipeline Architecture

```
Text Content
    ↓
AI Processing (GPT-4o mini)
    ↓
Scene Descriptions
    ↓
Progressive Prompt Generation
    ↓
Sketch Image Generation (3 images/second)
    ├─ Stability AI (Primary - Fast & Cheap)
    └─ DALL-E 3 (Fallback - High Quality)
    ↓
Video Assembly (MoviePy)
    ↓
Audio Sync (ElevenLabs TTS)
    ↓
Final Sketch Explainer Video
```

### Key Features

1. **3 Images Per Second**: Creates smooth animation effect while keeping generation time reasonable
2. **Progressive Drawing**: Each scene shows gradual progression, mimicking hand-drawing
3. **Sketch Style**: Black and white line art with minimal shading for clarity
4. **Dual API Support**: Uses Stability AI for speed, falls back to DALL-E 3 for quality

## Technical Specifications

### Image Generation

- **Primary API**: Stability AI SD3
  - Speed: ~2-3 seconds per image
  - Cost: ~$0.065 per image
  - Aspect Ratio: 16:9
  
- **Fallback API**: DALL-E 3
  - Speed: ~5-10 seconds per image
  - Cost: ~$0.040 per image (standard quality)
  - Size: 1792x1024 (16:9)

### Video Specifications

- **Frame Rate**: 3 fps (images per second)
- **Resolution**: 1280x720 (HD) or higher depending on source images
- **Format**: MP4 (H.264 codec)
- **Audio**: AAC codec, synced with visuals

### Generation Time Estimates

For a 1-minute video:
- Total frames needed: 180 images (60 seconds × 3 fps)
- With Stability AI: ~6-9 minutes
- With DALL-E 3: ~15-30 minutes

**Optimization**: We generate fewer unique images and use progressive prompts to reduce generation time while maintaining smooth animation.

## Usage

### In the App

1. Upload or paste your learning content
2. Choose your personalization settings
3. Select **"✏️ Sketch Explainer (Recommended)"** as animation style
4. Click "Generate Personalized Video"

### Programmatic Usage

```python
from utils.sketch_animator import SketchAnimator

# Initialize animator
animator = SketchAnimator()

# Generate complete sketch video
video_path = animator.generate_complete_sketch_video(
    script="Your narration script",
    scene_descriptions=["Scene 1 description", "Scene 2 description"],
    audio_path="path/to/voiceover.mp3",
    duration=60,  # seconds
    output_filename="my_sketch_video.mp4"
)
```

## Advantages Over Traditional Animation

### Sketch Animation ✏️

✅ **Faster generation** (6-9 min vs 15-30 min)
✅ **Lower cost** per video
✅ **Consistent style** across all scenes
✅ **Educational aesthetic** (whiteboard/TED-Ed style)
✅ **Better for explanations** with diagrams and concepts
✅ **Easier to follow** for learners

### AI Generated Scenes 🎨

✅ **More realistic** visuals
✅ **Cinematic quality** for certain topics
✅ **Better for storytelling** narratives
❌ Slower generation
❌ Higher cost
❌ Inconsistent style between scenes

## Cost Comparison

### 1-Minute Video (180 frames optimized to ~20 unique images)

**Sketch Animation (Stability AI)**:
- Images: 20 × $0.065 = $1.30
- Audio: $0.30 (ElevenLabs)
- **Total: ~$1.60**

**Sketch Animation (DALL-E 3)**:
- Images: 20 × $0.040 = $0.80
- Audio: $0.30 (ElevenLabs)
- **Total: ~$1.10**

**Traditional Animation (Runway/Luma)**:
- Video clips: 12 × $0.50 = $6.00
- Audio: $0.30 (ElevenLabs)
- **Total: ~$6.30**

## Optimization Strategies

### 1. Progressive Prompts

Instead of generating 180 unique images, we:
- Generate 3-5 progressive prompts per scene
- Create variations showing gradual drawing progression
- Reuse frames with slight modifications

### 2. Smart Frame Distribution

```python
# Example for 10-second scene at 3 fps
num_frames = 30
num_unique_images = 5  # Instead of 30

# Distribute frames across unique images
frames_per_image = 6  # Each image shown for 2 seconds
```

### 3. Batch Processing

- Generate images in parallel when possible
- Cache common elements
- Reuse background elements across scenes

## Configuration

### Environment Variables

```bash
# Required for Sketch Animation
STABILITY_API_KEY=your_stability_key  # Primary
OPENAI_API_KEY=your_openai_key        # Fallback for DALL-E 3
ELEVENLABS_API_KEY=your_elevenlabs_key  # For voiceover
```

### Customization Options

```python
class SketchAnimator:
    def __init__(self):
        self.images_per_second = 3  # Adjust for smoother/faster
        self.use_stability = True   # Toggle primary API
```

## Best Practices

### Content Types Best Suited for Sketch Animation

✅ **Excellent for**:
- Scientific concepts
- Mathematical explanations
- Historical timelines
- Process diagrams
- Step-by-step tutorials
- Conceptual frameworks

❌ **Not ideal for**:
- Realistic scenes
- Character-driven stories
- Photographic content
- Complex 3D visualizations

### Prompt Engineering Tips

For best sketch results:
```python
# Good prompt
"Simple diagram showing photosynthesis process, 
 clean line drawing, educational illustration"

# Avoid
"Photorealistic forest with detailed leaves and sunlight"
```

## Troubleshooting

### Issue: Images don't look sketch-like

**Solution**: Enhance the sketch prompt template in `sketch_animator.py`:
```python
sketch_prompt = (
    f"Educational sketch illustration, hand-drawn style, "
    f"black and white line art, simple lines, "
    f"whiteboard animation style, minimal detail: {prompt}"
)
```

### Issue: Generation too slow

**Solutions**:
1. Reduce `images_per_second` from 3 to 2
2. Reduce number of scenes
3. Use Stability AI instead of DALL-E 3
4. Optimize progressive prompts count

### Issue: Video/audio sync problems

**Solution**: The pipeline automatically matches video duration to audio. If issues persist:
```python
# Check audio duration first
audio = AudioFileClip(audio_path)
print(f"Audio duration: {audio.duration}s")

# Ensure video matches
final_video = final_video.subclip(0, audio.duration)
```

## Future Enhancements

### Planned Features

1. **Style Variations**
   - Color sketch mode
   - Marker style
   - Chalk on blackboard
   - Digital pen style

2. **Animation Effects**
   - Drawing hand cursor
   - Progressive reveal
   - Highlight important points
   - Smooth transitions

3. **Performance Optimizations**
   - Image caching
   - Parallel generation
   - Smart frame interpolation
   - GPU acceleration

4. **Quality Improvements**
   - Consistent character design
   - Better scene continuity
   - Advanced prompt engineering
   - Style transfer

## API Credits & Limits

### Stability AI
- Free tier: 25 credits
- Each image: ~6.5 credits
- ~3-4 videos with free tier

### DALL-E 3
- Pay-per-use
- No free tier
- $0.040 per standard image

### Recommendations

1. Start with Stability AI free credits
2. Test with short videos (30 seconds)
3. Optimize prompts before full production
4. Monitor API usage and costs

## Examples

### Sample Output

A 1-minute sketch explainer video on "Photosynthesis":
- 4 scenes (15 seconds each)
- 3 fps = 180 total frames
- 20 unique images generated
- Progressive drawing effect
- Total generation time: ~8 minutes
- Total cost: ~$1.60

### Code Example

```python
# Complete example
from utils.sketch_animator import SketchAnimator
from utils.ai_processor import AIProcessor
from utils.video_generator import VideoGenerator

# Process content
ai = AIProcessor()
content = ai.process_content(text, profile, duration=60)

# Generate audio
vg = VideoGenerator()
vg.generate_voiceover(content['script'], 'audio.mp3')

# Generate sketch video
animator = SketchAnimator()
video = animator.generate_complete_sketch_video(
    script=content['script'],
    scene_descriptions=content['visual_prompts'],
    audio_path='audio.mp3',
    duration=60,
    output_filename='photosynthesis_explainer.mp4'
)
```

---

**Last Updated**: November 2024
**Version**: 1.0.0
**Status**: Production Ready
