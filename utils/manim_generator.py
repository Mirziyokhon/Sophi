"""
Manim-based whiteboard animation generator
Creates educational animations with hand-drawn aesthetic
"""
import os
import sys
import subprocess
import tempfile
from pathlib import Path
from typing import List, Optional

# CRITICAL: Force LaTeX into PATH for all subprocesses BEFORE any Manim imports
latex_bin = r"C:\Program Files\MiKTeX\miktex\bin\x64"
os.environ['PATH'] = latex_bin + os.pathsep + os.environ.get('PATH', '')

# Verify LaTeX is accessible
try:
    result = subprocess.run(['latex', '--version'], capture_output=True, check=True, timeout=5)
    print("✅ LaTeX accessible for Manim")
except (FileNotFoundError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as e:
    print(f"❌ LaTeX still not found: {e}")
    print(f"   Expected at: {latex_bin}")
    print(f"   Manim will fail on mathematical equations")

import config

# Pre-configure LaTeX template to avoid MiKTeX on-demand package downloads
from manim import TexTemplate

# Create custom template with pre-loaded packages
LATEX_TEMPLATE = TexTemplate()
LATEX_TEMPLATE.add_to_preamble(r"""
\usepackage{amsmath}
\usepackage{amssymb}
\usepackage{amstext}
\usepackage{geometry}
\usepackage{xcolor}
""")
print("✅ LaTeX template configured with pre-loaded packages")


class ManimGenerator:
    """Generate whiteboard-style animations using Manim"""
    
    def __init__(self):
        self.temp_dir = Path(config.TEMP_DIR)
        self.temp_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_scene_script(
        self,
        text_content: str,
        visual_description: str,
        scene_number: int
    ) -> str:
        """
        Generate Manim Python script for a scene
        
        Args:
            text_content: Text to display/animate
            visual_description: Description of visual elements
            scene_number: Scene number for identification
            
        Returns:
            Path to generated Python script
        """
        # Sanitize text content - remove quotes and special characters
        safe_text = text_content[:50].replace('"', '').replace("'", '').replace('\n', ' ').replace('\\', '')
        if not safe_text.strip():
            safe_text = "Educational Content"
        
        # Create Manim scene script
        script = f'''
from manim import *

class Scene{scene_number}(Scene):
    def construct(self):
        # Set background to whiteboard color
        self.camera.background_color = "#F5F5DC"  # Beige whiteboard
        
        # Title text with hand-drawn style
        title = Text(
            "{safe_text}",
            font="Comic Sans MS",
            color=BLACK,
            font_size=36
        ).to_edge(UP)
        
        # Animate title writing
        self.play(Write(title), run_time=2)
        self.wait(0.5)
        
        # Create visual elements based on description
        {self._generate_visual_elements(visual_description)}
        
        # Hold final frame
        self.wait(1)
    
    def _create_sketchy_line(self, start, end):
        """Create a hand-drawn looking line"""
        line = Line(start, end, color=BLACK, stroke_width=3)
        line.set_stroke(opacity=0.8)
        return line
'''
        
        # Save script
        script_path = self.temp_dir / f"scene_{scene_number}.py"
        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(script)
        
        return str(script_path)
    
    def _generate_visual_elements(self, description: str) -> str:
        """
        Generate Manim code for visual elements based on description
        
        Args:
            description: Visual description from AI
            
        Returns:
            Manim Python code string
        """
        # Simple keyword-based visual generation
        code_lines = []
        
        if any(word in description.lower() for word in ['diagram', 'chart', 'graph']):
            code_lines.append('''
        # Create simple diagram
        circle = Circle(radius=1, color=BLUE, fill_opacity=0.3)
        circle.shift(DOWN * 0.5)
        self.play(Create(circle), run_time=1.5)
        
        # Add labels
        label = Text("Concept", font="Comic Sans MS", color=BLACK, font_size=24)
        label.next_to(circle, DOWN)
        self.play(Write(label), run_time=1)
''')
        
        if any(word in description.lower() for word in ['arrow', 'flow', 'process']):
            code_lines.append('''
        # Create flow arrows
        arrow1 = Arrow(LEFT * 2, RIGHT * 2, color=BLACK, stroke_width=3)
        arrow1.shift(DOWN * 1.5)
        self.play(GrowArrow(arrow1), run_time=1)
''')
        
        if any(word in description.lower() for word in ['list', 'points', 'steps']):
            code_lines.append('''
        # Create bullet points
        points = VGroup()
        for i in range(3):
            bullet = Dot(color=BLACK, radius=0.08)
            text = Text(f"Point {i+1}", font="Comic Sans MS", color=BLACK, font_size=24)
            text.next_to(bullet, RIGHT)
            point = VGroup(bullet, text)
            point.shift(DOWN * (i * 0.8 + 0.5))
            points.add(point)
        
        self.play(LaggedStart(*[Write(p) for p in points], lag_ratio=0.3), run_time=2)
''')
        
        if any(word in description.lower() for word in ['equation', 'formula', 'math']):
            code_lines.append('''
        # Create mathematical equation with Unicode (no LaTeX required!)
        equation = Text("f(x) = ax² + bx + c", font="Arial", color=BLACK, font_size=40)
        equation.shift(DOWN * 0.5)
        self.play(Write(equation), run_time=2)
''')
        
        # Default: simple shapes
        if not code_lines:
            code_lines.append('''
        # Create simple illustration
        shapes = VGroup(
            Circle(radius=0.5, color=BLUE, fill_opacity=0.3),
            Square(side_length=1, color=RED, fill_opacity=0.3),
            Triangle(color=GREEN, fill_opacity=0.3)
        ).arrange(RIGHT, buff=0.5)
        shapes.shift(DOWN * 0.5)
        
        self.play(LaggedStart(*[Create(s) for s in shapes], lag_ratio=0.3), run_time=2)
''')
        
        return '\n'.join(code_lines)
    
    def render_scene(
        self,
        script_path: str,
        scene_name: str,
        output_path: str,
        duration: float
    ) -> str:
        """
        Render Manim scene to video
        
        Args:
            script_path: Path to Manim Python script
            scene_name: Name of scene class to render
            output_path: Path to save output video
            duration: Desired duration in seconds
            
        Returns:
            Path to rendered video
        """
        try:
            # Render with Manim (use python -m manim for Windows compatibility)
            cmd = [
                'python', '-m', 'manim',
                '-ql',  # Low quality for faster rendering (use -qh for high quality)
                '--format', 'mp4',
                '--media_dir', str(self.temp_dir),
                script_path,
                scene_name
            ]
            
            print(f"  🎬 Rendering Manim scene: {scene_name}...")
            print(f"  📝 Command: {' '.join(cmd)}")
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120  # 2 minute timeout
            )
            
            print(f"\n🔍 DEBUG - Manim command result:")
            print(f"   Return code: {result.returncode}")
            print(f"   STDOUT (last 500 chars):\n{result.stdout[-500:] if result.stdout else 'None'}")
            print(f"   STDERR (last 500 chars):\n{result.stderr[-500:] if result.stderr else 'None'}")
            
            if result.returncode != 0:
                raise Exception(f"Manim rendering failed with code {result.returncode}: {result.stderr}")
            
            # Find rendered video
            media_dir = self.temp_dir / 'videos'
            rendered_files = list(media_dir.rglob('*.mp4'))
            
            if not rendered_files:
                raise Exception("No rendered video found")
            
            # Get most recent file
            latest_video = max(rendered_files, key=lambda p: p.stat().st_mtime)
            
            print(f"📹 Manim rendered video: {latest_video}")
            
            # Simply copy the Manim output - no re-encoding needed!
            # Re-encoding with MoviePy causes fps issues
            import shutil
            shutil.copy2(str(latest_video), output_path)
            
            print(f"  ✅ Manim scene rendered successfully!")
            print(f"  📁 Output: {output_path}")
            return output_path
            
        except subprocess.TimeoutExpired:
            raise Exception("Manim rendering timed out")
        except Exception as e:
            raise Exception(f"Error rendering Manim scene: {str(e)}")
    
    def generate_whiteboard_animation(
        self,
        text_content: str,
        visual_description: str,
        duration: float,
        output_path: str,
        scene_number: int
    ) -> str:
        """
        Complete pipeline to generate whiteboard animation
        
        Args:
            text_content: Text content for the scene
            visual_description: Description of visual elements
            duration: Duration in seconds
            output_path: Path to save output video
            scene_number: Scene number
            
        Returns:
            Path to generated video
        """
        try:
            print(f"\n{'='*60}")
            print(f"🎬 Manim Animation Generation - Scene {scene_number}")
            print(f"{'='*60}")
                
            # Validate inputs
            print(f"📋 Input validation:")
            print(f"   text_content: {text_content[:50] if text_content else 'None'}...")
            print(f"   visual_description: {visual_description[:50] if visual_description else 'None'}...")
            print(f"   duration: {duration} (type: {type(duration).__name__})")
            print(f"   output_path: {output_path}")
                
            if duration is None or duration <= 0:
                print(f"⚠️  Invalid duration: {duration}, using default 5 seconds")
                duration = 5.0
                
            if not text_content or not text_content.strip():
                print(f"⚠️  Empty text content, using placeholder")
                text_content = "Educational content"
                
            # Generate Manim script
            print(f"\n📝 Step 1: Generating Manim script...")
            script_path = self.generate_scene_script(
                text_content,
                visual_description,
                scene_number
            )
            print(f"✅ Script generated: {script_path}")
                
            # Render scene
            print(f"\n🎥 Step 2: Rendering scene...")
            scene_name = f"Scene{scene_number}"
            print(f"   Scene name: {scene_name}")
            print(f"   Duration: {duration}s")
                
            video_path = self.render_scene(
                script_path,
                scene_name,
                output_path,
                duration
            )
                
            print(f"✅ Video rendered: {video_path}")
            print(f"{'='*60}\n")
                
            return video_path
                
        except Exception as e:
            print(f"\n❌ MANIM ERROR:")
            print(f"   Error type: {type(e).__name__}")
            print(f"   Error message: {str(e)}")
            import traceback
            print(f"   Traceback:")
            traceback.print_exc()
            raise Exception(f"Error generating Manim animation: {str(e)}")
