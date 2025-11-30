"""
Video generation and assembly utilities
"""
import os
import requests
from typing import List, Optional, Dict
from pathlib import Path
import time
import re
from moviepy.editor import (
    AudioFileClip, 
    ImageClip, 
    concatenate_videoclips,
    CompositeVideoClip,
    TextClip
)
from elevenlabs.client import ElevenLabs
import config
from utils.manim_generator import ManimGenerator


class VideoGenerator:
    """Handle video generation and assembly"""
    
    def __init__(self, use_manim: bool = False):
        self.elevenlabs_key = config.ELEVENLABS_API_KEY
        self.replicate_key = config.REPLICATE_API_KEY
        self.luma_key = config.LUMA_API_KEY
        self.runway_key = config.RUNWAY_API_KEY
        self.huggingface_key = config.HUGGINGFACE_API_KEY
        self.stability_key = config.STABILITY_API_KEY
        self.pika_key = config.PIKA_API_KEY
        self.use_manim = use_manim
        
        # Initialize Manim generator if requested
        if self.use_manim:
            self.manim_generator = ManimGenerator()
        
        if self.elevenlabs_key:
            self.elevenlabs_client = ElevenLabs(api_key=self.elevenlabs_key)
        else:
            self.elevenlabs_client = None
    
    def generate_voiceover(self, script: str, output_path: str) -> str:
        """
        Generate voiceover from script using ElevenLabs with retry, or free Edge-TTS fallback
        
        Args:
            script: Text script for narration
            output_path: Path to save audio file
            
        Returns:
            Path to generated audio file
        """
        # Try ElevenLabs with exponential backoff retry
        if self.elevenlabs_client:
            max_retries = 3
            base_delay = 2  # Start with 2 seconds
            
            for attempt in range(max_retries):
                try:
                    if attempt > 0:
                        delay = base_delay * (2 ** attempt)  # Exponential backoff: 2s, 4s, 8s
                        print(f"⏳ Rate limited. Waiting {delay}s before retry {attempt + 1}/{max_retries}...")
                        time.sleep(delay)
                    
                    print(f"🎤 Generating voiceover with ElevenLabs (attempt {attempt + 1}/{max_retries})...")
                    audio_generator = self.elevenlabs_client.text_to_speech.convert(
                        text=script,
                        voice_id="21m00Tcm4TlvDq8ikWAM",  # Rachel voice ID
                        model_id="eleven_monolingual_v1",
                        voice_settings={
                            "stability": 0.5,
                            "similarity_boost": 0.75
                        }
                    )
                    
                    # Save audio to file
                    with open(output_path, 'wb') as f:
                        for chunk in audio_generator:
                            if chunk:
                                f.write(chunk)
                    
                    print("✅ ElevenLabs voiceover generated!")
                    return output_path
                    
                except Exception as e:
                    error_msg = str(e).lower()
                    if 'rate limit' in error_msg or 'quota' in error_msg or '429' in error_msg:
                        if attempt < max_retries - 1:
                            print(f"⚠️ Rate limit hit: {str(e)}")
                            continue  # Retry with backoff
                        else:
                            print(f"❌ ElevenLabs rate limit exceeded after {max_retries} retries")
                            print("📢 Falling back to FREE Edge-TTS (Microsoft)...")
                    else:
                        print(f"⚠️ ElevenLabs failed: {str(e)}")
                        print("📢 Falling back to FREE Edge-TTS (Microsoft)...")
                        break  # Don't retry on non-rate-limit errors
        
        # Fallback to Edge-TTS (Microsoft - FREE & High Quality!)
        try:
            import asyncio
            import edge_tts
            
            print("🎤 Generating voiceover with Edge-TTS (Microsoft - FREE)...")
            
            # Use Microsoft's natural voices
            voice = "en-US-AriaNeural"  # Female, natural voice
            
            async def generate_edge_tts():
                communicate = edge_tts.Communicate(script, voice)
                await communicate.save(output_path)
            
            # Handle event loop properly
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    # If loop is already running, use nest_asyncio
                    import nest_asyncio
                    nest_asyncio.apply()
                    asyncio.run(generate_edge_tts())
                else:
                    asyncio.run(generate_edge_tts())
            except RuntimeError:
                # Fallback: create new loop
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                loop.run_until_complete(generate_edge_tts())
                loop.close()
            
            print("✅ Edge-TTS voiceover generated! (High quality, FREE)")
            return output_path
        except Exception as e:
            print(f"⚠️ Edge-TTS failed: {str(e)}")
            print("📢 Falling back to gTTS...")
            
            # Fallback to gTTS
            try:
                from gtts import gTTS
                print("🎤 Generating voiceover with gTTS...")
                tts = gTTS(text=script, lang='en', slow=False)
                tts.save(output_path)
                print("✅ gTTS voiceover generated!")
                return output_path
            except Exception as e2:
                print(f"⚠️ gTTS failed: {str(e2)}")
                print("📢 Falling back to pyttsx3 (offline)...")
                # Final fallback to pyttsx3
                return self._generate_free_tts(script, output_path)
    
    def _generate_free_tts(self, script: str, output_path: str):
        """Generate TTS using free pyttsx3 library"""
        import pyttsx3
        engine = pyttsx3.init()
        
        # Configure voice properties
        engine.setProperty('rate', 150)  # Speed of speech
        engine.setProperty('volume', 0.9)  # Volume (0-1)
        
        # Save to file
        engine.save_to_file(script, output_path)
        engine.runAndWait()
    
    def generate_subtitles(self, script: str, audio_path: str, output_path: str) -> str:
        """
        Generate SRT subtitle file from script with timing based on audio duration
        
        Args:
            script: Text script for narration
            audio_path: Path to audio file for timing reference
            output_path: Path to save SRT subtitle file
            
        Returns:
            Path to generated SRT file
        """
        try:
            # Load audio to get duration
            audio = AudioFileClip(audio_path)
            audio_duration = audio.duration
            audio.close()
            
            # Split script into sentences/phrases
            sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', script) if s.strip()]
            
            if not sentences:
                sentences = [script]
            
            # Calculate timing for each subtitle
            duration_per_subtitle = audio_duration / len(sentences)
            
            # Generate SRT content
            srt_content = []
            for i, sentence in enumerate(sentences):
                start_time = i * duration_per_subtitle
                end_time = (i + 1) * duration_per_subtitle
                
                # Format time as HH:MM:SS,mmm
                start_srt = self._format_srt_time(start_time)
                end_srt = self._format_srt_time(end_time)
                
                srt_content.append(f"{i + 1}")
                srt_content.append(f"{start_srt} --> {end_srt}")
                srt_content.append(sentence)
                srt_content.append("")  # Empty line between entries
            
            # Write SRT file
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(srt_content))
            
            print(f"✅ Subtitles generated: {output_path}")
            return output_path
            
        except Exception as e:
            print(f"⚠️ Error generating subtitles: {str(e)}")
            # Return empty subtitles file as fallback
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write("")
            return output_path
    
    def _format_srt_time(self, seconds: float) -> str:
        """Convert seconds to SRT time format (HH:MM:SS,mmm)"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        milliseconds = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{milliseconds:03d}"
    
    def generate_animation_placeholder(
        self, 
        visual_prompt: str, 
        duration: float,
        output_path: str,
        scene_number: int,
        text_content: str = ""
    ) -> str:
        """
        Generate animation using Manim or fallback to simple placeholder
        
        Args:
            visual_prompt: Description for the visual scene
            duration: Duration of the scene in seconds
            output_path: Path to save video file
            scene_number: Scene number for identification
            text_content: Text content for Manim animations
            
        Returns:
            Path to generated video file
        """
        try:
            # Use Manim for whiteboard animations
            if self.use_manim and text_content:
                print(f"\n🎨 Generating Manim whiteboard animation for scene {scene_number}...")
                return self.manim_generator.generate_whiteboard_animation(
                    text_content,
                    visual_prompt,
                    duration,
                    output_path,
                    scene_number
                )
            
            # Fallback: Simple placeholder if Manim disabled or fails
            print(f"\n⚠️ Manim disabled or no text content for scene {scene_number}")
            print(f"   Creating simple placeholder...")
            from PIL import Image, ImageDraw, ImageFont
            import numpy as np
            
            # Create a gradient background instead of solid color
            colors = [
                [(100, 149, 237), (147, 112, 219)],  # Blue to purple
                [(147, 112, 219), (72, 209, 204)],   # Purple to turquoise
                [(72, 209, 204), (50, 205, 50)],     # Turquoise to green
                [(255, 165, 0), (255, 99, 71)],      # Orange to red
                [(50, 205, 50), (100, 149, 237)],    # Green to blue
            ]
            
            color_pair = colors[scene_number % len(colors)]
            
            # Create gradient image
            img = Image.new('RGB', (1280, 720))
            draw = ImageDraw.Draw(img)
            
            # Draw gradient
            for y in range(720):
                ratio = y / 720
                r = int(color_pair[0][0] * (1 - ratio) + color_pair[1][0] * ratio)
                g = int(color_pair[0][1] * (1 - ratio) + color_pair[1][1] * ratio)
                b = int(color_pair[0][2] * (1 - ratio) + color_pair[1][2] * ratio)
                draw.line([(0, y), (1280, y)], fill=(r, g, b))
            
            # Add scene number
            try:
                font = ImageFont.truetype("arial.ttf", 48)
                small_font = ImageFont.truetype("arial.ttf", 24)
            except:
                font = ImageFont.load_default()
                small_font = ImageFont.load_default()
            
            # Draw scene indicator
            scene_text = f"Scene {scene_number + 1}"
            bbox = draw.textbbox((0, 0), scene_text, font=font)
            text_width = bbox[2] - bbox[0]
            x = (1280 - text_width) // 2
            draw.text((x, 320), scene_text, fill='white', font=font)
            
            # Add note
            note = "(Animation service unavailable)"
            bbox = draw.textbbox((0, 0), note, font=small_font)
            text_width = bbox[2] - bbox[0]
            x = (1280 - text_width) // 2
            draw.text((x, 380), note, fill=(255, 255, 255, 180), font=small_font)
            
            # Convert to numpy and create clip with Ken Burns effect
            frame = np.array(img)
            clip = ImageClip(frame).set_duration(duration)
            
            # Apply Ken Burns effect (zoom in slowly)
            def zoom_effect(get_frame, t):
                frame = get_frame(t)
                zoom_factor = 1 + (t / duration) * 0.1  # 10% zoom over duration
                h, w = frame.shape[:2]
                new_h, new_w = int(h / zoom_factor), int(w / zoom_factor)
                
                # Crop center
                y1, x1 = (h - new_h) // 2, (w - new_w) // 2
                cropped = frame[y1:y1+new_h, x1:x1+new_w]
                
                # Resize back to original size
                from PIL import Image
                img_pil = Image.fromarray(cropped)
                img_resized = img_pil.resize((w, h), Image.LANCZOS)
                return np.array(img_resized)
            
            clip = clip.fl(zoom_effect)
            
            # Write video file
            clip.write_videofile(
                output_path,
                fps=24,
                codec='libx264',
                audio=False,
                verbose=False,
                logger=None
            )
            
            return output_path
        except Exception as e:
            raise Exception(f"Error generating animation: {str(e)}")
    
    def _call_pika_api(self, prompt: str, duration: float) -> str:
        """
        Call Pika Labs API for animation generation
        (Placeholder for actual implementation)
        """
        if not self.pika_key:
            raise ValueError("Pika API key not configured")
        
        # TODO: Implement actual Pika Labs API call
        # This is a placeholder for the actual implementation
        raise NotImplementedError("Pika Labs API integration pending")
    
    def _call_runway_api(self, prompt: str, duration: float) -> str:
        """
        Call Runway API for animation generation
        (Placeholder for actual implementation)
        """
        if not self.runway_key:
            raise ValueError("Runway API key not configured")
        
        # TODO: Implement actual Runway API call
        # This is a placeholder for the actual implementation
        raise NotImplementedError("Runway API integration pending")
    
    def assemble_video(
        self,
        audio_path: str,
        video_clips: List[str],
        output_path: str
    ) -> str:
        """
        Assemble final video from audio and video clips
        
        Args:
            audio_path: Path to audio file
            video_clips: List of paths to video clip files
            output_path: Path to save final video
            
        Returns:
            Path to final video file
        """
        try:
            # Load audio
            audio = AudioFileClip(audio_path)
            audio_duration = audio.duration
            
            # Load and concatenate video clips with crossfade transitions
            clips = []
            total_video_duration = 0
            
            for clip_path in video_clips:
                from moviepy.editor import VideoFileClip
                clip = VideoFileClip(clip_path)
                clips.append(clip)
                total_video_duration += clip.duration
            
            # Concatenate all video clips with smooth crossfade transitions
            if clips:
                print(f"📹 Assembling {len(clips)} video clips...")
                
                # Validate all clips have fps
                for i, clip in enumerate(clips):
                    if not clip.fps or clip.fps <= 0:
                        print(f"⚠️ Clip {i} has invalid fps: {clip.fps}, setting to 15")
                        clip.fps = 15
                
                # Add crossfade between clips for smooth transitions
                try:
                    from moviepy.video.compositing.transitions import crossfadein, crossfadeout
                    
                    transition_duration = 0.5  # 0.5 second crossfade
                    processed_clips = []
                    
                    for i, clip in enumerate(clips):
                        if i > 0:
                            # Add fade in to all clips except first
                            clip = crossfadein(clip, transition_duration)
                        if i < len(clips) - 1:
                            # Add fade out to all clips except last
                            clip = crossfadeout(clip, transition_duration)
                        processed_clips.append(clip)
                    
                    final_video = concatenate_videoclips(processed_clips, method="compose")
                except Exception as e:
                    print(f"⚠️ Crossfade failed: {e}, using simple concatenation")
                    final_video = concatenate_videoclips(clips, method="compose")
                
                # NEVER loop video - only trim to match audio
                # If video is shorter than audio, that's a generation error we should fix upstream
                if final_video.duration > audio_duration:
                    # Trim video to match audio
                    final_video = final_video.subclip(0, audio_duration)
                elif final_video.duration < audio_duration:
                    # Video is too short - extend last frame instead of looping
                    print(f"⚠️ Warning: Video ({final_video.duration}s) shorter than audio ({audio_duration}s)")
                    print(f"   Extending last frame to match audio duration")
                    
                    try:
                        # Get the last frame and hold it
                        from moviepy.editor import ImageClip
                        last_frame = final_video.get_frame(final_video.duration - 0.1)
                        extension_duration = audio_duration - final_video.duration
                        
                        # Set fps for extension clip to match video
                        video_fps = final_video.fps if final_video.fps else 15
                        extension_clip = ImageClip(last_frame).set_duration(extension_duration).set_fps(video_fps)
                        
                        print(f"   Creating extension clip: {extension_duration}s at {video_fps}fps")
                        
                        # Concatenate original video with extended last frame
                        final_video = concatenate_videoclips([final_video, extension_clip])
                    except Exception as e:
                        print(f"⚠️ Could not extend video: {e}")
                        print(f"   Using video as-is (audio will be longer)")
                
                # Add audio
                final_video = final_video.set_audio(audio)
                
                # Get fps from video or use default
                output_fps = final_video.fps if final_video.fps and final_video.fps > 0 else 15
                print(f"📹 Writing final video with fps: {output_fps}")
                
                # Write final video
                final_video.write_videofile(
                    output_path,
                    fps=output_fps,
                    codec='libx264',
                    audio_codec='aac',
                    verbose=False,
                    logger=None
                )
                
                # Clean up
                final_video.close()
                audio.close()
                for clip in clips:
                    clip.close()
                
                return output_path
            else:
                raise Exception("No video clips to assemble")
                
        except Exception as e:
            raise Exception(f"Error assembling video: {str(e)}")
    
    def generate_complete_video(
        self,
        script: str,
        visual_prompts: List[str],
        duration: int,
        output_filename: str,
        scene_details: Optional[List[Dict]] = None
    ) -> Dict[str, str]:
        """
        Complete video generation pipeline with subtitle generation
        
        Args:
            script: Narration script
            visual_prompts: List of visual scene descriptions
            duration: Total video duration in seconds
            output_filename: Name for output video file
            scene_details: Optional structured scene data with narration + visual prompts
        
        Returns:
            Dictionary containing 'video_path' and 'subtitle_path'
        """
        try:
            # Create temp directory for intermediate files
            temp_dir = Path(config.TEMP_DIR) / f"video_{int(time.time())}"
            temp_dir.mkdir(parents=True, exist_ok=True)
            
            scene_details = scene_details or []

            # Step 1: Generate voiceover
            audio_path = str(temp_dir / "voiceover.mp3")
            self.generate_voiceover(script, audio_path)
            
            # Get actual audio duration and trim to requested duration
            audio = AudioFileClip(audio_path)
            actual_duration = audio.duration
            
            # CRITICAL: Validate audio duration
            print(f"🔍 DEBUG - Audio file info:")
            print(f"   audio_path: {audio_path}")
            print(f"   audio.duration: {repr(audio.duration)} (type: {type(audio.duration).__name__ if audio.duration else 'None'})")
            print(f"   requested duration: {duration}")
            
            if actual_duration is None or actual_duration <= 0:
                print(f"❌ CRITICAL: Audio duration is invalid! Using requested duration: {duration}s")
                actual_duration = float(duration)
            
            # If audio is longer than requested, trim it
            if actual_duration > duration:
                audio = audio.subclip(0, duration)
                audio.write_audiofile(audio_path, verbose=False, logger=None)
                actual_duration = duration
            
            audio.close()
            
            # Step 2: Generate video clips for each scene
            video_clips = []
            
            # CRITICAL FIX: Manim scenes are ~5 seconds each
            # Calculate how many 5-second scenes we need to match audio duration
            MANIM_SCENE_DURATION = 5.0  # Each Manim scene is approximately 5 seconds
            
            # Calculate number of scenes needed
            num_scenes_needed = max(1, int(actual_duration / MANIM_SCENE_DURATION))
            if actual_duration % MANIM_SCENE_DURATION > 2:  # If remainder > 2s, add one more scene
                num_scenes_needed += 1
            if scene_details:
                num_scenes_needed = max(num_scenes_needed, len(scene_details))

            print(f"📊 Video generation calculation:")
            print(f"   Audio duration: {actual_duration}s")
            print(f"   Manim scene duration: {MANIM_SCENE_DURATION}s")
            print(f"   Scenes needed: {num_scenes_needed}")

            prompts = list(visual_prompts) if visual_prompts else []
            target_scene_count = max(num_scenes_needed, len(scene_details) if scene_details else 0)
            if target_scene_count == 0:
                target_scene_count = num_scenes_needed

            if len(prompts) < target_scene_count:
                print(f"⚠️  Expanding prompts to {target_scene_count} scenes using script context...")
                sentences = [s.strip() + '.' for s in script.split('.') if s.strip()]
                sentences_per_scene = max(1, len(sentences) // target_scene_count) if target_scene_count else 1
                for i in range(len(prompts), target_scene_count):
                    start_idx = i * sentences_per_scene
                    end_idx = start_idx + sentences_per_scene
                    scene_sentences = sentences[start_idx:end_idx]
                    if scene_sentences:
                        prompts.append(f"Educational visualization: {' '.join(scene_sentences[:2])[:120]}")
                    else:
                        fallback_prompt = prompts[i % len(prompts)] if prompts else "Educational whiteboard animation"
                        prompts.append(fallback_prompt)

            if not prompts:
                prompts = ["Educational whiteboard animation"] * target_scene_count

            num_scenes = max(target_scene_count, len(prompts))
            scene_duration = MANIM_SCENE_DURATION  # Fixed duration per scene
            
            print(f"📊 Final video generation plan:")
            print(f"   Total audio duration: {actual_duration}s")
            print(f"   Number of scenes: {num_scenes}")
            print(f"   Duration per scene: {scene_duration}s")
            print(f"   Expected video duration: {num_scenes * scene_duration}s")
            
            # Split script evenly across scenes
            sentences = [s.strip() + '.' for s in script.split('.') if s.strip()]
            sentences_per_scene = max(1, len(sentences) // num_scenes)
            
            for i in range(num_scenes):
                prompt = prompts[i] if i < len(prompts) else "Educational whiteboard animation"
                clip_path = str(temp_dir / f"scene_{i}.mp4")
                
                # Get text for this scene
                start_idx = i * sentences_per_scene
                end_idx = start_idx + sentences_per_scene
                if i == num_scenes - 1:  # Last scene gets remaining sentences
                    scene_sentences = sentences[start_idx:]
                else:
                    scene_sentences = sentences[start_idx:end_idx]
                
                scene_text = ' '.join(scene_sentences) if scene_sentences else script[:200]
                detail = scene_details[i] if scene_details and i < len(scene_details) else None
                if detail:
                    if detail.get('visual_prompt'):
                        prompt = detail['visual_prompt']
                    detail_text = detail.get('narration') or detail.get('visual_prompt') or detail.get('timestamp')
                    if detail_text:
                        scene_text = detail_text
                
                print(f"\n🎬 Generating scene {i+1}/{num_scenes}:")
                print(f"   Text: {scene_text[:100]}...")
                print(f"   Duration: {scene_duration}s")
                
                # Ensure scene_duration is a valid float
                safe_duration = float(scene_duration) if scene_duration else 5.0
                if detail and detail.get('timestamp'):
                    timestamp = detail['timestamp']
                    match = re.match(r"(\d+)\s*-\s*(\d+)", timestamp.replace('s', '').strip())
                    if match:
                        start_val, end_val = match.groups()
                        try:
                            duration_guess = float(end_val) - float(start_val)
                            if duration_guess > 1:
                                safe_duration = duration_guess
                        except ValueError:
                            pass
                
                self.generate_animation_placeholder(
                    prompt,
                    safe_duration,
                    clip_path,
                    i,
                    scene_text  # Pass text content for Manim
                )
                video_clips.append(clip_path)
            
            # Step 3: Assemble final video
            output_path = os.path.join(config.VIDEO_OUTPUT_DIR, output_filename)
            final_video = self.assemble_video(audio_path, video_clips, output_path)
            
            # Step 4: Generate subtitles
            subtitle_filename = output_filename.replace('.mp4', '.srt')
            subtitle_path = os.path.join(config.VIDEO_OUTPUT_DIR, subtitle_filename)
            self.generate_subtitles(script, audio_path, subtitle_path)
            
            # Clean up temp files (optional, keep for debugging)
            # shutil.rmtree(temp_dir)
            
            return {
                'video_path': final_video,
                'subtitle_path': subtitle_path
            }
            
        except Exception as e:
            raise Exception(f"Error in video generation pipeline: {str(e)}")
    
    def _generate_stability_animation(self, visual_prompt: str, duration: float, output_path: str, scene_number: int) -> str:
        """
        Generate animation using Stability.ai API (Stable Diffusion)
        
        Args:
            visual_prompt: Description for the visual scene
            duration: Duration of the scene in seconds
            output_path: Path to save video file
            scene_number: Scene number
            
        Returns:
            Path to generated video file
        """
        from PIL import Image
        import numpy as np
        import base64
        
        # Stability.ai API endpoint for Stable Diffusion 3
        url = "https://api.stability.ai/v2beta/stable-image/generate/sd3"
        
        headers = {
            "authorization": f"Bearer {self.stability_key}",
            "accept": "image/*"
        }
        
        # Prepare the request
        files = {
            "none": ''
        }
        
        data = {
            "prompt": f"Educational illustration, colorful, engaging, professional: {visual_prompt}",
            "output_format": "png",
            "aspect_ratio": "16:9",
            "mode": "text-to-image"
        }
        
        # Generate image
        response = requests.post(url, headers=headers, files=files, data=data)
        
        if response.status_code == 200:
            # Save image temporarily
            temp_img_path = output_path.replace('.mp4', '.png')
            with open(temp_img_path, 'wb') as f:
                f.write(response.content)
            
            # Convert image to video clip with Ken Burns effect
            print(f"  🎨 Adding Ken Burns effect (zoom + pan)...")
            img = Image.open(temp_img_path)
            frame = np.array(img)
            clip = ImageClip(frame).set_duration(duration)
            
            # Apply Ken Burns effect (slow zoom + pan)
            def ken_burns_effect(get_frame, t):
                """Apply smooth zoom and pan effect"""
                frame = get_frame(t)
                h, w = frame.shape[:2]
                
                # Calculate zoom factor (1.0 to 1.15 over duration)
                progress = t / duration
                zoom_factor = 1.0 + (progress * 0.15)
                
                # Calculate pan (slight horizontal movement)
                pan_x = int(w * 0.05 * progress)  # Pan 5% of width
                
                # Calculate new dimensions after zoom
                new_h = int(h / zoom_factor)
                new_w = int(w / zoom_factor)
                
                # Calculate crop position (center + pan)
                y1 = (h - new_h) // 2
                x1 = ((w - new_w) // 2) + pan_x
                
                # Ensure we don't go out of bounds
                x1 = max(0, min(x1, w - new_w))
                y1 = max(0, min(y1, h - new_h))
                
                # Crop
                cropped = frame[y1:y1+new_h, x1:x1+new_w]
                
                # Resize back to original size
                img_pil = Image.fromarray(cropped)
                img_resized = img_pil.resize((w, h), Image.LANCZOS)
                return np.array(img_resized)
            
            clip = clip.fl(ken_burns_effect)
            
            # Add fade in/out for smooth transitions
            clip = clip.fadein(0.5).fadeout(0.5)
            
            # Write video
            clip.write_videofile(
                output_path,
                fps=24,
                codec='libx264',
                audio=False,
                verbose=False,
                logger=None
            )
            
            print(f"  ✅ Scene {scene_number} completed with Stability.ai + Ken Burns!")
            
            # Clean up temp image
            os.remove(temp_img_path)
            
            return output_path
        else:
            raise Exception(f"Stability.ai API error: {response.status_code} - {response.text}")
    
    def _generate_replicate_animation(self, visual_prompt: str, duration: float, output_path: str, scene_number: int) -> str:
        """
        Generate animated video using Replicate (AnimateDiff or similar models)
        Uses $5 FREE credits
        
        Args:
            visual_prompt: Description for the visual scene
            duration: Duration of the scene in seconds
            output_path: Path to save video file
            scene_number: Scene number
            
        Returns:
            Path to generated video file
        """
        import replicate
        import os
        
        # Set API token
        os.environ["REPLICATE_API_TOKEN"] = self.replicate_key
        
        # Enhanced prompt for TED-Ed style
        prompt = f"Professional educational animation, TED-Ed style, smooth motion, colorful illustration, engaging visuals: {visual_prompt}"
        
        try:
            print(f"  📹 Generating video with Replicate...")
            
            # Use AnimateDiff Lightning for fast generation
            output = replicate.run(
                "lucataco/animate-diff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48a9f",
                input={
                    "prompt": prompt,
                    "num_frames": 16,
                    "guidance_scale": 7.5,
                    "num_inference_steps": 25
                }
            )
            
            # Download video
            print(f"  ⬇️ Downloading video...")
            video_url = output
            response = requests.get(video_url)
            
            # Save temporarily
            temp_path = output_path.replace('.mp4', '_temp.mp4')
            with open(temp_path, 'wb') as f:
                f.write(response.content)
            
            # Adjust duration if needed
            from moviepy.editor import VideoFileClip
            clip = VideoFileClip(temp_path)
            
            if clip.duration > duration:
                clip = clip.subclip(0, duration)
            elif clip.duration < duration:
                # Loop if needed
                loops = int(duration / clip.duration) + 1
                from moviepy.editor import concatenate_videoclips
                clip = concatenate_videoclips([clip] * loops)
                clip = clip.subclip(0, duration)
            
            # Write final video
            clip.write_videofile(
                output_path,
                fps=24,
                codec='libx264',
                audio=False,
                verbose=False,
                logger=None
            )
            
            clip.close()
            os.remove(temp_path)
            
            print(f"  ✅ Scene {scene_number} completed with Replicate!")
            return output_path
                
        except Exception as e:
            raise Exception(f"Replicate generation failed: {str(e)}")
    
    def _generate_luma_animation(self, visual_prompt: str, duration: float, output_path: str, scene_number: int) -> str:
        """
        Generate professional animated video using Luma AI Dream Machine
        Creates actual animated videos with motion
        
        Args:
            visual_prompt: Description for the visual scene
            duration: Duration of the scene in seconds
            output_path: Path to save video file
            scene_number: Scene number
            
        Returns:
            Path to generated video file
        """
        import time
        from moviepy.editor import VideoFileClip, concatenate_videoclips
        import tempfile
        
        # Enhanced prompt for TED-Ed style
        prompt = f"Professional educational animation, TED-Ed style, smooth motion, colorful illustration, engaging visuals: {visual_prompt}"
        
        try:
            # Calculate how many 5-second clips we need
            clip_duration = 5.0  # Luma generates ~5 second clips
            num_clips = max(1, int(duration / clip_duration))
            
            clips = []
            temp_dir = tempfile.mkdtemp()
            
            # Generate multiple short clips
            for i in range(num_clips):
                try:
                    # Vary the prompt slightly for each clip
                    varied_prompt = f"{prompt}, scene {i+1} of {num_clips}"
                    
                    print(f"  📹 Requesting Luma AI clip {i+1}/{num_clips}...")
                    
                    # Generate video with Luma AI
                    generation = self.luma_client.generations.create(
                        prompt=varied_prompt,
                        aspect_ratio="16:9"
                    )
                    
                    generation_id = generation.id
                    print(f"  ⏳ Generation ID: {generation_id}, waiting for completion...")
                    
                    # Wait for generation to complete
                    max_wait = 180  # 3 minutes max wait
                    wait_time = 0
                    
                    while wait_time < max_wait:
                        generation_status = self.luma_client.generations.get(id=generation_id)
                        
                        if generation_status.state == 'completed':
                            # Download video
                            video_url = generation_status.assets.video
                            
                            print(f"  ✅ Clip {i+1} completed, downloading...")
                            
                            # Save clip
                            clip_path = os.path.join(temp_dir, f"clip_{i}.mp4")
                            response = requests.get(video_url)
                            with open(clip_path, 'wb') as f:
                                f.write(response.content)
                            
                            # Load clip
                            clip = VideoFileClip(clip_path)
                            clips.append(clip)
                            break
                            
                        elif generation_status.state == 'failed':
                            print(f"  ❌ Luma generation failed for clip {i}")
                            break
                        
                        time.sleep(5)
                        wait_time += 5
                    
                except Exception as e:
                    print(f"  ❌ Failed to generate Luma clip {i}: {e}")
                    continue
            
            if clips:
                # Stitch clips together
                final_clip = concatenate_videoclips(clips, method="compose")
                
                # Adjust to exact duration
                if final_clip.duration > duration:
                    final_clip = final_clip.subclip(0, duration)
                elif final_clip.duration < duration:
                    # Loop if needed
                    loops = int(duration / final_clip.duration) + 1
                    final_clip = concatenate_videoclips([final_clip] * loops)
                    final_clip = final_clip.subclip(0, duration)
                
                # Write final video
                final_clip.write_videofile(
                    output_path,
                    fps=24,
                    codec='libx264',
                    audio=False,
                    verbose=False,
                    logger=None
                )
                
                # Cleanup
                for clip in clips:
                    clip.close()
                
                print(f"  ✅ Scene {scene_number} completed with Luma AI!")
                return output_path
            else:
                raise Exception("No Luma clips were generated successfully")
                
        except Exception as e:
            raise Exception(f"Luma AI generation failed: {str(e)}")
    
    def _generate_runway_animation(self, visual_prompt: str, duration: float, output_path: str, scene_number: int) -> str:
        """
        Generate professional animated video using Runway Gen-3 Alpha
        Creates multiple short clips and stitches them for continuous animation
        
        Args:
            visual_prompt: Description for the visual scene
            duration: Duration of the scene in seconds
            output_path: Path to save video file
            scene_number: Scene number
            
        Returns:
            Path to generated video file
        """
        import time
        from moviepy.editor import VideoFileClip, concatenate_videoclips
        import tempfile
        
        # Enhanced prompt for TED-Ed style
        prompt = f"Professional educational animation, TED-Ed style, smooth motion, colorful illustration, engaging visuals: {visual_prompt}"
        
        try:
            # Calculate how many 5-second clips we need
            clip_duration = 5.0  # Runway Gen-3 generates ~5 second clips
            num_clips = max(1, int(duration / clip_duration))
            
            clips = []
            temp_dir = tempfile.mkdtemp()
            
            # Generate multiple short clips
            for i in range(num_clips):
                try:
                    # Vary the prompt slightly for each clip
                    varied_prompt = f"{prompt}, scene {i+1} of {num_clips}"
                    
                    print(f"  📹 Requesting Runway clip {i+1}/{num_clips}...")
                    
                    # Generate video with Runway Gen-3 (text-to-video)
                    task = self.runway_client.text_to_video.create(
                        model='gen3a_turbo',
                        prompt_text=varied_prompt,
                        duration=5,  # 5 seconds per clip
                        ratio='16:9'
                    )
                    
                    print(f"  ⏳ Task ID: {task.id}, waiting for completion...")
                    
                    # Wait for generation to complete
                    task_id = task.id
                    max_wait = 120  # 2 minutes max wait
                    wait_time = 0
                    
                    while wait_time < max_wait:
                        task_status = self.runway_client.tasks.retrieve(task_id)
                        
                        if task_status.status == 'SUCCEEDED':
                            # Download video
                            video_url = task_status.output[0]
                            
                            # Save clip
                            clip_path = os.path.join(temp_dir, f"clip_{i}.mp4")
                            response = requests.get(video_url)
                            with open(clip_path, 'wb') as f:
                                f.write(response.content)
                            
                            # Load clip
                            clip = VideoFileClip(clip_path)
                            clips.append(clip)
                            break
                            
                        elif task_status.status == 'FAILED':
                            print(f"Runway task failed for clip {i}")
                            break
                        
                        time.sleep(5)
                        wait_time += 5
                    
                except Exception as e:
                    print(f"Failed to generate Runway clip {i}: {e}")
                    continue
            
            if clips:
                # Stitch clips together
                final_clip = concatenate_videoclips(clips, method="compose")
                
                # Adjust to exact duration
                if final_clip.duration > duration:
                    final_clip = final_clip.subclip(0, duration)
                elif final_clip.duration < duration:
                    # Loop if needed
                    loops = int(duration / final_clip.duration) + 1
                    final_clip = concatenate_videoclips([final_clip] * loops)
                    final_clip = final_clip.subclip(0, duration)
                
                # Write final video
                final_clip.write_videofile(
                    output_path,
                    fps=24,
                    codec='libx264',
                    audio=False,
                    verbose=False,
                    logger=None
                )
                
                # Cleanup
                for clip in clips:
                    clip.close()
                
                return output_path
            else:
                raise Exception("No Runway clips were generated successfully")
                
        except Exception as e:
            raise Exception(f"Runway Gen-3 generation failed: {str(e)}")
    
    def _generate_huggingface_animation(self, visual_prompt: str, duration: float, output_path: str, scene_number: int) -> str:
        """
        Generate animated video using Hugging Face Inference API
        Creates multiple short clips and stitches them together for continuous animation
        
        Args:
            visual_prompt: Description for the visual scene
            duration: Duration of the scene in seconds
            output_path: Path to save video file
            scene_number: Scene number
            
        Returns:
            Path to generated video file
        """
        import requests
        import time
        
        # Hugging Face API endpoint for AnimateDiff (UPDATED URL)
        API_URL = "https://router.huggingface.co/hf-inference/models/guoyww/animatediff"
        
        headers = {
            "Authorization": f"Bearer {self.huggingface_key}"
        }
        
        # Enhanced prompt for TED-Ed style
        prompt = f"Professional educational animation, TED-Ed style, smooth motion, colorful illustration, engaging visuals: {visual_prompt}"
        
        payload = {
            "inputs": prompt
        }
        
        try:
            print(f"  📹 Requesting Hugging Face animation...")
            response = requests.post(API_URL, headers=headers, json=payload, timeout=120)
            
            if response.status_code == 200:
                # Save video
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                
                # Adjust duration if needed
                from moviepy.editor import VideoFileClip
                clip = VideoFileClip(output_path)
                
                if clip.duration != duration:
                    if clip.duration > duration:
                        clip = clip.subclip(0, duration)
                    else:
                        # Loop if needed
                        loops = int(duration / clip.duration) + 1
                        from moviepy.editor import concatenate_videoclips
                        clip = concatenate_videoclips([clip] * loops)
                        clip = clip.subclip(0, duration)
                    
                    # Write adjusted video
                    clip.write_videofile(
                        output_path,
                        fps=24,
                        codec='libx264',
                        audio=False,
                        verbose=False,
                        logger=None
                    )
                    clip.close()
                
                print(f"  ✅ Scene {scene_number} completed with Hugging Face!")
                return output_path
            else:
                raise Exception(f"Hugging Face API error: {response.status_code} - {response.text}")
                    
        except Exception as e:
            raise Exception(f"Hugging Face generation failed: {str(e)}")
