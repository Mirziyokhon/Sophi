#!/usr/bin/env python3
"""
Test script to verify services can start
"""
import subprocess
import sys
import os
import time

def test_streamlit():
    """Test if Streamlit can start"""
    try:
        print("Testing Streamlit startup...")
        os.chdir(r"d:\Projects\Rusaldo")
        
        # Try to import streamlit first
        import streamlit
        print("✅ Streamlit import successful")
        
        # Try to run a simple command
        result = subprocess.run([sys.executable, "-c", "import streamlit; print('Streamlit works')"], 
                              capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print("✅ Streamlit test passed")
            return True
        else:
            print(f"❌ Streamlit test failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Streamlit test error: {str(e)}")
        return False

def test_frontend():
    """Test if Next.js frontend can start"""
    try:
        print("Testing Next.js frontend startup...")
        os.chdir(r"d:\Projects\Rusaldo\v0-design")
        
        # Check if package.json exists
        if os.path.exists("package.json"):
            print("✅ package.json found")
        else:
            print("❌ package.json not found")
            return False
            
        # Try to check if node_modules exists
        if os.path.exists("node_modules"):
            print("✅ node_modules found")
        else:
            print("⚠️ node_modules not found - may need to install dependencies")
            
        return True
        
    except Exception as e:
        print(f"❌ Frontend test error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Rusaldo Services...")
    print("=" * 50)
    
    streamlit_ok = test_streamlit()
    frontend_ok = test_frontend()
    
    print("=" * 50)
    print(f"Streamlit: {'✅ OK' if streamlit_ok else '❌ FAILED'}")
    print(f"Frontend: {'✅ OK' if frontend_ok else '❌ FAILED'}")
    
    if streamlit_ok and frontend_ok:
        print("\n🎉 Services are ready to start!")
        print("\nTo start manually:")
        print("1. Backend/Streamlit: cd d:\\Projects\\Rusaldo && streamlit run app.py")
        print("2. Frontend: cd d:\\Projects\\Rusaldo\\v0-design && npm run dev")
    else:
        print("\n❌ Some services need attention")
