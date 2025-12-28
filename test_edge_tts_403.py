import edge_tts
import asyncio
from pathlib import Path

async def test_voice(voice_name, text="Hello, this is a test of the text to speech system."):
    """Test if a specific voice works without 403 errors"""
    output_path = Path(f"test_{voice_name.replace('-', '_')}.mp3")
    
    try:
        print(f"Testing {voice_name}...")
        communicate = edge_tts.Communicate(text, voice_name)
        await communicate.save(str(output_path))
        
        if output_path.exists() and output_path.stat().st_size > 0:
            print(f"✅ {voice_name} - SUCCESS (file size: {output_path.stat().st_size} bytes)")
            output_path.unlink()  # Clean up
            return True
        else:
            print(f"❌ {voice_name} - FAILED (empty file)")
            return False
    except Exception as e:
        print(f"❌ {voice_name} - ERROR: {str(e)[:100]}")
        return False

async def main():
    # Test the current default voice
    print("=" * 60)
    print("Testing current default voice:")
    print("=" * 60)
    await test_voice("en-US-AndrewMultilingualNeural")
    
    print("\n" + "=" * 60)
    print("Testing alternative voices:")
    print("=" * 60)
    
    # Test some alternative voices
    voices_to_test = [
        "en-US-AriaNeural",
        "en-US-GuyNeural",
        "en-US-JennyNeural",
        "en-US-AndrewNeural",
    ]
    
    for voice in voices_to_test:
        await test_voice(voice)
        await asyncio.sleep(1)  # Small delay between requests

asyncio.run(main())
