"""
Test Hugging Face API to see if it's working
"""
import os
from dotenv import load_dotenv
import requests

load_dotenv()

def test_huggingface_api():
    """Test Hugging Face API"""
    
    api_key = os.getenv('HUGGINGFACE_API_KEY')
    
    print("=" * 60)
    print("HUGGING FACE API TEST")
    print("=" * 60)
    
    print(f"\n1. API Key Check:")
    print(f"   Key exists: {bool(api_key)}")
    print(f"   Key length: {len(api_key) if api_key else 0}")
    
    if not api_key:
        print("\n❌ ERROR: No Hugging Face API key found")
        return False
    
    # Test API with AnimateDiff
    print(f"\n2. Testing AnimateDiff Model:")
    
    API_URL = "https://api-inference.huggingface.co/models/guoyww/animatediff"
    
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    payload = {
        "inputs": "A beautiful sunset over mountains, smooth camera movement"
    }
    
    try:
        print("   Sending request to Hugging Face...")
        response = requests.post(API_URL, headers=headers, json=payload)
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print(f"   ✅ SUCCESS! Video generated")
            print(f"   Response size: {len(response.content)} bytes")
            
            # Save test video
            with open("test_huggingface_output.mp4", "wb") as f:
                f.write(response.content)
            print(f"   ✅ Saved to: test_huggingface_output.mp4")
            
            print("\n" + "=" * 60)
            print("✅ HUGGING FACE API IS WORKING!")
            print("=" * 60)
            return True
            
        else:
            print(f"\n❌ ERROR: {response.status_code}")
            print(f"   Response: {response.text[:500]}")
            
            if response.status_code == 401:
                print("\n   → Invalid API key")
            elif response.status_code == 503:
                print("\n   → Model is loading, try again in a minute")
            
            return False
            
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return False

if __name__ == "__main__":
    test_huggingface_api()
