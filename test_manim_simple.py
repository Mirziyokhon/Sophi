"""Test Manim with a simple scene"""
from utils.manim_generator import ManimGenerator
import os

print("="*60)
print("Testing Manim Generator")
print("="*60)

# Create generator
generator = ManimGenerator()

# Test with safe text
test_cases = [
    ("Hello World", "Simple diagram", 1),
    ("Educational content with quotes 'test'", "Flow chart", 2),
    ('Text with "double quotes"', "List of points", 3),
]

for text, visual, scene_num in test_cases:
    print(f"\n📝 Test {scene_num}: {text[:30]}...")
    try:
        # Generate script
        script_path = generator.generate_scene_script(text, visual, scene_num)
        print(f"✅ Script generated: {script_path}")
        
        # Check if script is valid Python
        with open(script_path, 'r') as f:
            script_content = f.read()
            compile(script_content, script_path, 'exec')
            print(f"✅ Script is valid Python!")
            
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n" + "="*60)
print("Test complete!")
print("="*60)
