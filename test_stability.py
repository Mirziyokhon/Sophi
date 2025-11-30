"""
Test Stability.ai API to see why it's failing
"""
import os
from dotenv import load_dotenv
import requests

load_dotenv()

def test_stability_api():
    """Test Stability.ai API"""
    
    api_key = os.getenv('STABILITY_API_KEY')
    
    print("=" * 60)
    print("STABILITY.AI API TEST")
    print("=" * 60)
    
    print(f"\n1. API Key Check:")
    print(f"   Key exists: {bool(api_key)}")
    print(f"   Key length: {len(api_key) if api_key else 0}")
    
    if not api_key:
        print("\n❌ ERROR: No Stability API key found")
        return False
    
    # Test API with simple image generation
    print(f"\n2. Testing Image Generation:")
    
    url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "text_prompts": [
            {
                "text": "A beautiful sunset over mountains",
                "weight": 1
            }
        ],
        "cfg_scale": 7,
        "height": 512,
        "width": 512,
        "samples": 1,
        "steps": 30,
    }
    
    try:
        print("   Sending request to Stability.ai...")
        response = requests.post(url, headers=headers, json=payload)
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print(f"   ✅ SUCCESS! Image generated")
            
            # Save test image
            data = response.json()
            import base64
            
            for i, image in enumerate(data["artifacts"]):
                with open(f"test_stability_output_{i}.png", "wb") as f:
                    f.write(base64.b64decode(image["base64"]))
                print(f"   ✅ Saved to: test_stability_output_{i}.png")
            
            print("\n" + "=" * 60)
            print("✅ STABILITY.AI API IS WORKING!")
            print("=" * 60)
            return True
            
        else:
            print(f"\n❌ ERROR: {response.status_code}")
            print(f"   Response: {response.text}")
            
            if response.status_code == 401:
                print("\n   → Invalid API key")
            elif response.status_code == 402:
                print("\n   → Insufficient credits")
            elif response.status_code == 403:
                print("\n   → Access forbidden")
            
            return False
            
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return False

if __name__ == "__main__":
    test_stability_api()
