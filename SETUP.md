# 🚀 Rusaldo Setup Guide

Complete setup instructions for the Rusaldo (Learnify MVP) application.

## 📋 Prerequisites

### Required Software

1. **Python 3.9+**
   - Download from [python.org](https://www.python.org/downloads/)
   - Verify installation: `python --version`

2. **Tesseract OCR** (for image text extraction)
   - **Windows:** Download from [GitHub](https://github.com/UB-Mannheim/tesseract/wiki)
   - **macOS:** `brew install tesseract`
   - **Linux:** `sudo apt-get install tesseract-ocr`
   - Verify: `tesseract --version`

3. **FFmpeg** (for video processing)
   - **Windows:** Download from [ffmpeg.org](https://ffmpeg.org/download.html)
   - **macOS:** `brew install ffmpeg`
   - **Linux:** `sudo apt-get install ffmpeg`
   - Verify: `ffmpeg -version`

### Required API Keys

You'll need the following API keys:

1. **OpenAI API Key** (Required)
   - Sign up at [platform.openai.com](https://platform.openai.com/)
   - Create API key in dashboard
   - Used for: Content summarization and personalization

2. **ElevenLabs API Key** (Optional, recommended)
   - Sign up at [elevenlabs.io](https://elevenlabs.io/)
   - Get API key from settings
   - Used for: High-quality text-to-speech
   - Fallback: OpenAI TTS if not provided

3. **Pika Labs or Runway API Key** (Optional)
   - Pika Labs: [pika.art](https://pika.art/)
   - Runway: [runwayml.com](https://runwayml.com/)
   - Used for: Advanced animation generation
   - MVP uses placeholder animations if not provided

## 🔧 Installation Steps

### Step 1: Clone or Download Repository

```bash
# If using git
git clone <repository-url>
cd Rusaldo

# Or download and extract ZIP file
```

### Step 2: Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will install all required packages including:
- Streamlit (web interface)
- OpenAI (AI processing)
- PyPDF2 (PDF extraction)
- Pytesseract (OCR)
- MoviePy (video assembly)
- ElevenLabs (text-to-speech)
- And more...

### Step 4: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` file with your API keys:
```bash
# Required
OPENAI_API_KEY=sk-your-openai-key-here

# Optional but recommended
ELEVENLABS_API_KEY=your-elevenlabs-key-here

# Optional for advanced features
PIKA_API_KEY=your-pika-key-here
RUNWAY_API_KEY=your-runway-key-here
```

### Step 5: Verify Installation

Run the verification script:

```bash
python verify_setup.py
```

This will check:
- ✅ Python version
- ✅ Required packages
- ✅ Tesseract installation
- ✅ FFmpeg installation
- ✅ API key configuration
- ✅ Directory structure

## 🎯 Running the Application

### Quick Start (Recommended)

**Windows:**
```bash
run.bat
```

**macOS/Linux:**
```bash
chmod +x run.sh
./run.sh
```

### Manual Start

```bash
# Activate virtual environment
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Run Streamlit
streamlit run app.py
```

The application will open in your browser at `http://localhost:8501`

## 🧪 Testing the Application

### Test with Sample Content

1. **Test PDF Upload:**
   - Create a simple PDF with text
   - Upload through the app interface

2. **Test Text Input:**
   - Copy any educational text (Wikipedia article, etc.)
   - Paste into text area

3. **Test Web Scraping:**
   - Use a simple article URL
   - Example: `https://en.wikipedia.org/wiki/Photosynthesis`

4. **Test Image OCR:**
   - Take a photo of printed text
   - Upload through image interface

### Expected Processing Time

- Text extraction: < 5 seconds
- AI processing: 10-30 seconds
- Video generation: 1-3 minutes
- Total: 2-4 minutes per video

## 🐛 Troubleshooting

### Common Issues

#### 1. "Tesseract not found"

**Solution:**
- Ensure Tesseract is installed
- Add Tesseract to system PATH
- Windows: Set path in pytesseract config

```python
# Add to config.py if needed
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

#### 2. "FFmpeg not found"

**Solution:**
- Install FFmpeg
- Add to system PATH
- Verify with `ffmpeg -version`

#### 3. "OpenAI API Error"

**Solution:**
- Check API key is correct in `.env`
- Verify API key has credits
- Check internet connection

#### 4. "Module not found"

**Solution:**
```bash
pip install -r requirements.txt --upgrade
```

#### 5. "Video generation fails"

**Solution:**
- Check all dependencies installed
- Verify sufficient disk space
- Check logs in terminal

### Getting Help

1. Check error messages in terminal
2. Review `README.md` for documentation
3. Verify all prerequisites installed
4. Check API key configuration

## 📊 System Requirements

### Minimum Requirements

- **OS:** Windows 10+, macOS 10.14+, Ubuntu 18.04+
- **RAM:** 4 GB
- **Storage:** 2 GB free space
- **Internet:** Required for API calls

### Recommended Requirements

- **OS:** Windows 11, macOS 12+, Ubuntu 20.04+
- **RAM:** 8 GB or more
- **Storage:** 5 GB free space
- **Internet:** Stable broadband connection

## 🔐 Security Notes

1. **Never commit `.env` file** to version control
2. **Keep API keys private** - don't share them
3. **Rotate keys regularly** for security
4. **Monitor API usage** to avoid unexpected charges

## 📈 Usage Limits

### Free Tier (MVP)

- 5 videos per month
- Maximum 3,000 words per input
- Maximum 3-minute videos
- English language only

### API Costs (Approximate)

- OpenAI GPT-4o mini: ~$0.01-0.05 per video
- ElevenLabs TTS: ~$0.05-0.10 per video
- Pika/Runway: Variable (if used)

**Estimated cost per video:** $0.05-0.20

## 🎓 Next Steps

1. ✅ Complete setup
2. 🎬 Generate your first video
3. 📚 Build your video library
4. 🎨 Experiment with different interests
5. 📊 Track your learning progress

## 📞 Support

For issues or questions:
1. Check this setup guide
2. Review error messages
3. Verify all prerequisites
4. Check API documentation

Happy Learning! 🚀
