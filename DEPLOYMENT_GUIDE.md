# Rusaldo Deployment Guide

## ✅ Local Deployment (Current)

Your app is now running locally with the following updates:
- ✅ Google Imagen 3 integration
- ✅ Default video length set to **0.5 minutes** for faster generation
- ✅ Fixed Hugging Face API endpoint
- ✅ Updated browser preview

**Access your app at:** http://localhost:8501

---

## 🚀 Cloud Deployment Options

### Option 1: Streamlit Cloud (Recommended - FREE)

Streamlit Cloud is the easiest way to deploy Streamlit apps for free.

#### Steps:

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit with Imagen 3 integration"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Create `.streamlit/secrets.toml` file** (for Streamlit Cloud secrets)
   ```toml
   OPENAI_API_KEY = "your_key_here"
   GEMINI_API_KEY = "your_key_here"
   ELEVENLABS_API_KEY = "your_key_here"
   STABILITY_API_KEY = "your_key_here"
   HUGGINGFACE_API_KEY = "your_key_here"
   RUNWAY_API_KEY = "your_key_here"
   REPLICATE_API_KEY = "your_key_here"
   ```

3. **Deploy to Streamlit Cloud**
   - Go to https://share.streamlit.io/
   - Sign in with GitHub
   - Click "New app"
   - Select your repository
   - Set main file path: `app.py`
   - Add secrets from `.streamlit/secrets.toml` in the Streamlit Cloud dashboard
   - Click "Deploy"

#### Pros:
- ✅ Free hosting
- ✅ Automatic updates from GitHub
- ✅ Built-in secret management
- ✅ Easy to use

#### Cons:
- ⚠️ Limited resources (may be slow for video generation)
- ⚠️ Public apps only (unless you have a paid plan)

---

### Option 2: Heroku

Heroku is a cloud platform that supports Python apps.

#### Steps:

1. **Create `Procfile`**
   ```
   web: streamlit run app.py --server.port=$PORT --server.address=0.0.0.0
   ```

2. **Create `runtime.txt`**
   ```
   python-3.11.0
   ```

3. **Deploy to Heroku**
   ```bash
   heroku login
   heroku create rusaldo-app
   heroku config:set OPENAI_API_KEY=your_key
   heroku config:set GEMINI_API_KEY=your_key
   # ... set other API keys
   git push heroku main
   ```

#### Pros:
- ✅ More resources than Streamlit Cloud
- ✅ Better for video generation
- ✅ Custom domains

#### Cons:
- ⚠️ No free tier anymore (starts at $5/month)
- ⚠️ More complex setup

---

### Option 3: Google Cloud Run

Deploy as a containerized app on Google Cloud.

#### Steps:

1. **Create `Dockerfile`**
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   EXPOSE 8501
   CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy rusaldo --source . --region us-central1
   ```

#### Pros:
- ✅ Scales automatically
- ✅ Pay only for what you use
- ✅ Good performance

#### Cons:
- ⚠️ Requires Google Cloud account
- ⚠️ More complex setup

---

### Option 4: AWS EC2 or DigitalOcean

Deploy on a virtual private server.

#### Steps:

1. **Create a server instance**
2. **SSH into the server**
3. **Install dependencies**
   ```bash
   sudo apt update
   sudo apt install python3-pip
   pip3 install -r requirements.txt
   ```

4. **Run with PM2 or systemd**
   ```bash
   pm2 start "streamlit run app.py" --name rusaldo
   ```

#### Pros:
- ✅ Full control
- ✅ Best performance
- ✅ Can handle large video files

#### Cons:
- ⚠️ Costs money ($5-50/month)
- ⚠️ Requires server management

---

## 📝 Important Notes for Deployment

### 1. Environment Variables
Make sure to set all API keys as environment variables or secrets:
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `ELEVENLABS_API_KEY`
- `STABILITY_API_KEY`
- `HUGGINGFACE_API_KEY`
- `RUNWAY_API_KEY`
- `REPLICATE_API_KEY`

### 2. File Storage
For production, consider using cloud storage:
- AWS S3
- Google Cloud Storage
- Azure Blob Storage

Update the `VIDEO_OUTPUT_DIR` and `UPLOAD_DIR` to use cloud storage.

### 3. Video Generation Limits
- 0.5 minutes = ~30 seconds (fastest, good for testing)
- 1 minute = ~60 seconds (recommended for demos)
- 2+ minutes = may take 5-10 minutes to generate

### 4. API Rate Limits
Be aware of API rate limits:
- **Imagen 3**: Check Google Cloud quotas
- **Stability AI**: Limited free tier
- **DALL-E 3**: $0.04 per image
- **Hugging Face**: Free but slower

---

## 🎯 Recommended Deployment Strategy

**For Testing/Demo:**
- Use **Streamlit Cloud** (free, easy)
- Set default to 0.5 minutes ✅ (already done)

**For Production:**
- Use **Google Cloud Run** or **AWS EC2**
- Implement cloud storage for videos
- Add user authentication
- Set up monitoring and logging

---

## 📊 Current Configuration

- ✅ Default video length: **0.5 minutes** (30 seconds)
- ✅ Image generation: **Imagen 3** (primary)
- ✅ Fallback: Stability AI → DALL-E 3 → Hugging Face
- ✅ Local server running on: http://localhost:8501

---

## 🔧 Quick Test

To verify the 0.5 minute option is working:

1. Open http://localhost:8501
2. Upload any content (text, PDF, or image)
3. Choose an interest
4. Check that "0.5 minutes" is selected by default
5. Generate video
6. Video should complete in ~2-3 minutes

The 0.5 minute option generates a 30-second video, which is perfect for quick testing!
