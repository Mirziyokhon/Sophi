import edge_tts
import asyncio

async def list_english_voices():
    voices = await edge_tts.list_voices()
    print("Available English (US) voices:\n")
    for voice in voices:
        if voice["Locale"].startswith("en-US"):
            print(f"Name: {voice['ShortName']}")
            print(f"  Gender: {voice['Gender']}")
            print(f"  Locale: {voice['Locale']}")
            print()

asyncio.run(list_english_voices())
