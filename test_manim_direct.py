"""Direct test of Manim generator to isolate the issue"""
from utils.manim_generator import ManimGenerator
import os

print("="*70)
print("DIRECT MANIM GENERATOR TEST")
print("="*70)

# Create generator
generator = ManimGenerator()

# Test parameters
text_content = "Hello World! This is a test."
visual_description = "Simple diagram with circles"
duration = 10.0
output_path = "test_output.mp4"
scene_number = 0

print(f"\n📋 Test Parameters:")
print(f"   text_content: {text_content}")
print(f"   visual_description: {visual_description}")
print(f"   duration: {duration}")
print(f"   output_path: {output_path}")
print(f"   scene_number: {scene_number}")

try:
    print(f"\n🎬 Calling generate_whiteboard_animation...")
    result = generator.generate_whiteboard_animation(
        text_content=text_content,
        visual_description=visual_description,
        duration=duration,
        output_path=output_path,
        scene_number=scene_number
    )
    
    print(f"\n✅ SUCCESS!")
    print(f"   Video generated: {result}")
    print(f"   File exists: {os.path.exists(result)}")
    if os.path.exists(result):
        print(f"   File size: {os.path.getsize(result)} bytes")
    
except Exception as e:
    print(f"\n❌ FAILED!")
    print(f"   Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*70)
