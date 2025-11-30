# Manim Analysis - Requirements & Limits

## ✅ What We Have Installed:
- Python 3.11
- Manim Community v0.18.0
- LaTeX (MiKTeX 24.1)
- FFmpeg 8.0

## 🔍 Manim Requirements:

### 1. **System Requirements:**
- ✅ Python 3.8+ (we have 3.11)
- ✅ FFmpeg (installed)
- ✅ LaTeX (installed)
- ✅ Cairo graphics library (comes with Manim)

### 2. **Font Requirements:**
- ⚠️ **Comic Sans MS** - May not be available on all systems
- Fallback: Use default fonts if Comic Sans missing

### 3. **Text Limitations:**
- ❌ **Cannot handle quotes in f-strings properly**
- ❌ **Special characters break Python syntax**
- ❌ **Newlines cause issues**
- ✅ **FIXED**: Now sanitizing text before script generation

### 4. **Duration Limitations:**
- ⚠️ Manim doesn't have built-in duration control
- Scene runs until all animations complete
- We adjust duration AFTER rendering with MoviePy

### 5. **Performance:**
- Low quality (-ql): ~30-60 seconds per scene
- High quality (-qh): ~2-5 minutes per scene
- Memory: ~500MB-1GB per scene

## 🐛 Root Cause of "NoneType" Error:

### The Issue:
```python
# In generated script:
title = Text(
    """User's text with "quotes" or 'apostrophes'""",  # ❌ BREAKS!
    ...
)
```

### Why It Breaks:
1. User text contains quotes → breaks Python string syntax
2. Script fails to compile
3. Manim can't run → returns None
4. MoviePy tries to process None → **NoneType error!**

### The Fix:
```python
# Sanitize text first:
safe_text = text.replace('"', '').replace("'", '').replace('\\n', ' ')

# Then use in script:
title = Text(
    "{safe_text}",  # ✅ SAFE!
    ...
)
```

## 📊 What We're NOT Exceeding:

- ✅ Text length: Limited to 50 chars (safe)
- ✅ Scene complexity: Simple shapes only
- ✅ Duration: 5-60 seconds per scene (reasonable)
- ✅ Memory: Using low quality rendering
- ✅ Dependencies: All installed correctly

## ✅ Solution Applied:

1. **Text Sanitization** - Remove all special characters
2. **Validation** - Check duration is valid float
3. **Fallbacks** - Default values if anything is None
4. **Error Handling** - Graceful degradation

## 🎯 Expected Behavior Now:

```
User Input: "Let's learn about "AI" today!"
           ↓
Sanitized: "Lets learn about AI today"
           ↓
Manim Script: ✅ Valid Python
           ↓
Rendering: ✅ Success
           ↓
Video: ✅ Generated!
```
