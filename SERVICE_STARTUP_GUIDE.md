# Rusaldo Services Startup Guide

## Quick Start

### Option 1: Use the Batch Files
1. **Start Both Services**: Double-click `start_all_services.bat`
2. **Start Streamlit Only**: Double-click `start_streamlit.bat` 
3. **Start Frontend Only**: Double-click `v0-design\start_nextjs.bat`

### Option 2: Manual Command Line

#### Terminal 1 - Streamlit Backend
```cmd
cd /d "d:\Projects\Rusaldo"
streamlit run app.py --server.port 8501
```

#### Terminal 2 - Next.js Frontend  
```cmd
cd /d "d:\Projects\Rusaldo\v0-design"
npm run dev
```

### Option 3: PowerShell
```powershell
# Terminal 1
Set-Location "d:\Projects\Rusaldo"
streamlit run app.py --server.port 8501

# Terminal 2  
Set-Location "d:\Projects\Rusaldo\v0-design"
npm run dev
```

## Access URLs
- **Frontend**: http://localhost:3000
- **Backend/Streamlit**: http://localhost:8501

## Prerequisites

### Python Dependencies
```cmd
cd /d "d:\Projects\Rusaldo"
pip install -r requirements.txt
```

### Node.js Dependencies
```cmd
cd /d "d:\Projects\Rusaldo\v0-design"
npm install
# or
pnpm install
```

## Troubleshooting

### Streamlit Issues
- Make sure Python 3.8+ is installed
- Check all requirements are installed: `pip install -r requirements.txt`
- Verify .env file exists with proper API keys

### Frontend Issues
- Make sure Node.js 18+ is installed
- Install dependencies: `npm install` in v0-design folder
- Check if port 3000 is available

### Port Conflicts
- Streamlit: Change port with `--server.port 8502`
- Frontend: Change port in .env or use `npm run dev -- -p 3001`

## New Features Added

✅ **Custom Video Player** with timeline and controls
✅ **Subtitle Panel** below video (never covers controls)  
✅ **Export Options** (MP4, Audio, GIF, Subtitles)
✅ **Enhanced Playback Controls** (speed, volume, skip)

The custom player includes:
- Interactive timeline/scrubber
- Real-time subtitle display
- Dedicated subtitle panel
- Multiple export formats
- Speed control (0.5x-2x)
- Volume control
- Skip forward/backward buttons
