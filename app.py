"""
Rusaldo (Learnify MVP) - Main Streamlit Application
Transform learning materials into personalized animated videos
"""
import streamlit as st
import os
from pathlib import Path
import time
from datetime import datetime
import json
import re

import config
from utils.text_extractor import TextExtractor
from utils.ai_processor import AIProcessor
from utils.video_generator import VideoGenerator
from utils.sketch_animator import SketchAnimator
from utils.video_player import render_custom_video_player


SKETCH_STYLE_LABEL = "✏️ Sketch Explainer (Free)"
MANIM_STYLE_LABEL = "🎬 Manim Whiteboard (Default)"
ANIMATION_STYLE_OPTIONS = [SKETCH_STYLE_LABEL, MANIM_STYLE_LABEL]


# Page configuration
st.set_page_config(
    page_title="Rusaldo - AI Learning Videos",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        background: linear-gradient(120deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        text-align: center;
        color: #666;
        font-size: 1.2rem;
        margin-bottom: 2rem;
    }
    .feature-box {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 10px;
        border-left: 4px solid #667eea;
        margin: 1rem 0;
    }
    .success-box {
        background: #d4edda;
        padding: 1rem;
        border-radius: 5px;
        border-left: 4px solid #28a745;
        margin: 1rem 0;
    }
    .stButton>button {
        width: 100%;
        background: linear-gradient(120deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: bold;
        border: none;
        padding: 0.75rem;
        border-radius: 5px;
    }
    .stButton>button:hover {
        opacity: 0.9;
    }
</style>
""", unsafe_allow_html=True)


# Initialize session state
if 'user_profile' not in st.session_state:
    st.session_state.user_profile = None
if 'generated_videos' not in st.session_state:
    st.session_state.generated_videos = []
if 'processing' not in st.session_state:
    st.session_state.processing = False


def save_uploaded_file(uploaded_file) -> str:
    """Save uploaded file and return path"""
    file_path = os.path.join(config.UPLOAD_DIR, uploaded_file.name)
    with open(file_path, "wb") as f:
        f.write(uploaded_file.getbuffer())
    return file_path


def load_video_history():
    """Load video generation history"""
    history_file = os.path.join(config.VIDEO_OUTPUT_DIR, "history.json")
    if os.path.exists(history_file):
        with open(history_file, 'r') as f:
            return json.load(f)
    return []


def save_video_history(video_data):
    """Save video to history"""
    history_file = os.path.join(config.VIDEO_OUTPUT_DIR, "history.json")
    history = load_video_history()
    history.append(video_data)
    with open(history_file, 'w') as f:
        json.dump(history, f, indent=2)


def main():
    # Header
    st.markdown('<h1 class="main-header">📚 Rusaldo</h1>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Transform Learning Materials into Personalized Animated Videos</p>', unsafe_allow_html=True)
    
    # Sidebar
    with st.sidebar:
        st.image("https://via.placeholder.com/300x100/667eea/ffffff?text=Rusaldo", width=300)
        st.markdown("---")
        
        page = st.radio(
            "Navigation",
            ["🎬 Create Video", "📚 My Library", "⚙️ Settings"],
            label_visibility="collapsed"
        )
        
        st.markdown("---")
        st.markdown("### 📊 Quick Stats")
        videos_count = len(load_video_history())
        st.metric("Videos Generated", videos_count)
        
        st.markdown("---")
        st.markdown("### 🎯 Features")
        st.markdown("""
        - 📄 PDF Upload
        - 📸 Photo OCR
        - 🌐 Web Scraping
        - ✍️ Text Input
        - 🎨 AI Personalization
        - 🎥 Animated Videos
        """)
    
    # Main content
    if page == "🎬 Create Video":
        create_video_page()
    elif page == "📚 My Library":
        library_page()
    elif page == "⚙️ Settings":
        settings_page()


def create_video_page():
    """Main video creation page"""
    
    st.markdown("## 🎬 Create Your Personalized Learning Video")
    
    # Check API keys
    if not config.OPENAI_API_KEY:
        st.error("⚠️ OpenAI API key not configured. Please add it to your .env file.")
        st.code("OPENAI_API_KEY=your_key_here")
        return
    
    # Step 1: Upload Content
    st.markdown("### Step 1: Upload Your Learning Material")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        content_type = st.selectbox(
            "Choose content type:",
            ["📄 PDF Document", "📸 Photo/Image", "🌐 Web Link", "✍️ Plain Text"]
        )
    
    extracted_text = None
    word_count = 0
    
    if content_type == "📄 PDF Document":
        uploaded_file = st.file_uploader("Upload PDF", type=['pdf'])
        if uploaded_file:
            with st.spinner("Extracting text from PDF..."):
                file_path = save_uploaded_file(uploaded_file)
                try:
                    extracted_text, word_count = TextExtractor.extract('pdf', file_path)
                    st.success(f"✅ Extracted {word_count} words from PDF")
                except Exception as e:
                    st.error(f"Error: {str(e)}")
    
    elif content_type == "📸 Photo/Image":
        uploaded_file = st.file_uploader("Upload Image", type=['jpg', 'jpeg', 'png', 'bmp'])
        if uploaded_file:
            st.image(uploaded_file, caption="Uploaded Image")
            with st.spinner("Extracting text from image using OCR..."):
                file_path = save_uploaded_file(uploaded_file)
                try:
                    extracted_text, word_count = TextExtractor.extract('image', file_path)
                    st.success(f"✅ Extracted {word_count} words from image")
                except Exception as e:
                    st.error(f"Error: {str(e)}")
                    st.info("💡 Make sure Tesseract OCR is installed on your system")
    
    elif content_type == "🌐 Web Link":
        url = st.text_input("Enter web page URL:", placeholder="https://example.com/article")
        if url and st.button("Extract Content"):
            with st.spinner("Extracting content from web page..."):
                try:
                    extracted_text, word_count = TextExtractor.extract('url', url)
                    st.success(f"✅ Extracted {word_count} words from web page")
                except Exception as e:
                    st.error(f"Error: {str(e)}")
    
    elif content_type == "✍️ Plain Text":
        extracted_text = st.text_area(
            "Paste your learning content:",
            height=200,
            placeholder="Paste your notes, definitions, or study materials here..."
        )
        if extracted_text:
            word_count = len(extracted_text.split())
            if word_count > config.MAX_CONTENT_LENGTH:
                st.error(f"⚠️ Content exceeds maximum length of {config.MAX_CONTENT_LENGTH} words (found {word_count} words)")
                extracted_text = None
            else:
                st.success(f"✅ {word_count} words ready for processing")
    
    # Show preview of extracted text
    if extracted_text:
        with st.expander("📄 Preview Extracted Content"):
            st.text_area("Content Preview", extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text, height=150, disabled=True)
        
        st.markdown("---")
        
        # Step 2: Personalization
        st.markdown("### Step 2: Personalize Your Learning")
        
        col1, col2 = st.columns([1, 1])
        
        with col1:
            interest_type = st.radio(
                "How would you like to personalize?",
                ["🎯 Choose from presets", "✍️ Describe your interests"]
            )
        
        interest_description = None
        
        if interest_type == "🎯 Choose from presets":
            interest_description = st.selectbox(
                "Select your interest:",
                config.PRESET_INTERESTS
            )
        else:
            interest_description = st.text_area(
                "Describe your interests:",
                placeholder="Example: I'm passionate about basketball—the strategy, teamwork, and athletic performance...",
                height=100
            )
        
        if interest_description:
            st.markdown("---")
            
            # Step 3: Video Settings
            st.markdown("### Step 3: Choose Video Settings")
            
            duration_option = st.select_slider(
                "Video length:",
                options=list(config.VIDEO_DURATIONS.keys()),
                value="0.5 minutes"
            )
            duration_seconds = config.VIDEO_DURATIONS[duration_option]

            animation_style = st.selectbox(
                "Animation style:",
                ANIMATION_STYLE_OPTIONS,
                index=0,
            )
            
            st.markdown("---")
            
            # Step 4: Generate Video
            st.markdown("### Step 4: Generate Your Video")
            
            if st.button("🎬 Generate Personalized Video", type="primary"):
                generate_video(
                    extracted_text,
                    interest_description,
                    duration_seconds,
                    duration_option,
                    animation_style,
                )


def generate_video(
    text: str,
    interest: str,
    duration: int,
    duration_label: str,
    animation_style: str,
):
    """Generate personalized video using the selected animation style."""
    
    progress_bar = st.progress(0)
    status_text = st.empty()
    
    try:
        # Initialize processors
        ai_processor = AIProcessor()
        is_sketch = animation_style == SKETCH_STYLE_LABEL
        sketch_animator = SketchAnimator() if is_sketch else None
        video_generator = VideoGenerator(use_manim=True) if not is_sketch else None
        if is_sketch:
            st.info("✏️ Using free Sketch Explainer pipeline (Pollinations.ai + Edge-TTS)")
        else:
            st.info("🎬 Using Manim whiteboard animation pipeline")
        
        # Step 1: Enhance interest profile
        status_text.text("🧠 Enhancing your interest profile...")
        progress_bar.progress(10)
        
        enhanced_profile = ai_processor.enhance_interest_profile(interest)
        
        with st.expander("📋 Your Enhanced Learning Profile"):
            st.write(enhanced_profile)
        
        time.sleep(0.5)
        
        # Step 2: Process content
        status_text.text("📝 Analyzing and summarizing content...")
        progress_bar.progress(30)
        
        processed_content = ai_processor.process_content(text, enhanced_profile, duration)
        
        with st.expander("📄 Content Summary"):
            st.write("**Summary:**", processed_content['summary'])
            st.write("**Key Points:**")
            for point in processed_content['key_points']:
                st.write(f"- {point}")
            st.write("**Takeaway:**", processed_content['takeaway'])
        
        time.sleep(0.5)
        
        # Step 3: Generate script
        status_text.text("✍️ Creating personalized script...")
        progress_bar.progress(50)
        
        with st.expander("🎬 Video Script"):
            st.write(processed_content['script'])
        
        time.sleep(0.5)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"rusaldo_video_{timestamp}.mp4"
        
        if is_sketch:
            status_text.text("🖌️ Generating Pollinations sketch scenes (this may take a few minutes)...")
            progress_bar.progress(70)
            scene_plan = _prepare_sketch_scene_plan(processed_content)
            video_result = sketch_animator.generate_video_from_scenes(
                scene_plan,
                output_filename=output_filename,
            )
            video_path = video_result['video_path']
            subtitle_path = video_result['subtitle_path']
        else:
            status_text.text("✍️ Generating Manim whiteboard animation (this may take 1-3 minutes)...")
            progress_bar.progress(70)
            
            # Generate voiceover first (needed for both methods)
            from utils.video_generator import VideoGenerator as VG
            temp_vg = VG()
            temp_dir = Path(config.TEMP_DIR) / f"video_{int(time.time())}"
            temp_dir.mkdir(parents=True, exist_ok=True)
            audio_path = str(temp_dir / "voiceover.mp3")
            temp_vg.generate_voiceover(processed_content['script'], audio_path)
            
            video_result = video_generator.generate_complete_video(
                processed_content['script'],
                processed_content['visual_prompts'],
                duration,
                output_filename,
                processed_content.get('scene_details'),
            )
            video_path = video_result['video_path']
            subtitle_path = video_result['subtitle_path']
        
        if hasattr(video_path, "__fspath__"):
            video_path = str(video_path)
        
        progress_bar.progress(100)
        status_text.text("✅ Video generated successfully!")
        
        # Save to history
        video_data = {
            'filename': output_filename,
            'path': video_path,
            'subtitle_path': subtitle_path,
            'timestamp': timestamp,
            'duration': duration_label,
            'interest': interest,
            'word_count': len(text.split()),
            'animation_style': animation_style,
        }
        save_video_history(video_data)
        
        # Display video with custom player
        st.markdown("---")
        st.markdown("## 🎉 Your Personalized Learning Video is Ready!")
        
        if os.path.exists(video_path):
            # Use custom video player with subtitles
            render_custom_video_player(
                video_path=video_path,
                subtitle_path=subtitle_path if os.path.exists(subtitle_path) else None,
                key=f"video_{timestamp}"
            )
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                with open(video_path, 'rb') as f:
                    st.download_button(
                        "⬇️ Download Video",
                        f,
                        file_name=output_filename,
                        mime="video/mp4"
                    )
            
            with col2:
                if st.button("🔄 Generate Another"):
                    st.rerun()
            
            with col3:
                st.button("📚 View Library")
        
        st.success("🎊 Video saved to your library!")
        
    except Exception as e:
        st.error(f"❌ Error generating video: {str(e)}")
        st.info("💡 Make sure all API keys are configured correctly in your .env file")


def library_page():
    """Video library page"""
    
    st.markdown("## 📚 My Video Library")
    
    history = load_video_history()
    
    if not history:
        st.info("📭 No videos yet. Create your first personalized learning video!")
        return
    
    st.markdown(f"### You have {len(history)} video(s)")
    
    # Display videos in reverse chronological order
    for i, video in enumerate(reversed(history)):
        with st.expander(f"🎥 Video {len(history) - i} - {video.get('duration', 'N/A')} - {video.get('timestamp', 'N/A')}"):
            col1, col2 = st.columns([2, 1])
            
            with col1:
                st.write(f"**Interest:** {video.get('interest', 'N/A')}")
                st.write(f"**Duration:** {video.get('duration', 'N/A')}")
                st.write(f"**Content Length:** {video.get('word_count', 'N/A')} words")
                st.write(f"**Animation:** {video.get('animation_style', 'Unknown')}")
                st.write(f"**Created:** {video.get('timestamp', 'N/A')}")
            
            with col2:
                video_path = video.get('path', '')
                if os.path.exists(video_path):
                    with open(video_path, 'rb') as f:
                        st.download_button(
                            "⬇️ Download",
                            f,
                            file_name=video.get('filename', 'video.mp4'),
                            mime="video/mp4",
                            key=f"download_{i}"
                        )
            
            # Show video with custom player
            video_path = video.get('path', '')
            subtitle_path = video.get('subtitle_path', '')
            if os.path.exists(video_path):
                render_custom_video_player(
                    video_path=video_path,
                    subtitle_path=subtitle_path if os.path.exists(subtitle_path) else None,
                    key=f"library_video_{i}"
                )


def settings_page():
    """Settings and configuration page"""
    
    st.markdown("## ⚙️ Settings & Configuration")
    
    st.markdown("### 🔑 API Configuration")
    
    st.info("💡 Configure your API keys in the `.env` file in the project root directory.")
    
    # Check API key status
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("#### Core APIs")
        st.write("✅ Gemini API" if config.GEMINI_API_KEY else "❌ Gemini API (Required)")
        st.write("✅ ElevenLabs API" if config.ELEVENLABS_API_KEY else "⚠️ ElevenLabs API (Voice)")
    
    with col2:
        st.markdown("#### Visual APIs")
        st.write("✅ Stability.ai API" if config.STABILITY_API_KEY else "⚠️ Stability.ai API (Visuals)")
        st.write("✅ OpenAI API" if config.OPENAI_API_KEY else "⚠️ OpenAI API (Optional)")
    
    st.markdown("---")
    
    st.markdown("### 📊 Video Statistics")
    
    videos_count = len(load_video_history())
    st.write(f"**Total Videos Created:** {videos_count}")
    
    st.markdown("---")
    
    st.markdown("### 🎨 Personalization Interests")
    
    st.write("**Available Preset Interests:**")
    for interest in config.PRESET_INTERESTS:
        st.write(f"- {interest}")
    
    st.markdown("---")
    
    st.markdown("### 📝 About Rusaldo")
    
    st.write("""
    **Rusaldo (Learnify MVP)** transforms static learning materials into personalized animated videos.
    
    **Version:** 1.0.0 (MVP)
    
    **Features:**
    - Multi-format content input (PDF, images, text, web links)
    - AI-powered personalization
    - Automated video generation
    - Content library management
    
    **Tech Stack:**
    - Frontend: Streamlit
    - AI: OpenAI GPT-4o mini
    - Voice: ElevenLabs / OpenAI TTS
    - Video: MoviePy, FFmpeg
    """)
    
    st.markdown("---")
    
    if st.button("🗑️ Clear All Data"):
        if st.checkbox("I understand this will delete all generated videos"):
            # Clear history
            history_file = os.path.join(config.VIDEO_OUTPUT_DIR, "history.json")
            if os.path.exists(history_file):
                os.remove(history_file)
            st.success("✅ All data cleared!")
            st.rerun()


def _prepare_sketch_scene_plan(processed_content: dict) -> list[dict]:
    """Translate processed content into sketch-friendly scene data."""

    scenes = processed_content.get('scene_details') or []
    if scenes:
        plan = []
        for scene in scenes:
            narration = (scene.get('narration') or '').strip()
            if not narration:
                continue
            visual_prompt = (scene.get('visual_prompt') or scene.get('visual') or '').strip()
            if not visual_prompt:
                visual_prompt = narration
            plan.append({'narration': narration, 'visual_prompt': visual_prompt})
        if plan:
            return plan

    script = processed_content.get('script', '')
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', script) if s.strip()]
    if not sentences:
        sentences = ["Explain the concept using a hand-drawn sketch scene."]
    chunk_size = max(1, len(sentences) // max(3, len(sentences) // 2 or 1))
    plan = []
    for idx in range(0, len(sentences), chunk_size):
        narration = ' '.join(sentences[idx: idx + chunk_size])
        if narration:
            plan.append({
                'narration': narration,
                'visual_prompt': f"Sketch illustration of: {narration}"
            })
    return plan[:6]


if __name__ == "__main__":
    main()
