"""
Test Replicate API to verify it works before full integration
"""
import os
from dotenv import load_dotenv
import replicate

# Load environment variables
load_dotenv()

def test_replicate_api():
    """Test if Replicate API is working"""
    
    api_key = os.getenv('REPLICATE_API_KEY')
    
    print("=" * 60)
    print("REPLICATE API TEST")
    print("=" * 60)
    
    # Check API key
    print(f"\n1. API Key Check:")
    print(f"   Key exists: {bool(api_key)}")
    print(f"   Key starts with 'r8_': {api_key.startswith('r8_') if api_key else False}")
    print(f"   Key length: {len(api_key) if api_key else 0}")
    
    if not api_key:
        print("\n❌ ERROR: No Replicate API key found in .env file")
        return False
    
    # Set API token
    os.environ["REPLICATE_API_TOKEN"] = api_key
    
    # Test API connection
    print(f"\n2. Testing API Connection:")
    try:
        # Try to list models (simple API call)
        print("   Attempting simple API call...")
        
        # Test with AnimateDiff model
        print(f"\n3. Testing AnimateDiff Model:")
        print("   Generating test video (this may take 30-60 seconds)...")
        
        output = replicate.run(
            "lucataco/animate-diff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48a9f",
            input={
                "prompt": "A beautiful sunset over mountains, smooth camera movement",
                "num_frames": 16,
                "guidance_scale": 7.5,
                "num_inference_steps": 25
            }
        )
        
        print(f"   ✅ SUCCESS! Video generated")
        print(f"   Video URL: {output}")
        
        # Try to download
        print(f"\n4. Testing Video Download:")
        import requests
        response = requests.get(output)
        
        if response.status_code == 200:
            print(f"   ✅ Video downloaded successfully")
            print(f"   Size: {len(response.content)} bytes")
            
            # Save test video
            test_path = "test_replicate_output.mp4"
            with open(test_path, 'wb') as f:
                f.write(response.content)
            print(f"   ✅ Saved to: {test_path}")
            
            print("\n" + "=" * 60)
            print("✅ REPLICATE API IS WORKING!")
            print("=" * 60)
            return True
        else:
            print(f"   ❌ Failed to download video: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print(f"   Error Type: {type(e).__name__}")
        
        import traceback
        print(f"\n   Full Traceback:")
        print(traceback.format_exc())
        
        print("\n" + "=" * 60)
        print("❌ REPLICATE API TEST FAILED")
        print("=" * 60)
        return False

if __name__ == "__main__":
    test_replicate_api()
