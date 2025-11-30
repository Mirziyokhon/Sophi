import subprocess
import sys
import os
import time

def start_backend():
    """Start Streamlit backend"""
    print("Starting Streamlit backend...")
    backend_process = subprocess.Popen([
        sys.executable, "-m", "streamlit", "run", "app.py", 
        "--server.port", "8501", "--server.headless", "true"
    ], cwd="d:\\Projects\\Rusaldo")
    return backend_process

def start_frontend():
    """Start Next.js frontend"""
    print("Starting Next.js frontend...")
    frontend_process = subprocess.Popen([
        "npm", "run", "dev"
    ], cwd="d:\\Projects\\Rusaldo\\v0-design")
    return frontend_process

if __name__ == "__main__":
    try:
        backend = start_backend()
        time.sleep(3)
        frontend = start_frontend()
        
        print("Services started!")
        print("Backend: http://localhost:8501")
        print("Frontend: http://localhost:3000")
        
        # Keep the script running
        backend.wait()
        frontend.wait()
        
    except KeyboardInterrupt:
        print("Stopping services...")
        backend.terminate()
        frontend.terminate()
