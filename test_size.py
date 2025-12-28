
import asyncio
import edge_tts
import os

async def test_short():
    communicate = edge_tts.Communicate("Hi", "en-US-AndrewMultilingualNeural")
    await communicate.save("short.mp3")
    print(f"Size of 'Hi': {os.path.getsize('short.mp3')} bytes")

asyncio.run(test_short())
