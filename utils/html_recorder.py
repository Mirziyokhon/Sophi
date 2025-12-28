#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
HTML to MP4 Recorder - Standalone script to convert HTML animations to MP4 with TTS audio
Run as subprocess to avoid async event loop conflicts on Windows
"""

import sys
import asyncio
import argparse
import re
import json
import subprocess
from pathlib import Path


def extract_embedded_audio(html_path: str, output_audio_path: Path) -> bool:
    """Extract embedded base64 audio from HTML and save to file."""
    try:
        import base64
        
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Look for base64 audio data URI
        match = re.search(r'data:audio/mpeg;base64,([A-Za-z0-9+/=]+)', html_content)
        if match:
            audio_base64 = match.group(1)
            audio_bytes = base64.b64decode(audio_base64)
            
            with open(output_audio_path, 'wb') as f:
                f.write(audio_bytes)
            
            if output_audio_path.exists() and output_audio_path.stat().st_size > 0:
                return True
        
        return False
    except Exception as e:
        print(f"   [WARN] Could not extract embedded audio: {e}")
        return False


def check_html_has_embedded_audio(html_path: str) -> bool:
    """Check if HTML already has embedded TTS audio."""
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Check for base64 audio data URI with actual content
        if re.search(r'data:audio/mpeg;base64,[A-Za-z0-9+/=]{100,}', html_content):
            return True
        
        return False
    except:
        return False


def extract_script_from_html(html_path: str) -> str:
    """Extract narration script from HTML animation file."""
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Try to extract from sceneData timeline (the actual JSON variable)
        scene_data_match = re.search(r'const sceneData = ({[\s\S]*?});\s*const audioElement', html_content)
        if scene_data_match:
            try:
                scene_data = json.loads(scene_data_match.group(1))
                timeline = scene_data.get('timeline', [])
                # Use a set to avoid duplicates
                seen_texts = set()
                texts = []
                for event in timeline:
                    text = event.get('text', '').strip()
                    if text and text not in seen_texts:
                        seen_texts.add(text)
                        texts.append(text)
                if texts:
                    return ' '.join(texts)
            except json.JSONDecodeError:
                pass
        
        # Fallback: extract unique text from timeline
        text_matches = re.findall(r'"text"\s*:\s*"([^"]+)"', html_content)
        if text_matches:
            # Remove duplicates while preserving order
            seen = set()
            unique_texts = []
            for t in text_matches:
                if t not in seen:
                    seen.add(t)
                    unique_texts.append(t)
            return ' '.join(unique_texts)
        
        return ""
    except Exception as e:
        print(f"   [WARN] Could not extract script: {e}")
        return ""


async def generate_tts_audio(script: str, output_path: Path, target_duration: int) -> bool:
    """Generate TTS audio using Edge-TTS with duration control."""
    try:
        import edge_tts
        
        if not script or len(script.strip()) < 10:
            print(f"   [WARN] Script too short for TTS ({len(script)} chars)")
            return False
        
        # Calculate words per minute to fit target duration
        word_count = len(script.split())
        target_wpm = (word_count / target_duration) * 60
        
        # Adjust rate based on target - aim for slightly less than video duration
        # Normal speech is ~150 WPM, adjust rate to fit
        if target_wpm > 180:
            rate = "+20%"  # Speed up if too many words
        elif target_wpm > 150:
            rate = "+10%"
        elif target_wpm < 100:
            rate = "-10%"  # Slow down if few words
        else:
            rate = "+0%"
        
        print(f"   [INFO] Script: {word_count} words, target: {target_duration}s")
        print(f"   [INFO] Calculated rate: {rate} (targeting ~{target_wpm:.0f} WPM)")
        
        # Use English US Male voice
        voice = "en-US-GuyNeural"
        
        communicate = edge_tts.Communicate(script, voice, rate=rate)
        await communicate.save(str(output_path))
        
        if output_path.exists() and output_path.stat().st_size > 0:
            # Get actual audio duration using ffprobe
            result = subprocess.run([
                'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1', str(output_path)
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                audio_duration = float(result.stdout.strip())
                print(f"   [OK] TTS audio: {audio_duration:.1f}s (target: {target_duration}s)")
                
                # Warn if audio is longer than video
                if audio_duration > target_duration:
                    print(f"   [WARN] Audio ({audio_duration:.1f}s) > Video ({target_duration}s) - will be trimmed")
                
                return True
            return True
        return False
        
    except ImportError:
        print(f"   [ERROR] edge_tts not installed")
        return False
    except Exception as e:
        print(f"   [ERROR] TTS generation failed: {e}")
        return False


async def record_html_to_video(html_path: str, output_path: str, duration: int = 30):
    """Record HTML animation to MP4 video with TTS audio using Playwright"""
    print(f"\n{'='*60}")
    print(f"[RECORDER] HTML TO MP4 RECORDER WITH TTS AUDIO")
    print(f"{'='*60}")
    
    try:
        from playwright.async_api import async_playwright
        print(f"[OK] Playwright imported successfully")
        
        print(f"\n[CONFIG] Recording Configuration:")
        print(f"   Input HTML: {html_path}")
        print(f"   Output MP4: {output_path}")
        print(f"   Duration: {duration}s")
        
        # Step 1: Check for and extract embedded audio
        print(f"\n[STEP 1/6] Checking for embedded audio...")
        audio_path = Path(output_path).parent / f"audio_temp_{Path(output_path).stem}.mp3"
        has_audio = False
        
        if check_html_has_embedded_audio(html_path):
            print(f"   [OK] HTML has embedded TTS audio")
            print(f"\n[STEP 2/6] Extracting embedded audio...")
            has_audio = extract_embedded_audio(html_path, audio_path)
            if has_audio:
                audio_size = audio_path.stat().st_size / 1024
                print(f"   [OK] Extracted audio: {audio_size:.1f} KB")
            else:
                print(f"   [WARN] Failed to extract embedded audio")
        else:
            # Generate TTS only if no embedded audio
            print(f"   [INFO] No embedded audio found")
            script = extract_script_from_html(html_path)
            if script:
                print(f"   [OK] Extracted {len(script)} chars of narration")
                print(f"\n[STEP 2/6] Generating TTS audio...")
                has_audio = await generate_tts_audio(script, audio_path, duration)
                if has_audio:
                    print(f"   [OK] TTS generated")
                else:
                    print(f"   [WARN] TTS failed, video will be silent")
            else:
                print(f"\n[STEP 2/6] Skipping audio (no script)...")
        
        async with async_playwright() as p:
            # Step 3: Launch browser
            print(f"\n[STEP 3/6] Launching Chromium browser...")
            browser = await p.chromium.launch(headless=True)
            print(f"   [OK] Browser launched (headless mode)")
            
            # Step 4: Create recording context with native video capture
            print(f"\n[STEP 4/6] Creating recording context (1920x1080)...")
            video_dir = Path(output_path).parent
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                record_video_dir=str(video_dir),
                record_video_size={'width': 1920, 'height': 1080}
            )
            print(f"   [OK] Recording context created")
            
            page = await context.new_page()
            
            # Load HTML file
            print(f"\n[STEP 5/6] Recording animation for {duration}s...")
            html_file_url = f"file:///{html_path.replace(chr(92), '/')}"
            await page.goto(html_file_url)
            await page.wait_for_load_state('networkidle')
            print(f"   [OK] HTML loaded")
            
            # Wait for animation to auto-start (template has auto-play on load)
            await page.wait_for_timeout(500)
            
            # Manually trigger play as backup
            await page.evaluate("""
                () => {
                    if (typeof playEngine === 'function') {
                        playEngine();
                    }
                    if (typeof window.playAnimation === 'function') {
                        window.playAnimation();
                    }
                    if (window.masterTimeline) {
                        window.masterTimeline.play();
                    }
                }
            """)
            print(f"   [PLAY] Animation triggered")
            
            # Wait for the animation duration
            print(f"   [RECORDING] Recording for {duration}s...")
            await asyncio.sleep(duration + 1)
            print(f"   [OK] Recording complete")
            
            # Close to finalize video
            await page.close()
            video_path = await context.pages[0].video.path() if context.pages else None
            await context.close()
            await browser.close()
        
        # Step 6: Find the WebM and convert to MP4 with TTS
        print(f"\n[STEP 6/6] Converting to MP4 with TTS audio...")
        mp4_output = output_path
        
        # Find the recorded WebM file
        webm_files = list(video_dir.glob("*.webm"))
        if not webm_files:
            print(f"   [ERROR] No WebM video file found!")
            return None
        
        latest_webm = max(webm_files, key=lambda p: p.stat().st_mtime)
        webm_size = latest_webm.stat().st_size / (1024 * 1024)
        print(f"   [VIDEO] Found: {latest_webm.name} ({webm_size:.2f} MB)")
        
        if has_audio and audio_path.exists():
            # Combine video + audio
            print(f"   [AUDIO] Merging video with audio...")
            result = subprocess.run([
                'ffmpeg', '-y',
                '-i', str(latest_webm),
                '-i', str(audio_path),
                '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
                '-c:a', 'aac', '-b:a', '192k',
                '-map', '0:v:0', '-map', '1:a:0',
                '-shortest',
                mp4_output
            ], capture_output=True, text=True)
            audio_path.unlink(missing_ok=True)
        else:
            # No audio, just convert
            print(f"   [SILENT] Converting video (no audio)...")
            result = subprocess.run([
                'ffmpeg', '-y',
                '-i', str(latest_webm),
                '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
                mp4_output
            ], capture_output=True, text=True)
        
        # Clean up WebM
        latest_webm.unlink(missing_ok=True)
        
        if result.returncode == 0 and Path(mp4_output).exists():
            mp4_size = Path(mp4_output).stat().st_size / (1024 * 1024)
            
            # Get final video info
            probe_result = subprocess.run([
                'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1', mp4_output
            ], capture_output=True, text=True)
            final_duration = float(probe_result.stdout.strip()) if probe_result.returncode == 0 else duration
            
            print(f"   [OK] MP4 created: {mp4_output}")
            print(f"   [INFO] Size: {mp4_size:.2f} MB, Duration: {final_duration:.1f}s")
            print(f"   [AUDIO] Audio: {'Included' if has_audio else 'Silent'}")
            
            print(f"\n{'='*60}")
            print(f"[SUCCESS] VIDEO WITH TTS AUDIO COMPLETED SUCCESSFULLY")
            print(f"{'='*60}\n")
            return mp4_output
        else:
            print(f"   [ERROR] FFmpeg failed: {result.stderr[:300]}")
            return None
                
    except ImportError as e:
        print(f"[ERROR] Import error: {e}")
        print("   Install with: pip install playwright edge-tts && playwright install chromium")
        return None
    except Exception as e:
        print(f"[ERROR] Recording failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def main():
    parser = argparse.ArgumentParser(description='Record HTML animation to MP4')
    parser.add_argument('html_path', help='Path to HTML file')
    parser.add_argument('output_path', help='Output MP4 path')
    parser.add_argument('--duration', type=int, default=30, help='Recording duration in seconds')
    
    args = parser.parse_args()
    
    # Run the async recording
    result = asyncio.run(record_html_to_video(args.html_path, args.output_path, args.duration))
    
    if result:
        print(f"SUCCESS:{result}")
        sys.exit(0)
    else:
        print("FAILED")
        sys.exit(1)


if __name__ == '__main__':
    main()
