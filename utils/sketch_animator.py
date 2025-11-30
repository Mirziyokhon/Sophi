"""Sketch animation pipeline powered by Pollinations.ai and Edge-TTS.

This module keeps the entire workflow free-to-run while still delivering
hand-drawn style explainer clips. It can be imported by the Streamlit app or
used directly to render the built-in "Calculus on the Pitch" demo video.
"""
from __future__ import annotations

import asyncio
import logging
import math
import random
import threading
import urllib.parse
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable, List, Optional, Sequence, Union, Dict
import time

import numpy as np
import requests
from moviepy.editor import AudioFileClip, ImageClip, concatenate_videoclips
import edge_tts

import config


logger = logging.getLogger(__name__)


POLLINATIONS_BASE_URL = "https://pollinations.ai/p/"
GLOBAL_STYLE_SUFFIX = (
    "rough graphite pencil sketch on white paper, loose messy lines, "
    "minimalist, hand-drawn, unpolished, scribble style, high contrast, "
    "no shading, stick figure aesthetic"
)
DEFAULT_VOICE = "en-US-ChristopherNeural"


@dataclass
class SketchSegment:
    """Dataclass representing a single narration + visual segment."""

    narration: str
    visual_prompt: str
    audio_path: Optional[Path] = None
    image_path: Optional[Path] = None
    duration: float = field(default=0.0)


class SketchAnimator:
    """Generate whiteboard-style explainer clips using only free services."""

    def __init__(self, temp_root: Optional[Path] = None, voice: str = DEFAULT_VOICE):
        self.temp_dir = Path(temp_root or config.TEMP_DIR) / "sketch_animator"
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        self.voice = voice
        self.max_wiggle_shift = 18  # pixels

    # ------------------------------------------------------------------
    # Media generation helpers
    # ------------------------------------------------------------------
    def generate_sketch(self, prompt: str, output_path: Path) -> Path:
        """Fetch a Pollinations.ai sketch for the given prompt."""

        styled_prompt = self._apply_style(prompt)
        encoded_prompt = urllib.parse.quote(styled_prompt)
        seed = random.randint(10_000, 999_999_999)
        url = (
            f"{POLLINATIONS_BASE_URL}{encoded_prompt}?width=1024&height=768&"
            f"seed={seed}&model=flux"
        )

        logger.info("🖼️ Generating sketch via Pollinations.ai")
        response = requests.get(url, timeout=120)
        response.raise_for_status()

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "wb") as handle:
            handle.write(response.content)

        return output_path

    def generate_narration(self, text: str, output_path: Path) -> Path:
        """Generate narration audio using Edge-TTS (free)."""

        async def _synthesize() -> None:
            communicate = edge_tts.Communicate(text, self.voice)
            await communicate.save(str(output_path))

        self._run_async_task(_synthesize)
        return output_path

    def create_video(self, segments: List[SketchSegment], output_path: Path) -> Path:
        """Combine segment media into a single MP4 video."""

        if not segments:
            raise ValueError("No segments provided")

        clips = []
        try:
            for idx, segment in enumerate(segments):
                if not segment.audio_path or not segment.image_path:
                    raise ValueError(f"Segment {idx} is missing media paths")

                audio_clip = AudioFileClip(str(segment.audio_path))
                duration = audio_clip.duration
                segment.duration = duration

                image_clip = self._create_wiggle_clip(segment.image_path, duration)
                clip = image_clip.set_audio(audio_clip)
                clips.append(clip)

            final_video = concatenate_videoclips(clips, method="compose")
            output_path.parent.mkdir(parents=True, exist_ok=True)
            final_video.write_videofile(
                str(output_path),
                fps=24,
                codec="libx264",
                audio_codec="aac",
                verbose=False,
                logger=None,
            )
            final_video.close()
        finally:
            for clip in clips:
                try:
                    if clip.audio:
                        clip.audio.close()
                    clip.close()
                except Exception:  # pragma: no cover - best-effort cleanup
                    pass

        return output_path
    
    def generate_subtitles(self, segments: List[SketchSegment], output_path: Path) -> Path:
        """Generate SRT subtitle file from sketch segments with timing"""
        try:
            srt_content = []
            current_time = 0.0
            
            for i, segment in enumerate(segments):
                if not segment.duration:
                    continue
                
                start_time = current_time
                end_time = current_time + segment.duration
                
                # Format time as HH:MM:SS,mmm
                start_srt = self._format_srt_time(start_time)
                end_srt = self._format_srt_time(end_time)
                
                srt_content.append(f"{i + 1}")
                srt_content.append(f"{start_srt} --> {end_srt}")
                srt_content.append(segment.narration)
                srt_content.append("")  # Empty line between entries
                
                current_time = end_time
            
            # Write SRT file
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(srt_content))
            
            print(f"✅ Sketch subtitles generated: {output_path}")
            return output_path
            
        except Exception as e:
            print(f"⚠️ Error generating sketch subtitles: {str(e)}")
            # Return empty subtitles file as fallback
            output_path.parent.mkdir(parents=True, exist_ok=True)
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

    # ------------------------------------------------------------------
    # High-level orchestration
    # ------------------------------------------------------------------
    def render_calculus_on_pitch_demo(self, output_filename: str = "calculus_on_the_pitch.mp4") -> Path:
        """Generate the provided 5-scene demo video end-to-end."""

        segments = [SketchSegment(**scene) for scene in self._calculus_on_pitch_scenes()]
        for idx, segment in enumerate(segments):
            scene_dir = self.temp_dir / f"scene_{idx:02d}"
            audio_path = scene_dir / "narration.mp3"
            image_path = scene_dir / "sketch.png"

            self.generate_narration(segment.narration, audio_path)
            self.generate_sketch(segment.visual_prompt, image_path)

            with AudioFileClip(str(audio_path)) as audio_clip:
                segment.duration = audio_clip.duration

            segment.audio_path = audio_path
            segment.image_path = image_path

        output_path = Path(config.VIDEO_OUTPUT_DIR) / output_filename
        return self.create_video(segments, output_path)

    def generate_video_from_scenes(
        self,
        scenes: Sequence[Union[SketchSegment, dict]],
        output_filename: str = "sketch_animation.mp4",
    ) -> Dict[str, str]:
        """Render arbitrary scenes into a final sketch animation clip with subtitles."""

        if not scenes:
            raise ValueError("At least one scene is required for sketch animation")

        segments: List[SketchSegment] = []
        timestamp = int(time.time())
        for idx, scene in enumerate(scenes):
            if isinstance(scene, SketchSegment):
                segment = scene
            else:
                narration = (scene.get("narration") or "").strip()
                if not narration:
                    continue
                prompt = (scene.get("visual_prompt") or scene.get("visual") or narration).strip()
                if not prompt:
                    prompt = "Hand-drawn sketch illustrating the narrated concept"
                segment = SketchSegment(narration=narration, visual_prompt=prompt)

            scene_dir = self.temp_dir / f"scene_{timestamp}_{idx:02d}"
            audio_path = scene_dir / "narration.mp3"
            image_path = scene_dir / "sketch.png"

            self.generate_narration(segment.narration, audio_path)
            self.generate_sketch(segment.visual_prompt, image_path)

            with AudioFileClip(str(audio_path)) as audio_clip:
                segment.duration = audio_clip.duration

            segment.audio_path = audio_path
            segment.image_path = image_path
            segments.append(segment)

        if not segments:
            raise ValueError("No valid segments generated for sketch animation")

        output_path = Path(config.VIDEO_OUTPUT_DIR) / output_filename
        video_path = self.create_video(segments, output_path)
        
        # Generate subtitles
        subtitle_filename = output_filename.replace('.mp4', '.srt')
        subtitle_path = Path(config.VIDEO_OUTPUT_DIR) / subtitle_filename
        self.generate_subtitles(segments, subtitle_path)
        
        return {
            'video_path': str(video_path),
            'subtitle_path': str(subtitle_path)
        }

    # ------------------------------------------------------------------
    # Internal utilities
    # ------------------------------------------------------------------
    def _apply_style(self, prompt: str) -> str:
        return f"{prompt}. {GLOBAL_STYLE_SUFFIX}"

    def _create_wiggle_clip(self, image_path: Path, duration: float) -> ImageClip:
        clip = ImageClip(str(image_path)).set_duration(duration).resize(height=720)
        base_frame = clip.get_frame(0)

        def wiggle(_get_frame, t: float):
            shift_x = int(math.sin(t * 1.7) * self.max_wiggle_shift)
            shift_y = int(math.cos(t * 1.3) * self.max_wiggle_shift)
            return self._shift_frame(base_frame, shift_x, shift_y)

        return clip.fl(wiggle)

    def _shift_frame(self, frame: np.ndarray, shift_x: int, shift_y: int) -> np.ndarray:
        pad = self.max_wiggle_shift + 2
        padded = np.pad(frame, ((pad, pad), (pad, pad), (0, 0)), mode="edge")
        y_start = pad + shift_y
        x_start = pad + shift_x
        y_end = y_start + frame.shape[0]
        x_end = x_start + frame.shape[1]
        return padded[y_start:y_end, x_start:x_end]

    def _run_async_task(self, coro_factory):
        async def runner():
            await coro_factory()

        try:
            asyncio.run(runner())
        except RuntimeError:
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = None

            if loop and loop.is_running():
                thread = threading.Thread(target=lambda: asyncio.run(runner()))
                thread.start()
                thread.join()
            else:
                new_loop = asyncio.new_event_loop()
                asyncio.set_event_loop(new_loop)
                new_loop.run_until_complete(runner())
                new_loop.close()

    @staticmethod
    def _calculus_on_pitch_scenes() -> List[dict]:
        return [
            {
                "narration": (
                    "How far does a striker actually run in a 90-minute match? You can’t just do "
                    "simple math. Why? Because a player never just stands still."
                ),
                "visual_prompt": (
                    "A messy, badly drawn pencil sketch of a football player on a white background, "
                    "looking confused with a huge question mark above their head."
                ),
            },
            {
                "narration": (
                    "They sprint, they slow down to dodge a defender, they stop, and then they "
                    "accelerate again. Their motion is always changing."
                ),
                "visual_prompt": (
                    "Stick-figure footballer running in a zig-zag path with loose graphite lines "
                    "showing chaotic speed and motion."
                ),
            },
            {
                "narration": (
                    "This is where we use Integrals. Think of an Integral as a way to put together "
                    "small, moment-to-moment snapshots to see the big picture."
                ),
                "visual_prompt": (
                    "A large, rough mathematical integral symbol drawn in heavy pencil, standing "
                    "beside a small soccer ball."
                ),
            },
            {
                "narration": (
                    "Imagine we slice the game into tiny, one-second clips. If we look at a graph of "
                    "the player's speed, these tiny clips look like thin rectangles stacked "
                    "underneath the curve."
                ),
                "visual_prompt": (
                    "Hand-drawn XY graph with a wiggly line and many thin vertical rectangles shaded "
                    "beneath the curve, like a math notebook doodle."
                ),
            },
            {
                "narration": (
                    "When we add all those thin rectangles together, we find the Area under the graph. "
                    "And that area gives us the answer: the exact total distance the player traveled."
                ),
                "visual_prompt": (
                    "The same graph, but the rectangles are scribbled in to make a solid shape with "
                    "an arrow labeled 'TOTAL DISTANCE' in handwriting."
                ),
            },
        ]


__all__ = ["SketchAnimator", "SketchSegment"]
