# Netlify Deployment Guide for Sophi Frontend

## 🚀 Quick Deploy to Netlify

### **Step 1: Prepare for Netlify**
1. Go to https://netlify.com
2. Sign up/login with GitHub
3. Click "New site from Git"

### **Step 2: Connect Repository**
1. Select GitHub
2. Choose `Mirziyokhon/Sophi` repository
3. Configure build settings:

**Build Settings:**
- **Base directory:** `v0-design`
- **Build command:** `npm run build`
- **Publish directory:** `v0-design/out`

**Environment Variables:**
- `NODE_ENV`: `production`
- `NEXT_PUBLIC_API_URL`: `https://your-backend-url.com` (placeholder for now)

### **Step 3: Deploy**
1. Click "Deploy site"
2. Wait for build to complete
3. Your site will be live at: `https://random-name.netlify.app`

## 📋 Alternative: Drag & Drop Deploy

### **Easiest Method:**
1. Build locally:
```bash
cd v0-design
npm run build
```

2. Drag the `out` folder to:
   https://app.netlify.com/drop

3. Your site is live instantly!

## 🔧 If Build Fails

### **Common Issues:**
1. **Node version errors** - Netlify uses Node 18 by default
2. **Static export issues** - Need proper Next.js config

### **Fixes:**
Add `netlify.toml` to root:
```toml
[build]
  base = "v0-design"
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "20"
```

## 🎯 Your Netlify URLs

**Primary:** `https://sophi-frontend.netlify.app` (if available)
**Auto-generated:** `https://random-name.netlify.app`

## 🌐 After Deployment

1. **Test the frontend** loads properly
2. **Backend API calls** will fail (expected)
3. **UI should work** for demonstration
4. **Can connect backend later**

## ⚡ Why Netlify is Better

✅ **No Docker issues**
✅ **Automatic HTTPS**  
✅ **Global CDN**
✅ **Instant rollbacks**
✅ **Free hosting**
✅ **Custom domains**

**GO DEPLOY TO NETLIFY NOW - YOUR DEADLINE DEPENDS ON IT!** 🚀
