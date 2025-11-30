"""Test Manim with quadratic function content"""
from utils.manim_generator import ManimGenerator

content = """In mathematics, a quadratic function of a single variable is a function of the form
f(x)=ax²+bx+c, where a≠0. The graph of a quadratic function is a parabola."""

print("Testing Manim with quadratic function content...")
print(f"Content length: {len(content)} characters")

generator = ManimGenerator()

try:
    result = generator.generate_whiteboard_animation(
        text_content=content,
        visual_description="Mathematical diagram showing quadratic function parabola with equation",
        duration=15.0,
        output_path="quadratic_test.mp4",
        scene_number=0
    )
    
    print(f"\n✅ SUCCESS! Video generated: {result}")
    
except Exception as e:
    print(f"\n❌ FAILED: {e}")
    import traceback
    traceback.print_exc()
