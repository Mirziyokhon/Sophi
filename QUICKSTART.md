# ⚡ Rusaldo Quick Start Guide

Get your first personalized learning video in 5 minutes!

## 🎯 Prerequisites Check

Before starting, ensure you have:

- ✅ Python 3.9+ installed
- ✅ OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- ✅ 10 minutes of time

**Optional but recommended:**
- Tesseract OCR (for image uploads)
- FFmpeg (for video processing)
- ElevenLabs API key (for better voice quality)

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (2 minutes)

Open terminal in the Rusaldo directory:

```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt
```

### Step 2: Configure API Key (1 minute)

```bash
# Copy environment template
cp .env.example .env

# Edit .env file and add your OpenAI API key
# Windows: notepad .env
# Mac: open .env
# Linux: nano .env
```

Add your key:
```
OPENAI_API_KEY=sk-your-actual-key-here
```

### Step 3: Run the App (30 seconds)

```bash
streamlit run app.py
```

The app will open in your browser at `http://localhost:8501`

## 🎬 Create Your First Video (2 minutes)

### Option A: Quick Test with Text

1. Click **"✍️ Plain Text"** in the content type dropdown
2. Paste this sample text:

```
Photosynthesis is the process by which plants convert light energy into chemical energy. 
Plants use sunlight, water, and carbon dioxide to produce glucose and oxygen. 
This process occurs in chloroplasts, which contain chlorophyll that captures light energy. 
The glucose produced serves as food for the plant, while oxygen is released into the atmosphere.
```

3. Select interest: **"Football & Soccer"**
4. Choose duration: **"1 minute"**
5. Click **"🎬 Generate Personalized Video"**
6. Wait 2-3 minutes for processing
7. Watch your personalized video! ⚡

### Option B: Upload a PDF

1. Click **"📄 PDF Document"**
2. Upload any educational PDF (textbook page, article, etc.)
3. Follow steps 3-7 above

### Option C: Web Article

1. Click **"🌐 Web Link"**
2. Paste a Wikipedia or blog article URL
3. Click **"Extract Content"**
4. Follow steps 3-7 above

## 🎨 Understanding Personalization

The magic happens when you connect content to your interests!

**Example:** Learning about photosynthesis with football interest:

> "Think of photosynthesis like a football team's energy system. Just like players need food and water to perform, plants need sunlight and water to create their own energy. The chloroplasts are like the team's training facility where raw materials are converted into game-ready performance..."

## 📚 What Happens Behind the Scenes?

```
Your Content
    ↓
AI Summarization (GPT-4o mini)
    ↓
Personalization (connects to your interests)
    ↓
Script Generation (conversational narration)
    ↓
Voice Generation (text-to-speech)
    ↓
Animation Creation (visual scenes)
    ↓
Video Assembly (combine audio + visuals)
    ↓
Your Personalized Video! 🎉
```

**Processing Time:** 2-4 minutes per video

## 💡 Tips for Best Results

### Content Tips

✅ **DO:**
- Use clear, well-structured text
- Keep content under 3,000 words
- Choose educational topics
- Use high-quality PDFs/images

❌ **DON'T:**
- Upload very long documents (>3000 words)
- Use low-quality scanned images
- Expect perfect OCR on handwriting

### Interest Tips

✅ **DO:**
- Be specific about your interests
- Describe what you love about it
- Use vivid language
- Example: "I love basketball strategy and teamwork dynamics"

❌ **DON'T:**
- Be too vague ("sports")
- Just list topics without context

### Duration Tips

- **30 seconds:** Quick concept overview
- **1 minute:** Single concept explanation (recommended)
- **1.5 minutes:** Concept with examples
- **2 minutes:** Detailed explanation
- **3 minutes:** Comprehensive coverage

## 🎯 Common Use Cases

### 1. Study Session Prep
- Upload lecture notes
- Generate 1-minute summaries
- Watch before studying

### 2. Quick Review
- Paste textbook paragraphs
- Create 30-second refreshers
- Review before exams

### 3. Concept Clarification
- Copy confusing sections
- Generate personalized explanations
- Finally understand it!

### 4. Visual Learning
- Convert text-heavy content
- Get animated explanations
- Better retention

## 🐛 Troubleshooting

### "OpenAI API Error"
- Check your API key in `.env`
- Verify you have credits
- Check internet connection

### "Tesseract not found"
- Only needed for image uploads
- Skip images or install Tesseract
- See SETUP.md for installation

### "FFmpeg not found"
- Only needed for video generation
- Install FFmpeg
- See SETUP.md for installation

### "Video generation failed"
- Check all dependencies installed
- Verify sufficient disk space (2GB+)
- Try with shorter content

### "Content too long"
- Maximum 3,000 words
- Summarize or split content
- Focus on key sections

## 📊 Understanding Costs

### OpenAI API Costs (GPT-4o mini)
- **Per video:** ~$0.01-0.05
- **5 videos:** ~$0.05-0.25
- **Very affordable for testing!**

### Optional APIs
- **ElevenLabs:** ~$0.05-0.10 per video (better voice)
- **Pika/Runway:** Variable (advanced animations)

**MVP uses free alternatives when optional APIs not configured**

## 🎓 Next Steps

### Explore Features

1. **Try Different Interests**
   - Test preset options
   - Write custom descriptions
   - See how it changes the video

2. **Experiment with Durations**
   - Compare 30s vs 3-minute videos
   - Find your sweet spot

3. **Build Your Library**
   - Generate multiple videos
   - Organize by subject
   - Create a study playlist

### Advanced Usage

1. **Batch Processing**
   - Generate videos for all chapters
   - Create course summaries
   - Build video library

2. **Custom Workflows**
   - Screenshot → OCR → Video
   - Article → Summary → Video
   - Notes → Explanation → Video

3. **Share & Collaborate**
   - Download videos
   - Share with classmates
   - Create study groups

## 📱 Mobile Access

While the app runs on desktop, generated videos can be:
- Downloaded to phone
- Watched anywhere
- Shared via messaging apps

## 🎉 Success Checklist

After your first video, you should have:

- ✅ Generated your first personalized video
- ✅ Understood how personalization works
- ✅ Explored different content types
- ✅ Downloaded a video
- ✅ Checked your library

## 🆘 Getting Help

### Resources

1. **README.md** - Project overview
2. **SETUP.md** - Detailed installation
3. **ARCHITECTURE.md** - Technical details
4. **This guide** - Quick start

### Verification

Run the verification script:
```bash
python verify_setup.py
```

This checks all prerequisites and dependencies.

## 🚀 Ready to Go!

You're all set! Here's your command:

```bash
streamlit run app.py
```

**First video goal:** Generate a 1-minute video about any topic you're learning, personalized to something you love.

**Time to first video:** 5 minutes from now! ⚡

---

**Pro Tip:** Start with plain text and a preset interest for the fastest first experience. You can explore advanced features later!

Happy Learning! 📚✨
