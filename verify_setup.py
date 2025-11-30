"""
Setup verification script for Rusaldo
Checks all prerequisites and dependencies
"""
import sys
import os
import subprocess
from pathlib import Path


def print_header(text):
    """Print formatted header"""
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)


def check_python_version():
    """Check Python version"""
    print("\n🐍 Checking Python version...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 9:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} - OK")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} - Need 3.9+")
        return False


def check_package(package_name):
    """Check if Python package is installed"""
    try:
        __import__(package_name)
        print(f"✅ {package_name} - Installed")
        return True
    except ImportError:
        print(f"❌ {package_name} - Not installed")
        return False


def check_python_packages():
    """Check required Python packages"""
    print("\n📦 Checking Python packages...")
    
    packages = [
        'streamlit',
        'openai',
        'PyPDF2',
        'pytesseract',
        'PIL',  # Pillow
        'bs4',  # beautifulsoup4
        'moviepy',
        'elevenlabs',
        'requests',
        'validators',
        'dotenv'
    ]
    
    results = []
    for package in packages:
        results.append(check_package(package))
    
    return all(results)


def check_system_command(command, name):
    """Check if system command is available"""
    try:
        result = subprocess.run(
            [command, '--version'],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            version = result.stdout.split('\n')[0]
            print(f"✅ {name} - Installed ({version})")
            return True
        else:
            print(f"❌ {name} - Not found")
            return False
    except (subprocess.TimeoutExpired, FileNotFoundError, Exception):
        print(f"❌ {name} - Not found")
        return False


def check_system_dependencies():
    """Check system dependencies"""
    print("\n🔧 Checking system dependencies...")
    
    tesseract_ok = check_system_command('tesseract', 'Tesseract OCR')
    ffmpeg_ok = check_system_command('ffmpeg', 'FFmpeg')
    
    return tesseract_ok and ffmpeg_ok


def check_env_file():
    """Check .env file configuration"""
    print("\n🔑 Checking environment configuration...")
    
    env_file = Path('.env')
    env_example = Path('.env.example')
    
    if not env_file.exists():
        print("❌ .env file not found")
        if env_example.exists():
            print("💡 Copy .env.example to .env and add your API keys")
        return False
    
    print("✅ .env file exists")
    
    # Check for API keys
    with open(env_file, 'r') as f:
        content = f.read()
    
    keys_to_check = {
        'OPENAI_API_KEY': 'Required',
        'ELEVENLABS_API_KEY': 'Optional',
        'PIKA_API_KEY': 'Optional',
        'RUNWAY_API_KEY': 'Optional'
    }
    
    for key, status in keys_to_check.items():
        if key in content and 'your_' not in content.split(key)[1].split('\n')[0]:
            print(f"✅ {key} - Configured ({status})")
        else:
            if status == 'Required':
                print(f"❌ {key} - Not configured ({status})")
            else:
                print(f"⚠️  {key} - Not configured ({status})")
    
    return True


def check_directories():
    """Check required directories"""
    print("\n📁 Checking directory structure...")
    
    directories = [
        'uploads',
        'generated_videos',
        'temp',
        'utils'
    ]
    
    all_ok = True
    for directory in directories:
        path = Path(directory)
        if path.exists():
            print(f"✅ {directory}/ - Exists")
        else:
            print(f"⚠️  {directory}/ - Will be created on first run")
    
    return True


def check_core_files():
    """Check core application files"""
    print("\n📄 Checking core files...")
    
    files = [
        'app.py',
        'config.py',
        'requirements.txt',
        'utils/text_extractor.py',
        'utils/ai_processor.py',
        'utils/video_generator.py'
    ]
    
    all_ok = True
    for file in files:
        path = Path(file)
        if path.exists():
            print(f"✅ {file} - Exists")
        else:
            print(f"❌ {file} - Missing")
            all_ok = False
    
    return all_ok


def main():
    """Main verification function"""
    print_header("🚀 Rusaldo Setup Verification")
    
    print("\nThis script will verify your Rusaldo installation.")
    print("Please wait while we check all prerequisites...\n")
    
    results = {
        'Python Version': check_python_version(),
        'Python Packages': check_python_packages(),
        'System Dependencies': check_system_dependencies(),
        'Environment Config': check_env_file(),
        'Directories': check_directories(),
        'Core Files': check_core_files()
    }
    
    print_header("📊 Verification Summary")
    
    all_passed = True
    for check, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {check}")
        if not passed:
            all_passed = False
    
    print("\n" + "=" * 60)
    
    if all_passed:
        print("\n🎉 SUCCESS! Your Rusaldo installation is ready!")
        print("\nNext steps:")
        print("1. Make sure your .env file has valid API keys")
        print("2. Run the application: streamlit run app.py")
        print("3. Or use the quick start script: run.bat (Windows) or ./run.sh (Mac/Linux)")
    else:
        print("\n⚠️  INCOMPLETE SETUP")
        print("\nPlease fix the issues above before running the application.")
        print("Refer to SETUP.md for detailed installation instructions.")
    
    print("\n" + "=" * 60 + "\n")
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
