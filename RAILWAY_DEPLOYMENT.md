# 🚀 Railway Deployment Guide

## 📋 Why Railway?
- **$5 free credit each month** (renews!)
- **Better performance** than Render
- **No sleep timeouts** on paid plans
- **Docker support** for complex apps
- **Built-in databases** and storage

## 🏗️ Deployment Architecture

### **Option 1: Backend Only (Recommended)**
- Deploy Streamlit backend to Railway
- Use Vercel/Netlify for frontend (free static hosting)
- **Most cost-effective**

### **Option 2: Fullstack on Railway**
- Both frontend and backend on Railway
- Uses `railway.yaml` for multi-service deployment
- **Simpler management**

## 🚀 Quick Deploy (Backend Only)

### 1. Push to GitHub
```bash
git add railway.yaml railway.toml
git commit -m "Configure for Railway deployment"
git push origin main
```

### 2. Deploy on Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `Mirziyokhon/Sophi`
5. Railway will detect `railway.toml`

### 3. Set Environment Variables
In Railway dashboard, add these to your backend service:
```env
GEMINI_API_KEY=AIzaSyDvTHaOdyK2FAUDyjZnocEOVEsS-AsWhtc
ELEVENLABS_API_KEY=sk_efbc073fa29cd8c23d48d3182091747d5da3c41fbc130b96
STABILITY_API_KEY=sk-GomwJi7ki7wrS4ugZXYzDzlixnCOjndDKV3TCmWB9umx7RTN
HUGGINGFACE_API_KEY=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
OPENAI_API_KEY=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
REPLICATE_API_KEY=r8_VVH6xe4ZDH8CxdwgtGALNZLmTCkOp9i15duHK
RUNWAY_API_KEY=key_0ce067be2b8c3d51aac1b68f2f7f704fcaea41c34f3a59bdd642b4e4d1e0aa9c74d31a819c8b5ba1504359a1ead30425d597c4a4fc99c98985f4575ae980290d
```

## 🌐 Your URLs
After deployment:
- **Backend**: `https://sophi-backend-production.up.railway.app`
- **Frontend**: Deploy separately to Vercel/Netlify

## 💡 Railway Advantages

### **Over Render:**
- ✅ No sleep timeouts (paid plans)
- ✅ Better performance
- ✅ $5 monthly credit vs Render's strict limits
- ✅ Better Docker support
- ✅ Built-in PostgreSQL/Redis

### **Over Heroku:**
- ✅ Actually free (Heroku ended free tier)
- ✅ Modern UI/UX
- ✅ Better pricing
- ✅ Faster deployments

## 🔧 Troubleshooting

### **Build Issues**
```bash
# Test Docker build locally
docker build -f Dockerfile.render -t sophi-backend .
```

### **Common Problems**
1. **Port issues**: Railway sets PORT env var automatically
2. **API keys**: Make sure to set in Railway dashboard, not code
3. **Memory limits**: Free tier has 512MB RAM limit
4. **Build timeouts**: Large dependencies may timeout

## 📊 Monitoring

Railway provides:
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, network usage
- **Health checks**: Service status monitoring
- **Deploy history**: Rollback capability

## 🎯 Pro Tips

1. **Use environment variables** for all secrets
2. **Monitor usage** to stay within free tier
3. **Set up health checks** for reliability
4. **Use Railway's database** instead of external services
5. **Scale vertically** before horizontally

Ready to deploy on Railway! 🚀
