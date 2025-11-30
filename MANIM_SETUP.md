# Manim Integration for Rusaldo

## What is Manim?

Manim (Mathematical Animation Engine) is an open-source Python library created by 3Blue1Brown for creating mathematical and educational animations programmatically. It's perfect for creating whiteboard-style educational videos with a hand-drawn aesthetic.

## Benefits

- ✅ **FREE & Open Source** - No API costs!
- ✅ **Professional Quality** - Used by 3Blue1Brown, Khan Academy
- ✅ **Programmatic** - Full control over animations
- ✅ **Educational Style** - Perfect for learning content
- ✅ **Fast Rendering** - 30-60 seconds per scene
- ✅ **Cost** - Only server compute (~$0.10 per video)

## Installation

### Windows

1. **Install LaTeX (required for text rendering)**
   ```bash
   # Download and install MiKTeX from https://miktex.org/download
   ```

2. **Install FFmpeg (required for video rendering)**
   ```bash
   # Download from https://ffmpeg.org/download.html
   # Add to PATH
   ```

3. **Install Manim**
   ```bash
   pip install -r requirements_manim.txt
   ```

### Linux/Mac

```bash
# Install system dependencies
sudo apt-get install ffmpeg texlive texlive-latex-extra texlive-fonts-extra

# Install Manim
pip install -r requirements_manim.txt
```

## Usage

### Enable Manim in Video Generation

```python
from utils.video_generator import VideoGenerator

# Create generator with Manim enabled
generator = VideoGenerator(use_manim=True)

# Generate video (Manim will be used first)
video_path = generator.generate_complete_video(
    script="Your educational script...",
    visual_prompts=["Diagram of concept", "Flow chart", "Mathematical equation"],
    duration=30,
    output_filename="lesson.mp4"
)
```

### API Endpoint

Add `use_manim=true` parameter to the generate endpoint:

```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your content...",
    "interest": "Mathematics",
    "duration": 30,
    "use_manim": true
  }'
```

## Features

### Automatic Visual Generation

Manim automatically creates visuals based on keywords in the description:

- **Diagrams** - Circles, arrows, labels
- **Flow Charts** - Process flows with arrows
- **Lists** - Bullet points with animations
- **Equations** - LaTeX mathematical formulas
- **Shapes** - Geometric illustrations

### Animation Styles

- ✍️ **Write** - Hand-drawn writing effect
- 🎨 **Create** - Shapes appear gradually
- ➡️ **Transform** - Smooth morphing between objects
- 📊 **Graph** - Animated charts and plots

## Examples

### Simple Concept

```python
# Input
visual_description = "Diagram showing photosynthesis process"

# Output
# - Title written in hand-drawn style
# - Circular diagram with arrows
# - Labels appearing one by one
# - Smooth transitions
```

### Mathematical Explanation

```python
# Input
visual_description = "Equation for quadratic formula"

# Output
# - LaTeX equation written step-by-step
# - Variables highlighted
# - Solution process animated
```

## Performance

- **Rendering Time**: 30-60 seconds per scene
- **Quality**: 1080p HD
- **File Size**: ~5-10MB per minute
- **Cost**: Server compute only (~$0.10 per video)

## Troubleshooting

### LaTeX Errors

If you see LaTeX errors, ensure MiKTeX/TeX Live is installed and in PATH.

### FFmpeg Not Found

```bash
# Windows
# Download from https://ffmpeg.org and add to PATH

# Linux
sudo apt-get install ffmpeg

# Mac
brew install ffmpeg
```

### Slow Rendering

Use low quality for faster preview:
```python
# In manim_generator.py, change:
'-ql'  # Low quality (fast)
# to
'-qh'  # High quality (slower)
```

## Comparison with Other Services

| Service | Cost | Speed | Quality | Style |
|---------|------|-------|---------|-------|
| **Manim** | Free | 30-60s | High | Whiteboard |
| Stability.ai | $0.10/img | 10-20s | High | Realistic |
| Replicate | $0.05/gen | 30-60s | Medium | Animated |
| Runway | $0.50/gen | 60-120s | High | Cinematic |

## Next Steps

1. Install dependencies (see above)
2. Test with a simple video
3. Customize visual generation in `manim_generator.py`
4. Adjust animation styles and timing
5. Deploy to production!

## Resources

- [Manim Documentation](https://docs.manim.community/)
- [3Blue1Brown YouTube](https://www.youtube.com/c/3blue1brown)
- [Manim Examples](https://docs.manim.community/en/stable/examples.html)
