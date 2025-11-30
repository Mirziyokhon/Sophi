# Troubleshooting Guide - Rusaldo

## ❌ Hugging Face Credits Exhausted Error

### Error Message:
```
Error generating video: Error in sketch video generation pipeline: 
Error generating sketch image: Hugging Face API error: 402 - 
{"error":"You have exceeded your monthly included credits for Inference Providers. 
Subscribe to PRO to get 20x more monthly included credits."}
```

### What This Means:
Hugging Face's free tier has a monthly credit limit, and you've reached it. This happens when:
1. All higher-priority APIs (Imagen 3, Stability AI, DALL-E 3) failed or weren't configured
2. The system fell back to Hugging Face as the last resort
3. Hugging Face ran out of free credits

---

## ✅ Solutions

### Solution 1: Use Imagen 3 (Recommended - Already Configured!)

You already have a Gemini API key, which gives you access to Imagen 3!

**Check if Imagen 3 is working:**
1. Look at the Streamlit terminal output when you start generating a video
2. You should see:
   ```
   🔧 Image generation priority:
      1. Imagen 3: ✅ ENABLED
      2. Stability AI: ✅ ENABLED
      3. DALL-E 3: ✅ ENABLED
      4. Hugging Face: ✅ ENABLED
   ```

3. During generation, you should see:
   ```
   🎨 Using Google Imagen 3...
   ```

**If Imagen 3 shows as disabled:**
- Check that `GEMINI_API_KEY` is set in your `.env` file
- Verify the `google-genai` package is installed: `pip install google-genai>=0.2.0`
- Restart the Streamlit server

---

### Solution 2: Use Stability AI

Your Stability AI key is configured. This should work if Imagen 3 fails.

**Check Stability AI credits:**
- Visit: https://platform.stability.ai/account/credits
- Free tier: Limited credits
- Paid tier: $10 for 1,000 credits

**If you see "402 Out of credits":**
- Add credits to your Stability AI account
- Or rely on Imagen 3 or DALL-E 3

---

### Solution 3: Use DALL-E 3

Your OpenAI API key is configured. DALL-E 3 costs $0.04 per image.

**For a 0.5 minute video (30 seconds):**
- 3 frames per second × 30 seconds = 90 frames
- Cost: 90 × $0.04 = $3.60

**To reduce costs:**
- Use shorter videos (0.5 minutes)
- Reduce `images_per_second` in `sketch_animator.py` (currently 3)
- Use Imagen 3 or Stability AI instead

---

### Solution 4: Upgrade Hugging Face (Not Recommended)

Hugging Face PRO costs $9/month and gives you 20x more credits.

**However, we recommend using Imagen 3 instead** since you already have a Gemini API key!

---

## 🔧 Debug Steps

### Step 1: Check API Key Configuration

Open your `.env` file and verify:
```bash
GEMINI_API_KEY=AIzaSy...  # ✅ You have this
STABILITY_API_KEY=sk-...  # ✅ You have this
OPENAI_API_KEY=sk-proj... # ✅ You have this
HUGGINGFACE_API_KEY=hf_... # ⚠️ Out of credits
```

### Step 2: Check Terminal Output

When you generate a video, look at the Streamlit terminal for:

```
✅ Imagen 3 initialized successfully
🔧 Image generation priority:
   1. Imagen 3: ✅ ENABLED
   2. Stability AI: ✅ ENABLED
   3. DALL-E 3: ✅ ENABLED
   4. Hugging Face: ✅ ENABLED
```

### Step 3: Monitor Generation Process

During video generation, you should see:
```
🎨 Generating sketch frame 0 for scene 0...
🎨 Using Google Imagen 3...
```

**If you see "trying Hugging Face"**, it means all other APIs failed!

---

## 🎯 Recommended Configuration

### For Best Results:

1. **Primary: Imagen 3** (Free with Gemini API, high quality)
   - Already configured ✅
   - Should work automatically

2. **Backup: Stability AI** (Fast, good quality)
   - Already configured ✅
   - Add credits if needed

3. **Backup: DALL-E 3** (High quality, costs money)
   - Already configured ✅
   - $0.04 per image

4. **Last Resort: Hugging Face** (Free but limited)
   - Out of credits ❌
   - Only used if all others fail

---

## 🐛 Common Issues

### Issue 1: "google-genai package not available"

**Solution:**
```bash
pip install google-genai>=0.2.0
```

### Issue 2: "GEMINI_API_KEY not found"

**Solution:**
- Check your `.env` file
- Make sure it's named exactly `GEMINI_API_KEY`
- Restart Streamlit after editing `.env`

### Issue 3: All APIs failing

**Check:**
1. Internet connection
2. API key validity
3. API service status
4. Credit/quota limits

---

## 💰 Cost Comparison

### Imagen 3 (Google)
- **Cost:** Included with Gemini API
- **Quality:** Excellent
- **Speed:** Fast
- **Limit:** Check Google Cloud quotas

### Stability AI
- **Cost:** ~$0.01 per image
- **Quality:** Very good
- **Speed:** Very fast
- **Limit:** Based on credits

### DALL-E 3 (OpenAI)
- **Cost:** $0.04 per image
- **Quality:** Excellent
- **Speed:** Fast
- **Limit:** Based on account balance

### Hugging Face
- **Cost:** Free (limited) or $9/month (PRO)
- **Quality:** Good
- **Speed:** Slow (model loading)
- **Limit:** Monthly credits

---

## 📊 For a 0.5 Minute Video

**Frames needed:** 3 fps × 30 seconds = 90 frames

**Estimated costs:**
- Imagen 3: **Free** (included with Gemini)
- Stability AI: 90 × $0.01 = **$0.90**
- DALL-E 3: 90 × $0.04 = **$3.60**
- Hugging Face: **Free** (if within limits)

**Recommendation:** Use Imagen 3! It's free and high quality.

---

## 🚀 Quick Fix

**To use Imagen 3 right now:**

1. Verify your `.env` has `GEMINI_API_KEY`
2. Restart Streamlit: `Ctrl+C` then `streamlit run app.py`
3. Generate a video
4. Check terminal for "✅ Imagen 3 initialized successfully"
5. You should see "🎨 Using Google Imagen 3..."

**If it still uses Hugging Face:**
- Check the terminal debug output
- Look for error messages about Imagen 3
- Verify the `google-genai` package is installed

---

## 📞 Need Help?

Check the terminal output for detailed error messages. The new debug logging will show:
- Which APIs are enabled
- Which API is being used for each frame
- Why APIs are failing (if they do)

This will help identify exactly what's going wrong!
