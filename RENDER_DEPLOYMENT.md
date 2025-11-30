# 🚀 Render Deployment Guide

## 📋 Overview
Deploy your Sophi fullstack application on Render with separate frontend and backend services.

## 🏗️ Architecture
- **Frontend**: Next.js static site (sophi-frontend.onrender.com)
- **Backend**: Streamlit app (sophi-backend.onrender.com)
- **Both**: Free tier with sleep after 15min inactivity

## 🔧 Setup Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

### 2. Deploy on Render
1. Go to [render.com](https://render.com)
2. Sign up/login with GitHub
3. Click "New +" → "Blueprint"
4. Connect your GitHub repository
5. Render will auto-detect `render.yaml`

### 3. Set Environment Variables
In Render dashboard, set these for the **backend** service:
- `OPENAI_API_KEY`: Your OpenAI API key
- `GEMINI_API_KEY`: Your Google Gemini API key  
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key
- `STABILITY_API_KEY`: Your Stability AI key
- `HUGGINGFACE_API_KEY`: Your Hugging Face key
- `REPLICATE_API_KEY`: Your Replicate key (optional)
- `RUNWAY_API_KEY`: Your Runway key (optional)

## 🌐 Access URLs
After deployment:
- **Frontend**: `https://sophi-frontend.onrender.com`
- **Backend**: `https://sophi-backend.onrender.com`

## ⚠️ Important Notes

### Free Tier Limitations
- **Sleep after 15min** inactivity
- **Cold start** ~30 seconds on first visit
- **Limited resources** (not for production)

### Static Export Requirements
- Frontend builds to static files (`out/` directory)
- No server-side features
- API calls go to backend service

### Video Processing
- Large videos may timeout on free tier
- Consider upgrading to paid plan for production
- Use shorter videos (0.5-1 minute) on free tier

## 🔍 Troubleshooting

### Frontend Issues
```bash
# Test static build locally
cd v0-design
npm run build
npm run export  # if available
```

### Backend Issues
```bash
# Test Docker build locally
docker build -f Dockerfile.render -t sophi-backend .
docker run -p 8501:8501 sophi-backend
```

### Common Problems
1. **Build fails**: Check `package.json` engines field
2. **API errors**: Verify environment variables in Render dashboard
3. **Timeout**: Free tier has limited resources
4. **CORS issues**: Backend needs to allow frontend origin

## 🔄 CI/CD
- Auto-deploys on push to main branch
- Manual redeploy available in Render dashboard
- Build logs available in Render console

## 📊 Monitoring
- Render provides basic metrics
- Check logs in dashboard
- Monitor resource usage

## 💡 Pro Tips
1. Use webhook to keep backend awake (paid tier)
2. Implement caching for better performance
3. Use CDN for static assets
4. Monitor API usage and costs
