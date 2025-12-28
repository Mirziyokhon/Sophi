
import asyncio
import os
from pathlib import Path
import edge_tts
from utils.sketch_animator import SketchAnimator

async def test_edge_tts():
    print("Testing Edge TTS direct...")
    text = "Hello, this is a test of the emergency broadcast system."
    voice = "en-US-AndrewMultilingualNeural"
    output = "test_tts.mp3"
    
    try:
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(output)
        print(f"Direct TTS success: {os.path.getsize(output)} bytes")
    except Exception as e:
        print(f"Direct TTS failed: {e}")

def test_sketch_animator():
    print("\nTesting SketchAnimator.generate_narration...")
    animator = SketchAnimator(temp_root=Path("temp_test"))
    output = Path("temp_test/narration.mp3")
    
    try:
        animator.generate_narration("Testing the sketch animator wrapper.", output)
        if output.exists():
             print(f"Wrapper TTS success: {output.stat().st_size} bytes")
        else:
             print("Wrapper TTS failed: File not found")
    except Exception as e:
        print(f"Wrapper TTS failed with error: {e}")

if __name__ == "__main__":
    asyncio.run(test_edge_tts())
    test_sketch_animator()
