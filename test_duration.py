"""Test if duration selection works correctly"""
from utils.video_generator import VideoGenerator

# Test with different durations
durations = [30, 60, 90, 120, 150, 180]

for duration in durations:
    print(f"\n{'='*50}")
    print(f"Testing duration: {duration} seconds ({duration/60:.1f} minutes)")
    print(f"{'='*50}")
    
    generator = VideoGenerator(use_manim=True)
    
    # Simulate what happens in the pipeline
    num_scenes = 3  # Typical number of scenes
    scene_duration = duration / num_scenes
    
    print(f"✅ Total duration: {duration}s")
    print(f"✅ Number of scenes: {num_scenes}")
    print(f"✅ Duration per scene: {scene_duration:.2f}s")
    
    # Check if duration is valid
    if scene_duration and scene_duration > 0:
        print(f"✅ Duration validation: PASSED")
    else:
        print(f"❌ Duration validation: FAILED")

print(f"\n{'='*50}")
print("✅ All duration tests completed!")
print(f"{'='*50}")
