# 🏗️ Rusaldo Architecture Documentation

## System Overview

Rusaldo is an AI-powered learning platform that transforms static educational content into personalized animated videos. The system follows a modular architecture with clear separation of concerns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                          │
│                    (Streamlit App)                          │
│  - Content Upload  - Personalization  - Video Generation   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                  APPLICATION LAYER                          │
│                      (app.py)                               │
│  - User Flow Management  - Session State  - UI Components  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                   BUSINESS LOGIC                            │
│                   (utils/ modules)                          │
├─────────────────────┬───────────────────┬───────────────────┤
│  Text Extractor     │   AI Processor    │  Video Generator  │
│  - PDF parsing      │   - Summarization │  - TTS generation │
│  - OCR extraction   │   - Personalize   │  - Animation      │
│  - Web scraping     │   - Script gen    │  - Assembly       │
│  - Text validation  │   - Visual prompts│  - Rendering      │
└─────────────────────┴───────────────────┴───────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                  EXTERNAL SERVICES                          │
├─────────────────────┬───────────────────┬───────────────────┤
│   OpenAI API        │  ElevenLabs API   │  Pika/Runway API  │
│   - GPT-4o mini     │  - Text-to-Speech │  - Animation Gen  │
│   - Summarization   │  - Voice synthesis│  - Visual effects │
│   - Personalization │                   │                   │
└─────────────────────┴───────────────────┴───────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                   DATA STORAGE                              │
│  - uploads/         - generated_videos/    - temp/          │
│  - history.json     - user profiles        - cache          │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. User Interface Layer (Streamlit)

**File:** `app.py`

**Responsibilities:**
- Render web interface
- Handle user interactions
- Manage session state
- Display progress and results

**Key Features:**
- Multi-page navigation (Create, Library, Settings)
- File upload handling
- Real-time progress tracking
- Video playback and download

### 2. Text Extraction Module

**File:** `utils/text_extractor.py`

**Class:** `TextExtractor`

**Methods:**
- `extract_from_pdf(file_path)` - Extract text from PDF documents
- `extract_from_image(file_path)` - OCR extraction from images
- `extract_from_url(url)` - Web scraping from URLs
- `extract_from_text(text)` - Process plain text
- `validate_content_length(text, max_words)` - Validate word count

**Dependencies:**
- PyPDF2 (PDF parsing)
- Pytesseract (OCR)
- BeautifulSoup4 (Web scraping)
- Pillow (Image processing)

**Flow:**
```
Input → Format Detection → Extraction → Validation → Output
```

### 3. AI Processing Module

**File:** `utils/ai_processor.py`

**Class:** `AIProcessor`

**Methods:**
- `enhance_interest_profile(interest_description)` - Create learning profile
- `summarize_content(text, target_duration)` - Summarize content
- `personalize_content(summary_data, interest_profile, target_duration)` - Generate script
- `generate_video_prompts(script, num_scenes)` - Create visual descriptions
- `process_content(text, interest_profile, target_duration)` - Complete pipeline

**AI Pipeline:**
```
Raw Text
    ↓
Summarization (GPT-4o mini)
    ↓
Key Points Extraction
    ↓
Interest Profile Enhancement
    ↓
Personalized Script Generation
    ↓
Visual Prompt Creation
    ↓
Structured Output
```

**Prompt Engineering:**
- System prompts for consistent behavior
- Temperature tuning for creativity vs. accuracy
- Token limits for cost optimization
- Structured output parsing

### 4. Video Generation Module

**File:** `utils/video_generator.py`

**Class:** `VideoGenerator`

**Methods:**
- `generate_voiceover(script, output_path)` - Create audio narration
- `generate_animation_placeholder(visual_prompt, duration, output_path, scene_number)` - Generate visuals
- `assemble_video(audio_path, video_clips, output_path)` - Combine audio and video
- `generate_complete_video(script, visual_prompts, duration, output_filename)` - Full pipeline

**Video Pipeline:**
```
Script
    ↓
Text-to-Speech (ElevenLabs/OpenAI)
    ↓
Audio File (.mp3)
    ↓
Visual Prompts → Animation Generation (Pika/Runway/Placeholder)
    ↓
Video Clips (.mp4)
    ↓
Video Assembly (MoviePy)
    ↓
Final Video with Audio
```

**Technical Specs:**
- Resolution: 1280x720 (HD)
- Frame Rate: 24 fps
- Audio: AAC codec
- Video: H.264 codec
- Format: MP4

### 5. Configuration Module

**File:** `config.py`

**Purpose:** Centralized configuration management

**Settings:**
- API keys and credentials
- File size and content limits
- Directory paths
- Supported formats
- Video duration options
- Preset interests

## Data Flow

### Complete User Journey

```
1. USER UPLOADS CONTENT
   ↓
   app.py receives upload
   ↓
   Save to uploads/ directory
   ↓
   
2. TEXT EXTRACTION
   ↓
   TextExtractor.extract()
   ↓
   Format-specific extraction
   ↓
   Validation (max 3000 words)
   ↓
   
3. PERSONALIZATION SETUP
   ↓
   User selects/describes interest
   ↓
   AIProcessor.enhance_interest_profile()
   ↓
   Enhanced learning profile
   ↓
   
4. AI PROCESSING
   ↓
   AIProcessor.process_content()
   ├─ Summarize content
   ├─ Extract key points
   ├─ Generate personalized script
   └─ Create visual prompts
   ↓
   
5. VIDEO GENERATION
   ↓
   VideoGenerator.generate_complete_video()
   ├─ Generate voiceover (TTS)
   ├─ Create animations (per scene)
   └─ Assemble final video
   ↓
   
6. DELIVERY
   ↓
   Save to generated_videos/
   ↓
   Update history.json
   ↓
   Display to user
   ↓
   Download/Share options
```

## File Structure

```
Rusaldo/
├── app.py                      # Main Streamlit application
├── config.py                   # Configuration settings
├── requirements.txt            # Python dependencies
├── .env.example               # Environment template
├── .env                       # Environment variables (gitignored)
├── .gitignore                 # Git ignore rules
│
├── utils/                     # Core utilities
│   ├── __init__.py
│   ├── text_extractor.py     # Content extraction
│   ├── ai_processor.py       # AI processing
│   └── video_generator.py    # Video generation
│
├── uploads/                   # Uploaded files (gitignored)
├── generated_videos/          # Output videos (gitignored)
│   └── history.json          # Video generation history
├── temp/                      # Temporary files (gitignored)
│
├── README.md                  # Project overview
├── SETUP.md                   # Setup instructions
├── ARCHITECTURE.md            # This file
├── LICENSE                    # MIT License
│
├── run.bat                    # Windows launcher
├── run.sh                     # Unix launcher
└── verify_setup.py           # Setup verification
```

## API Integration

### OpenAI GPT-4o mini

**Purpose:** Content processing and personalization

**Endpoints Used:**
- `chat.completions.create()` - Text generation

**Usage Pattern:**
```python
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ],
    temperature=0.7,
    max_tokens=500
)
```

**Cost Optimization:**
- Use mini model for cost efficiency
- Limit token counts
- Cache common responses
- Batch similar requests

### ElevenLabs TTS

**Purpose:** High-quality voice generation

**API:**
```python
audio = generate(
    text=script,
    voice="Rachel",
    model="eleven_monolingual_v1"
)
```

**Fallback:** OpenAI TTS if ElevenLabs unavailable

### Pika Labs / Runway (Optional)

**Purpose:** Advanced animation generation

**Status:** MVP uses placeholder animations

**Future Integration:**
- API calls for scene generation
- Style transfer
- Motion effects
- Transitions

## State Management

### Session State (Streamlit)

**Stored Data:**
- `user_profile` - Current user's interest profile
- `generated_videos` - List of generated videos
- `processing` - Current processing status

**Persistence:**
- Session-based (browser session)
- Videos saved to disk
- History in JSON file

### File-Based Storage

**history.json Structure:**
```json
[
  {
    "filename": "rusaldo_video_20241107_143022.mp4",
    "path": "generated_videos/rusaldo_video_20241107_143022.mp4",
    "timestamp": "20241107_143022",
    "duration": "1 minute",
    "interest": "Football & Soccer",
    "word_count": 450
  }
]
```

## Error Handling

### Error Categories

1. **Input Validation Errors**
   - File size exceeds limit
   - Content too long (>3000 words)
   - Invalid file format
   - Malformed URL

2. **Processing Errors**
   - OCR failure
   - PDF parsing error
   - Web scraping blocked
   - API rate limits

3. **Generation Errors**
   - TTS generation failure
   - Video assembly error
   - Insufficient disk space
   - FFmpeg errors

### Error Recovery

```python
try:
    # Processing logic
    result = process_content()
except ValidationError as e:
    # User-facing error message
    st.error(f"Invalid input: {e}")
except APIError as e:
    # API-specific handling
    st.error(f"Service error: {e}")
    # Retry logic or fallback
except Exception as e:
    # Generic error handling
    st.error(f"Unexpected error: {e}")
    # Log for debugging
```

## Performance Considerations

### Optimization Strategies

1. **Caching**
   - Cache API responses
   - Reuse processed content
   - Store intermediate results

2. **Async Processing**
   - Background video generation
   - Parallel API calls
   - Queue management

3. **Resource Management**
   - Cleanup temp files
   - Limit concurrent generations
   - Monitor disk usage

### Bottlenecks

1. **API Latency** (10-30s)
   - OpenAI processing
   - TTS generation
   - Animation APIs

2. **Video Assembly** (30-60s)
   - MoviePy rendering
   - FFmpeg encoding
   - File I/O

3. **OCR Processing** (5-15s)
   - Tesseract extraction
   - Image preprocessing

**Total Time:** 2-4 minutes per video

## Security Considerations

### API Key Management

- Store in `.env` file (not committed)
- Never expose in client-side code
- Rotate keys regularly
- Monitor usage

### File Upload Security

- Validate file types
- Limit file sizes
- Scan for malware (future)
- Isolate upload directory

### Data Privacy

- No user authentication (MVP)
- Local storage only
- No data collection
- User-controlled deletion

## Scalability Path

### Current Limitations (MVP)

- Single-user local deployment
- Synchronous processing
- File-based storage
- No user accounts

### Future Enhancements

1. **Multi-user Support**
   - User authentication
   - Database storage
   - Cloud deployment

2. **Async Processing**
   - Job queue (Celery)
   - Background workers
   - Real-time updates

3. **Cloud Infrastructure**
   - AWS/GCP deployment
   - S3 storage
   - CDN for videos
   - Load balancing

4. **Advanced Features**
   - Video editing
   - Custom voices
   - Collaborative learning
   - Analytics dashboard

## Testing Strategy

### Unit Tests (Future)

```python
# test_text_extractor.py
def test_pdf_extraction():
    text = TextExtractor.extract_from_pdf('test.pdf')
    assert len(text) > 0

# test_ai_processor.py
def test_summarization():
    summary = AIProcessor.summarize_content(text, 60)
    assert 'summary' in summary
```

### Integration Tests

- End-to-end video generation
- API integration tests
- File handling tests

### Manual Testing Checklist

- [ ] Upload PDF and generate video
- [ ] Upload image with OCR
- [ ] Scrape web page
- [ ] Paste plain text
- [ ] Test all duration options
- [ ] Test all preset interests
- [ ] Test custom interest description
- [ ] Download generated video
- [ ] View video library
- [ ] Clear data

## Monitoring & Logging

### Current Logging

- Streamlit console output
- Error messages in UI
- Progress indicators

### Future Monitoring

- Application logs
- API usage tracking
- Performance metrics
- Error reporting (Sentry)
- Analytics (Mixpanel)

## Deployment

### Local Deployment (MVP)

```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with API keys

# Run application
streamlit run app.py
```

### Production Deployment (Future)

**Options:**
1. **Streamlit Cloud** - Simple deployment
2. **Docker** - Containerized deployment
3. **AWS/GCP** - Full cloud infrastructure
4. **Heroku** - Platform as a Service

## Maintenance

### Regular Tasks

- Update dependencies
- Monitor API costs
- Clean old videos
- Backup user data
- Review error logs

### Dependency Updates

```bash
pip list --outdated
pip install --upgrade package_name
pip freeze > requirements.txt
```

## Contributing

### Code Style

- PEP 8 compliance
- Type hints
- Docstrings
- Comments for complex logic

### Git Workflow

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request
5. Code review
6. Merge to main

---

**Last Updated:** November 2024  
**Version:** 1.0.0 (MVP)  
**Status:** Active Development
