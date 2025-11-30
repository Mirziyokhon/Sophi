# Setup LaTeX packages for Manim
# Run this ONCE to pre-install all required packages

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LaTeX Package Setup for Manim" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if MiKTeX is installed
$mpmPath = "C:\Program Files\MiKTeX\miktex\bin\x64\mpm.exe"

if (Test-Path $mpmPath) {
    Write-Host "✅ MiKTeX found!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "📦 Installing required LaTeX packages..." -ForegroundColor Yellow
    Write-Host "   This may take 5-10 minutes on first run" -ForegroundColor Gray
    Write-Host ""
    
    $packages = @(
        "amsmath",
        "amssymb", 
        "amstext",
        "geometry",
        "xcolor"
    )
    
    foreach ($pkg in $packages) {
        Write-Host "   Installing $pkg..." -ForegroundColor Cyan
        & $mpmPath --install=$pkg
    }
    
    Write-Host ""
    Write-Host "✅ All packages installed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎬 Now running test render to cache everything..." -ForegroundColor Yellow
    
    # Run test to trigger any remaining downloads
    python test_manim_direct.py
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "✅ Setup Complete!" -ForegroundColor Green
    Write-Host "   Manim is ready for instant rendering" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    
} else {
    Write-Host "❌ MiKTeX not found at: $mpmPath" -ForegroundColor Red
    Write-Host "   Please install MiKTeX first" -ForegroundColor Yellow
}
