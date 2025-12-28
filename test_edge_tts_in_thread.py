"""
Test Edge-TTS in a thread context similar to how it runs in FastAPI
"""
import edge_tts
import asyncio
import threading
from pathlib import Path

def test_edge_tts_in_thread():
    """Test Edge-TTS when called from within a thread (simulating FastAPI context)"""
    
    async def generate_audio():
        text = "This is a test of Edge TTS running in a thread context."
        output_path = Path("test_thread_audio.mp3")
        
        communicate = edge_tts.Communicate(text, "en-US-AndrewMultilingualNeural")
        await communicate.save(str(output_path))
        
        if output_path.exists() and output_path.stat().st_size > 0:
            print(f"✅ SUCCESS: Generated {output_path.stat().st_size} bytes")
            output_path.unlink()
            return True
        else:
            print("❌ FAILED: Empty or missing file")
            return False
    
    # Simulate FastAPI's event loop context
    async def main_loop():
        """Simulate a running event loop (like FastAPI)"""
        print("Main event loop started (simulating FastAPI)...")
        
        # Now try to run Edge-TTS from a sync context within this loop
        exception_box = []
        result_box = []
        
        def thread_target():
            try:
                # Create a fresh event loop in this thread
                new_loop = asyncio.new_event_loop()
                asyncio.set_event_loop(new_loop)
                try:
                    result = new_loop.run_until_complete(generate_audio())
                    result_box.append(result)
                finally:
                    new_loop.close()
            except Exception as e:
                exception_box.append(e)
                print(f"❌ Thread exception: {e}")
        
        thread = threading.Thread(target=thread_target)
        thread.start()
        thread.join(timeout=30)
        
        if thread.is_alive():
            print("❌ Thread timed out")
            return False
        
        if exception_box:
            print(f"❌ Exception occurred: {exception_box[0]}")
            return False
        
        if result_box and result_box[0]:
            print("✅ Thread completed successfully")
            return True
        else:
            print("❌ Thread failed")
            return False
    
    # Run the test
    asyncio.run(main_loop())

if __name__ == "__main__":
    print("=" * 60)
    print("Testing Edge-TTS in thread context (FastAPI simulation)")
    print("=" * 60)
    test_edge_tts_in_thread()
