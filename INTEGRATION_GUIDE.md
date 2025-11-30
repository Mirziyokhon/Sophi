# Rusaldo Integration Guide
## v0 Frontend + Python Backend

This guide explains how to run Rusaldo with the new v0 Next.js frontend connected to the Python FastAPI backend.

## Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│   Next.js Frontend  │ ◄─────► │   FastAPI Backend    │
│   (v0-design/)      │  HTTP   │   (api/main.py)      │
│   Port: 3000        │         │   Port: 8000         │
└─────────────────────┘         └──────────────────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │  Python Utils   │
                                 │  - AI Processor │
                                 │  - Text Extract │
                                 │  - Video Gen    │
                                 └─────────────────┘
```

## Setup Instructions

### 1. Install Backend Dependencies

```powershell
# Install FastAPI dependencies
pip install -r api_requirements.txt

# Ensure existing dependencies are installed
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies

```powershell
cd v0-design
pnpm install
# or
npm install
```

### 3. Configure Environment Variables

Make sure your `.env` file in the root has all required API keys:

```env
OPENAI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
ELEVENLABS_API_KEY=your_key_here
STABILITY_API_KEY=your_key_here
```

### 4. Start the Backend Server

```powershell
# From project root
python api/main.py
```

The API will run on `http://localhost:8000`

### 5. Start the Frontend

```powershell
# In another terminal
cd v0-design
pnpm dev
# or
npm run dev
```

The frontend will run on `http://localhost:3000`

## What's Been Integrated

### ✅ Backend (FastAPI)
- **`/api/extract/pdf`** - Extract text from PDF files
- **`/api/extract/image`** - OCR text from images
- **`/api/extract/url`** - Scrape content from URLs
- **`/api/extract/text`** - Process plain text input
- **`/api/generate-video`** - Generate personalized videos
- **`/api/library`** - Get all generated videos
- **`/api/settings`** - Get configuration and stats
- **`/api/health`** - Health check endpoint

### ✅ Frontend Components Updated
- **`lib/api.ts`** - API client with TypeScript types
- **`contexts/AppContext.tsx`** - Global state management
- **`components/upload.tsx`** - Connected to backend for file/URL/text extraction

### 🔄 Components to Update (Next Steps)
- **`components/personalization.tsx`** - Save interest to context
- **`components/processing.tsx`** - Call video generation API
- **`components/player.tsx`** - Display generated video
- **`components/library.tsx`** - Fetch and display video library
- **`app/layout.tsx`** - Wrap with AppProvider and Toaster

## Key Features Preserved

All original Rusaldo functionality is maintained:

1. **Multi-format Content Input**
   - PDF upload and extraction
   - Image OCR (requires Tesseract)
   - Web URL scraping
   - Plain text input

2. **AI Personalization**
   - Interest-based content adaptation
   - OpenAI/Gemini integration
   - Custom interest descriptions

3. **Video Generation**
   - Sketch animation style (Stability AI)
   - AI-generated scenes
   - Voiceover synthesis (ElevenLabs/OpenAI TTS)

4. **Library Management**
   - Video history tracking
   - Download functionality
   - Metadata storage

## Testing the Integration

### 1. Test Backend Health
```powershell
curl http://localhost:8000/api/health
```

### 2. Test Text Extraction
```powershell
curl -X POST http://localhost:8000/api/extract/text `
  -H "Content-Type: application/json" `
  -d '{"text": "Test content", "content_type": "text"}'
```

### 3. Test Frontend
Open `http://localhost:3000` and:
- Upload a PDF or paste text
- Select an interest
- Generate a video

## File Structure

```
Rusaldo/
├── api/
│   └── main.py              # FastAPI backend
├── v0-design/
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main page with routing
│   ├── components/
│   │   ├── upload.tsx       # ✅ Updated
│   │   ├── personalization.tsx
│   │   ├── processing.tsx
│   │   ├── player.tsx
│   │   └── library.tsx
│   ├── contexts/
│   │   └── AppContext.tsx   # ✅ Created
│   ├── lib/
│   │   └── api.ts           # ✅ Created
│   └── .env.local           # Frontend config
├── utils/                   # Python utilities (unchanged)
│   ├── text_extractor.py
│   ├── ai_processor.py
│   ├── video_generator.py
│   └── sketch_animator.py
├── config.py                # Configuration
├── requirements.txt         # Python deps
└── api_requirements.txt     # FastAPI deps
```

## Next Steps to Complete Integration

1. **Update `app/layout.tsx`** - Add AppProvider and Toaster
2. **Update `personalization.tsx`** - Connect to context
3. **Update `processing.tsx`** - Call video generation API
4. **Update `player.tsx`** - Display video from backend
5. **Update `library.tsx`** - Fetch videos from API

## Troubleshooting

### Backend Issues
- **Port 8000 in use**: Change port in `api/main.py`
- **Missing API keys**: Check `.env` file
- **Import errors**: Run `pip install -r requirements.txt`

### Frontend Issues
- **Port 3000 in use**: Next.js will auto-assign another port
- **API connection failed**: Ensure backend is running on port 8000
- **CORS errors**: Check CORS middleware in `api/main.py`

## Benefits of This Architecture

1. **Modern UI**: Beautiful v0 design with animations
2. **Preserved Logic**: All Python AI/video generation code intact
3. **Scalable**: Easy to deploy frontend and backend separately
4. **Type-Safe**: TypeScript frontend with proper API types
5. **Maintainable**: Clear separation of concerns

## Running Both Servers

Use two terminal windows:

**Terminal 1 - Backend:**
```powershell
python api/main.py
```

**Terminal 2 - Frontend:**
```powershell
cd v0-design
pnpm dev
```

Then open `http://localhost:3000` in your browser!
