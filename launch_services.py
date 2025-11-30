#!/usr/bin/env python3
"""
Launch Rusaldo Services - Python launcher
"""
import subprocess
import sys
import os
import time
import webbrowser
from pathlib import Path

def launch_streamlit():
    """Launch Streamlit backend"""
    print("🚀 Starting Streamlit Backend...")
    
    # Change to the correct directory
    os.chdir(r"d:\Projects\Rusaldo")
    
    # Check if app.py exists
    if not os.path.exists("app.py"):
        print("❌ app.py not found!")
        return False
    
    # Launch Streamlit
    try:
        cmd = [sys.executable, "-m", "streamlit", "run", "app.py", "--server.port", "8501", "--server.headless", "true"]
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Wait a bit and check if it started
        time.sleep(5)
        
        if process.poll() is None:  # Process is still running
            print("✅ Streamlit started successfully!")
            print("📍 URL: http://localhost:8501")
            return True
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Streamlit failed to start:")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error starting Streamlit: {str(e)}")
        return False

def launch_frontend():
    """Launch Next.js frontend"""
    print("🚀 Starting Next.js Frontend...")
    
    # Change to the frontend directory
    frontend_dir = r"d:\Projects\Rusaldo\v0-design"
    os.chdir(frontend_dir)
    
    # Check if package.json exists
    if not os.path.exists("package.json"):
        print("❌ package.json not found!")
        return False
    
    # Check node_modules
    if not os.path.exists("node_modules"):
        print("⚠️ node_modules not found. Installing dependencies...")
        try:
            subprocess.run(["npm", "install"], check=True, capture_output=True)
            print("✅ Dependencies installed!")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install dependencies: {e}")
            return False
    
    # Launch Next.js
    try:
        cmd = ["npm", "run", "dev"]
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Wait a bit and check if it started
        time.sleep(8)
        
        if process.poll() is None:  # Process is still running
            print("✅ Next.js started successfully!")
            print("📍 URL: http://localhost:3000")
            return True
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Next.js failed to start:")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error starting Next.js: {str(e)}")
        return False

def main():
    """Main launcher function"""
    print("=" * 60)
    print("🎬 RUSALDO SERVICES LAUNCHER")
    print("=" * 60)
    print()
    
    # Launch Streamlit
    streamlit_ok = launch_streamlit()
    print()
    
    # Launch Frontend
    frontend_ok = launch_frontend()
    print()
    
    # Summary
    print("=" * 60)
    print("📊 LAUNCH SUMMARY")
    print("=" * 60)
    print(f"Streamlit Backend: {'✅ RUNNING' if streamlit_ok else '❌ FAILED'}")
    print(f"Next.js Frontend:  {'✅ RUNNING' if frontend_ok else '❌ FAILED'}")
    print()
    
    if streamlit_ok or frontend_ok:
        print("🌐 Available URLs:")
        if streamlit_ok:
            print("   • Streamlit: http://localhost:8501")
        if frontend_ok:
            print("   • Frontend:  http://localhost:3000")
        print()
        
        # Ask if user wants to open browsers
        try:
            if streamlit_ok:
                open_browser = input("Open Streamlit in browser? (y/n): ").lower().strip()
                if open_browser in ['y', 'yes']:
                    webbrowser.open("http://localhost:8501")
            
            if frontend_ok:
                open_browser = input("Open Frontend in browser? (y/n): ").lower().strip()
                if open_browser in ['y', 'yes']:
                    webbrowser.open("http://localhost:3000")
        except KeyboardInterrupt:
            pass
        
        print("\n🎉 Services are running! Press Ctrl+C to stop.")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n👋 Shutting down...")
    
    else:
        print("❌ No services started successfully.")
        print("\n🔧 Troubleshooting:")
        print("   • Check Python installation and requirements")
        print("   • Check Node.js installation")
        print("   • Verify ports 8501 and 3000 are available")
        print("   • Check .env file configuration")

if __name__ == "__main__":
    main()
