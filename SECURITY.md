# Security Guidelines

## 🔐 API Key Management

### CRITICAL: Never Commit API Keys

Your API keys have been exposed in the Git history. Follow these steps to secure your project:

### 1. Generate New API Keys

All API keys in the previous `.env` file were committed to Git and are now compromised. Generate new keys from:

- **Gemini API** (Required): https://aistudio.google.com/app/apikey
- **ElevenLabs API**: https://elevenlabs.io/app/settings/api-keys
- **Stability AI**: https://platform.stability.ai/account/keys
- **Hugging Face**: https://huggingface.co/settings/tokens
- **Runway**: https://app.runwayml.com/account
- **Replicate**: https://replicate.com/account/api-tokens

### 2. Update Your Local .env File

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your NEW API keys to `.env`

3. **NEVER commit `.env`** - it's already in `.gitignore`

### 3. Clean Git History (Already Done)

✅ `.env` has been removed from Git tracking
✅ Changes have been pushed to remote repository

**Note:** Old API keys are still visible in Git history. To completely remove them, you would need to rewrite Git history using tools like `git filter-branch` or `BFG Repo-Cleaner`, but this is complex and can break things. Instead, we've revoked the old keys and will use new ones.

## 🛡️ Best Practices

### ✅ DO:
- Keep `.env` in `.gitignore` (already configured)
- Use `.env.example` for documentation with dummy values
- Use environment variables in production (Railway, Vercel, Netlify)
- Rotate API keys regularly
- Use different keys for development and production
- Set up API key usage alerts and limits

### ❌ DON'T:
- Never commit `.env` files to Git
- Never hardcode API keys in source code
- Never share API keys in chat, screenshots, or logs
- Don't rely on private repos for API key security
- Don't push `.env` files even temporarily

## 🚀 Production Deployment

When deploying to production platforms, set environment variables through their dashboard:

### Railway
```bash
railway variables set GEMINI_API_KEY=your_key_here
```

### Vercel
```bash
vercel env add GEMINI_API_KEY
```

### Netlify
Set environment variables in: Site settings → Environment variables

## 📝 Setup Instructions for New Developers

1. Clone the repository
2. Copy `.env.example` to `.env`
3. Add your own API keys to `.env`
4. Never commit `.env` to Git

## 🔍 Monitoring

- Monitor API usage on each platform's dashboard
- Set up billing alerts to avoid unexpected charges
- Review API key access logs regularly
- Revoke unused or old API keys

## 🆘 If You Accidentally Commit API Keys

1. **Immediately revoke the exposed keys**
2. Generate new API keys
3. Update your `.env` file
4. Remove the file from Git tracking:
   ```bash
   git rm --cached .env
   git commit -m "Remove sensitive file"
   git push
   ```
5. Consider rewriting Git history if keys were committed multiple times

## 📧 Contact

If you discover a security vulnerability, please report it immediately.
