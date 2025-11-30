# ✅ Rusaldo Installation Checklist

Use this checklist to ensure proper installation and setup of Rusaldo.

## 📋 Pre-Installation

### System Requirements
- [ ] Windows 10+, macOS 10.14+, or Ubuntu 18.04+
- [ ] 4GB RAM minimum (8GB recommended)
- [ ] 2GB free disk space (5GB recommended)
- [ ] Stable internet connection

### Software Prerequisites
- [ ] Python 3.9 or higher installed
  - Verify: `python --version`
  - Download: https://python.org/downloads/
  
- [ ] Git installed (optional, for cloning)
  - Verify: `git --version`
  - Download: https://git-scm.com/downloads

## 🔧 System Dependencies

### Required for Full Functionality

#### Tesseract OCR (for image text extraction)
- [ ] **Windows:** Downloaded from [GitHub](https://github.com/UB-Mannheim/tesseract/wiki)
- [ ] **macOS:** Installed via `brew install tesseract`
- [ ] **Linux:** Installed via `sudo apt-get install tesseract-ocr`
- [ ] Verify: `tesseract --version`

#### FFmpeg (for video processing)
- [ ] **Windows:** Downloaded from [ffmpeg.org](https://ffmpeg.org/download.html)
- [ ] **macOS:** Installed via `brew install ffmpeg`
- [ ] **Linux:** Installed via `sudo apt-get install ffmpeg`
- [ ] Verify: `ffmpeg -version`

### Optional (Can skip for basic testing)
- [ ] Tesseract added to system PATH
- [ ] FFmpeg added to system PATH

## 🔑 API Keys

### Required API Keys
- [ ] OpenAI API Key obtained
  - Sign up: https://platform.openai.com/
  - Create key in API dashboard
  - Copy key to clipboard
  - **Cost:** ~$0.01-0.05 per video

### Optional API Keys (Recommended)
- [ ] ElevenLabs API Key (for better voice quality)
  - Sign up: https://elevenlabs.io/
  - Get key from settings
  - **Cost:** ~$0.05-0.10 per video
  - **Fallback:** OpenAI TTS if not provided

- [ ] Pika Labs or Runway API Key (for advanced animations)
  - Pika: https://pika.art/
  - Runway: https://runwayml.com/
  - **Note:** MVP uses placeholder animations

## 📦 Installation Steps

### Step 1: Get the Code
- [ ] Downloaded or cloned repository
  ```bash
  git clone <repository-url>
  cd Rusaldo
  ```
  OR
  - [ ] Downloaded ZIP and extracted to folder

### Step 2: Virtual Environment
- [ ] Created virtual environment
  ```bash
  # Windows
  python -m venv venv
  
  # macOS/Linux
  python3 -m venv venv
  ```

- [ ] Activated virtual environment
  ```bash
  # Windows
  venv\Scripts\activate
  
  # macOS/Linux
  source venv/bin/activate
  ```

- [ ] Verified activation (prompt shows `(venv)`)

### Step 3: Install Dependencies
- [ ] Installed Python packages
  ```bash
  pip install -r requirements.txt
  ```

- [ ] Installation completed without errors

- [ ] Verified key packages installed:
  - [ ] streamlit
  - [ ] openai
  - [ ] PyPDF2
  - [ ] pytesseract
  - [ ] moviepy
  - [ ] elevenlabs

### Step 4: Environment Configuration
- [ ] Copied `.env.example` to `.env`
  ```bash
  cp .env.example .env
  ```

- [ ] Opened `.env` file in text editor

- [ ] Added OpenAI API key
  ```
  OPENAI_API_KEY=sk-your-actual-key-here
  ```

- [ ] (Optional) Added ElevenLabs API key
  ```
  ELEVENLABS_API_KEY=your-key-here
  ```

- [ ] (Optional) Added Pika/Runway API key

- [ ] Saved `.env` file

### Step 5: Directory Structure
- [ ] Verified directories exist (auto-created on first run):
  - [ ] `uploads/`
  - [ ] `generated_videos/`
  - [ ] `temp/`
  - [ ] `utils/`

## ✅ Verification

### Run Setup Verification
- [ ] Ran verification script
  ```bash
  python verify_setup.py
  ```

- [ ] All checks passed:
  - [ ] ✅ Python Version
  - [ ] ✅ Python Packages
  - [ ] ✅ System Dependencies
  - [ ] ✅ Environment Config
  - [ ] ✅ Directories
  - [ ] ✅ Core Files

### Manual Verification
- [ ] Python version is 3.9+
- [ ] All packages installed
- [ ] Tesseract accessible
- [ ] FFmpeg accessible
- [ ] API keys configured
- [ ] No error messages

## 🚀 First Run

### Launch Application
- [ ] Started the application
  ```bash
  # Option 1: Direct command
  streamlit run app.py
  
  # Option 2: Use launcher script
  # Windows: run.bat
  # macOS/Linux: ./run.sh
  ```

- [ ] Application opened in browser
- [ ] URL is `http://localhost:8501`
- [ ] Interface loaded successfully
- [ ] No console errors

### Interface Check
- [ ] Main page displays correctly
- [ ] Sidebar navigation visible
- [ ] Three pages accessible:
  - [ ] 🎬 Create Video
  - [ ] 📚 My Library
  - [ ] ⚙️ Settings

### Settings Page Check
- [ ] Opened Settings page
- [ ] API status shows:
  - [ ] ✅ OpenAI API (green checkmark)
  - [ ] Status for optional APIs
- [ ] Usage limits displayed (5/5 free videos)

## 🎬 First Video Test

### Quick Test with Text
- [ ] Navigated to "Create Video" page
- [ ] Selected "✍️ Plain Text" option
- [ ] Pasted sample text (or used test content below)
- [ ] Selected a preset interest
- [ ] Chose "1 minute" duration
- [ ] Clicked "Generate Personalized Video"

### Sample Test Content
```
Photosynthesis is the process by which plants convert light 
energy into chemical energy. Plants use sunlight, water, and 
carbon dioxide to produce glucose and oxygen. This process 
occurs in chloroplasts, which contain chlorophyll that captures 
light energy.
```

### Generation Process
- [ ] Progress bar appeared
- [ ] Status messages displayed:
  - [ ] "Enhancing your interest profile..."
  - [ ] "Analyzing and summarizing content..."
  - [ ] "Creating personalized script..."
  - [ ] "Generating animated video..."
- [ ] No error messages
- [ ] Process completed in 2-4 minutes

### Video Result
- [ ] Video generated successfully
- [ ] Video player displayed
- [ ] Video plays correctly
- [ ] Audio is clear
- [ ] Visuals are appropriate
- [ ] Download button works
- [ ] Video saved to library

### Library Check
- [ ] Navigated to "My Library"
- [ ] Generated video appears in list
- [ ] Video details displayed correctly
- [ ] Can play video from library
- [ ] Can download video

## 🎯 Feature Testing

### Content Input Methods
- [ ] PDF upload works
- [ ] Image OCR works (if Tesseract installed)
- [ ] Web URL scraping works
- [ ] Plain text input works

### Personalization Options
- [ ] Preset interests work
- [ ] Custom interest description works
- [ ] Interest profile enhancement works

### Video Durations
- [ ] 0.5 minutes option works
- [ ] 1 minute option works
- [ ] 1.5 minutes option works
- [ ] 2 minutes option works
- [ ] 3 minutes option works

## 🐛 Troubleshooting

### Common Issues Resolved

#### Issue: "OpenAI API Error"
- [ ] Verified API key is correct
- [ ] Checked API key has credits
- [ ] Confirmed internet connection
- [ ] Restarted application

#### Issue: "Tesseract not found"
- [ ] Installed Tesseract OCR
- [ ] Added to system PATH
- [ ] Restarted terminal/application
- [ ] Can skip if not using image uploads

#### Issue: "FFmpeg not found"
- [ ] Installed FFmpeg
- [ ] Added to system PATH
- [ ] Restarted terminal/application
- [ ] Verified with `ffmpeg -version`

#### Issue: "Module not found"
- [ ] Activated virtual environment
- [ ] Ran `pip install -r requirements.txt`
- [ ] Checked for error messages
- [ ] Restarted application

#### Issue: "Video generation fails"
- [ ] Checked disk space (need 2GB+)
- [ ] Verified all dependencies installed
- [ ] Checked console for error details
- [ ] Tried with shorter content

## 📊 Performance Check

### Expected Performance
- [ ] Text extraction: < 5 seconds
- [ ] AI processing: 10-30 seconds
- [ ] Video generation: 1-3 minutes
- [ ] Total time: 2-4 minutes per video

### Resource Usage
- [ ] Application runs smoothly
- [ ] No excessive memory usage
- [ ] Disk space adequate
- [ ] No system slowdown

## 🎓 Documentation Review

### Read Documentation
- [ ] Read README.md (overview)
- [ ] Read QUICKSTART.md (getting started)
- [ ] Skimmed SETUP.md (detailed setup)
- [ ] Bookmarked ARCHITECTURE.md (technical details)

### Understand Features
- [ ] Know how to upload content
- [ ] Understand personalization
- [ ] Can generate videos
- [ ] Can manage library

## ✨ Final Checklist

### Installation Complete
- [ ] All prerequisites installed
- [ ] All dependencies installed
- [ ] API keys configured
- [ ] Application runs successfully
- [ ] First video generated
- [ ] All features tested
- [ ] Documentation reviewed

### Ready to Use
- [ ] Comfortable with interface
- [ ] Understand workflow
- [ ] Know how to troubleshoot
- [ ] Ready to create learning videos

## 🎉 Success!

If all items are checked, congratulations! Your Rusaldo installation is complete and ready to use.

### Next Steps
1. **Create more videos** - Try different content types
2. **Experiment with interests** - See how personalization works
3. **Build your library** - Generate videos for your courses
4. **Share feedback** - Help improve the platform

### Quick Reference Commands

```bash
# Activate virtual environment
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Run application
streamlit run app.py

# Verify setup
python verify_setup.py

# Update dependencies
pip install -r requirements.txt --upgrade
```

## 📞 Need Help?

- **Documentation:** Check README.md, SETUP.md, QUICKSTART.md
- **Verification:** Run `python verify_setup.py`
- **Errors:** Check console output for details
- **Issues:** Review troubleshooting section above

---

**Installation Date:** _______________  
**Version:** 1.0.0 MVP  
**Status:** ✅ Complete

Happy Learning! 🚀📚
