# MiKTeX Manual Package Installation

## Issue: Missing `preview.sty` Package

The error shows MiKTeX is missing the `preview` package which is required for Manim.

## Solution: Install via MiKTeX Console (GUI)

### Step 1: Open MiKTeX Console
1. Press `Windows Key`
2. Type "MiKTeX Console"
3. Click to open

### Step 2: Update Package Database
1. Go to **Updates** tab
2. Click **Check for updates**
3. Wait for it to complete (may take 1-2 minutes)

### Step 3: Install Required Packages
1. Go to **Packages** tab
2. Search for and install these packages:
   - `preview` ⭐ **CRITICAL - Missing!**
   - `amsmath`
   - `amssymb`
   - `amstext`
   - `geometry`
   - `xcolor`
   - `standalone`

3. For each package:
   - Click the package name
   - Click the **+** (Install) button
   - Wait for installation to complete

### Step 4: Enable Auto-Install
1. Go to **Settings** tab
2. Under **General**:
   - Set "Install missing packages on-the-fly" to **Yes**
   - Set "Package installation" to **Always**

### Step 5: Test
After installing packages, run:
```bash
python test_quadratic.py
```

## Alternative: Command Line (if network works)

```powershell
# Update database
initexmf --update-fndbinitexmf --update-fndbinitexmf --update-fndbinitexmf --update-fndbinitexmf --update-fndbv

# Install packages
miktex packages install preview
miktex packages install amsmath
miktex packages install amssymb
miktex packages install amstext
miktex packages install geometry
miktex packages install xcolor
miktex packages install standalone
```

## Why This Happens

MiKTeX has two installation modes:
1. **Minimal** - Only core packages (what you have)
2. **Full** - All packages (2GB+)

You have the minimal install, so packages download on-demand. The `preview` package is required by Manim but wasn't included in the minimal install.

## After Setup

Once packages are installed:
- ✅ First render: Instant (packages cached)
- ✅ All future renders: Instant
- ✅ No more downloads needed

## Current Status

```
❌ Missing: preview.sty
✅ LaTeX: Installed and in PATH
✅ FFmpeg: Installed
✅ Manim: Installed
```

**Install the `preview` package via MiKTeX Console and you're done!** 🚀
