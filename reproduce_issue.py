
import asyncio
import threading
from pathlib import Path
import os
from utils.sketch_animator import SketchAnimator

async def main_loop_simulation():
    print("Simulating running event loop...")
    animator = SketchAnimator(temp_root=Path("temp_reproduce"))
    output = Path("temp_reproduce/reproduce_narration.mp3")
    
    # Call the synchronous method which should handle the async bridging
    print("Calling generate_narration from inside a running loop...")
    animator.generate_narration("This is a test of the loop handling.", output)
    
    if output.exists():
        size = output.stat().st_size
        print(f"File generated. Size: {size} bytes")
        if size < 100:
            print("WARNING: File suspiciously small!")
    else:
        print("ERROR: File not generated!")

    # Verify we can read it with MoviePy immediately
    try:
        from moviepy.editor import AudioFileClip
        with AudioFileClip(str(output)) as clip:
            print(f"MoviePy duration read: {clip.duration}")
    except Exception as e:
        print(f"MoviePy failed immediately: {e}")

def run_in_loop():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(main_loop_simulation())
    loop.close()

if __name__ == "__main__":
    run_in_loop()
