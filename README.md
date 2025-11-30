# 📚 Sophi (Learnify MVP)

An AI-powered platform that transforms static learning materials into personalized animated explainer videos.

## 🎯 Features

- **Multi-Format Input**: Upload PDFs, photos, paste text, or provide web links
- **AI Personalization**: Connect concepts to your interests (sports, art, business, etc.)
- **Sketch Explainer Videos**: NEW! Whiteboard-style animations (3 images/second)
- **AI Generated Scenes**: Traditional animated videos with cinematic quality
- **Smart Processing**: AI-powered summarization and script generation
- **Content Library**: Manage and download your generated videos

### ✏️ Sketch Animation (Recommended)

Transform your content into TED-Ed style whiteboard explainer videos:
- **Faster generation** (6-9 minutes vs 15-30 minutes)
- **Lower cost** (~$1.60 per minute vs $6.30)
- **Educational aesthetic** perfect for learning
- **Smooth animation** at 3 frames per second

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- Tesseract OCR (for image text extraction)
- FFmpeg (for video processing)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Sophi
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Install system dependencies:

**Windows:**
```bash
# Install Tesseract: https://github.com/UB-Mannheim/tesseract/wiki
# Install FFmpeg: https://ffmpeg.org/download.html
```

**macOS:**
```bash
brew install tesseract ffmpeg
```

**Linux:**
```bash
sudo apt-get install tesseract-ocr ffmpeg
```

### Running the Application

```bash
streamlit run app.py
```

The app will open in your browser at `http://localhost:8501`

## 📖 Usage

1. **Upload Content**: Choose your learning material (PDF, image, text, or web link)
2. **Set Interest**: Select or describe your personal interests
3. **Choose Settings**: Pick video length (0.5 - 3 minutes) and animation style
4. **Generate**: Wait for AI to create your personalized video (6-30 min depending on style)
5. **Watch & Learn**: View, download, or share your video

### Animation Styles

**✏️ Sketch Explainer** (Recommended for most content):
- Whiteboard-style hand-drawn animations
- Best for: Concepts, processes, diagrams, tutorials
- Generation time: 6-9 minutes for 1-minute video
- Uses: Stability AI or DALL-E 3

**🎨 AI Generated Scenes** (For cinematic content):
- Realistic animated scenes
- Best for: Stories, realistic scenarios, character-driven content
- Generation time: 15-30 minutes for 1-minute video
- Uses: Runway, Replicate, or Stability AI

## 🛠️ Tech Stack

- **Frontend**: Streamlit
- **AI Engine**: OpenAI GPT-4o mini
- **Text Extraction**: PyPDF2, Tesseract OCR, BeautifulSoup
- **Animation**: Pika Labs / Runway API
- **Voice**: ElevenLabs / OpenAI TTS
- **Video Assembly**: MoviePy, FFmpeg

## 📊 MVP Constraints

- Maximum 3,000 words per input
- Maximum 3-minute video duration
- English language only
- Processing time: 1-3 minutes

## 🔑 API Keys Required

### For Sketch Animation (Recommended)
- OpenAI API key (for GPT-4o mini and DALL-E 3)
- Stability AI API key (for sketch image generation - 25 free credits!)
- ElevenLabs API key (for text-to-speech)

### For AI Generated Scenes (Optional)
- Runway API key (for cinematic animations)
- Replicate API key (for alternative animations)
- Pika Labs API key (for video generation)

See [SKETCH_ANIMATION.md](SKETCH_ANIMATION.md) for detailed documentation.

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

This is an MVP built for hackathon validation. Contributions welcome!

## 📧 Support

For issues or questions, please open a GitHub issue.
