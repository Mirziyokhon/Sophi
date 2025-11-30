"""
Simple health check for Railway deployment
"""
import sys
import os

def check_health():
    """Basic health check for Railway"""
    try:
        # Check if we can import main dependencies
        import streamlit as st
        import config
        
        # Check basic directories
        required_dirs = ['uploads', 'videos', 'temp']
        for dir_name in required_dirs:
            os.makedirs(dir_name, exist_ok=True)
        
        # Check API keys
        api_keys = {
            'GEMINI_API_KEY': config.GEMINI_API_KEY,
            'ELEVENLABS_API_KEY': config.ELEVENLABS_API_KEY,
        }
        
        missing_keys = [key for key, value in api_keys.items() if not value]
        
        if missing_keys:
            return False, f"Missing API keys: {missing_keys}"
        
        return True, "OK"
        
    except Exception as e:
        return False, f"Health check failed: {str(e)}"

if __name__ == "__main__":
    healthy, message = check_health()
    print(f"Health: {'OK' if healthy else 'FAILED'} - {message}")
    sys.exit(0 if healthy else 1)
