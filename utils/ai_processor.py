"""
AI processing for content summarization and personalization
"""
import google.generativeai as genai
from typing import Optional, Dict
import json
import time
import random
import re
import textwrap
import config
from utils.math_glyph_helper import MathGlyphHelper


class RateLimitError(Exception):
    """Raised when the upstream LLM keeps throttling requests."""


class AIProcessor:
    """Handle AI-powered content processing"""

    def __init__(self):
        if not config.GEMINI_API_KEY:
            raise ValueError("Gemini API key not configured")
        genai.configure(api_key=config.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        try:
            self.math_helper = MathGlyphHelper()
        except Exception:
            self.math_helper = None
    
    def _generate_with_retry(self, prompt: str, max_retries: int = 5) -> str:
        """Call Gemini model with exponential backoff and jitter."""
        base_wait = 2
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                return response.text.strip()
            except Exception as e:
                error_str = str(e)
                is_rate_limit = any(
                    marker in error_str.lower()
                    for marker in ["429", "rate limit", "resource exhausted"]
                )
                if not is_rate_limit:
                    raise

                if attempt == max_retries - 1:
                    raise RateLimitError(
                        f"Rate limit exceeded after {max_retries} retries. Please wait a few minutes and try again."
                    )

                wait_time = (base_wait * (2 ** attempt)) + random.uniform(0.5, 1.5)
                print(
                    f"⏳ Rate limit hit, waiting {wait_time:.1f} seconds before retry {attempt + 2}/{max_retries}..."
                )
                time.sleep(wait_time)

    def _fallback_interest_profile(self, interest_description: str) -> str:
        # Check if user selected "No Interest" option
        if interest_description.strip() == "No Interest":
            return """Core Themes: Simple, clear explanations with universal understanding. 
Key Concepts: Everyday analogies, practical applications, and real-life situations that make complex topics accessible to everyone. 
Learning Style: Direct, straightforward explanations using common experiences and simple examples anyone can relate to."""
        
        interest = interest_description.strip() or "general curiosity"
        return (
            f"Core Themes: {interest}. "
            "Key Concepts: relatable analogies, motivational hooks, and real-world wins tied to the topic. "
            "Learning Style: conversational explanations with short action steps and vivid storytelling."
        )

    def _fallback_summary(self, text: str) -> Dict[str, str]:
        cleaned = text.strip()
        if not cleaned:
            return {
                'summary': 'No content provided. Prompt the learner to add study notes.',
                'key_points': [],
                'takeaway': ''
            }

        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', cleaned) if s.strip()]
        summary = ' '.join(sentences[:2]) if sentences else cleaned[:200]
        key_points = sentences[2:7]
        if not key_points and cleaned:
            key_points = [cleaned[:150]]
        takeaway = sentences[-1] if sentences else "Stay curious and keep exploring."
        return {
            'summary': summary or cleaned[:200],
            'key_points': key_points,
            'takeaway': takeaway
        }

    def _fallback_script(self, summary_data: Dict[str, str], interest_profile: str, target_duration: int) -> Dict[str, list]:
        """Create a simple structured script when the LLM fails."""
        hook = summary_data['summary'] or "Let's break this topic down."
        points = summary_data['key_points'] or [hook]
        takeaway = summary_data['takeaway'] or "You've got this—apply it today!"

        script_sections = []
        scenes = []

        scene_visuals = [
            "Wide shot of the sun pouring golden light onto leaves, chloroplasts glowing softly inside cells",
            "Macro view inside a leaf showing chloroplasts mixing sunlight, water, and carbon dioxide",
            "Diagram of glucose traveling through the plant while oxygen bubbles drift upward"
        ]

        for idx, point in enumerate(points[:3]):
            narration = f"{hook if idx == 0 else ''} {point}."
            narration = narration.strip()
            script_sections.append(narration)
            visual_prompt = scene_visuals[idx] if idx < len(scene_visuals) else f"Illustrate {point} with real-world plant imagery"
            scenes.append({
                'scene_id': idx + 1,
                'narration': narration,
                'visual_prompt': visual_prompt
            })

        script_sections.append(takeaway)

        return {
            'script': ' '.join(script_sections).strip(),
            'scenes': scenes
        }

    def _clean_script_text(self, script: str) -> str:
        script = self._strip_code_fences(script)
        script = script.strip()
        script = re.sub(r'\[.*?\]', '', script)
        script = re.sub(r'\(.*?\)', '', script)
        script = re.sub(r'(?i)(visual:|scene:|animation:|shows?:|displays?:)[^\n]*', '', script)
        script = re.sub(r'\s+', ' ', script)
        return script.strip()

    def _strip_code_fences(self, text: str) -> str:
        if not text:
            return ""
        text = text.strip()
        fenced_match = re.match(r"```(?:json)?\s*(.*?)\s*```", text, flags=re.S)
        if fenced_match:
            return fenced_match.group(1).strip()
        return text.replace('```json', '').replace('```', '').strip()

    def _dedupe_sentences(self, text: str) -> str:
        if not text:
            return ""
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
        seen = set()
        unique = []
        for sentence in sentences:
            normalized = sentence.lower()
            if normalized in seen:
                continue
            seen.add(normalized)
            unique.append(sentence)
        return ' '.join(unique)

    def _fallback_visual_prompts(self, script: str, num_scenes: int) -> list[str]:
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', script) if s.strip()]
        if not sentences:
            sentences = ["Show dynamic chalkboard sketches explaining the concept."]
        chunk_size = max(1, len(sentences) // num_scenes)
        prompts = []
        for i in range(num_scenes):
            chunk = sentences[i * chunk_size:(i + 1) * chunk_size]
            if not chunk:
                chunk = sentences[-chunk_size:]
            prompts.append(
                f"Scene {i + 1}: Illustrate {', '.join(chunk)} with energetic whiteboard animation."
            )
        return prompts[:num_scenes]

    
    def enhance_interest_profile(self, interest_description: str) -> str:
        """
        Enhance user's interest description into structured learning profile
        
        Args:
            interest_description: User's interest description
            
        Returns:
            Enhanced and structured interest profile
        """
        # Check if user selected "No Interest" option
        if interest_description.strip() == "No Interest":
            return """Core Themes: Simple, clear explanations with universal understanding. 
Key Concepts: Everyday analogies, practical applications, and real-life situations that make complex topics accessible to everyone. 
Learning Style: Direct, straightforward explanations using common experiences and simple examples anyone can relate to."""
        
        prompt = f"""You are a learning personalization expert. A student has described their interest as:

"{interest_description}"

Create a structured learning profile that identifies:
1. Core interest themes
2. Key concepts they care about
3. Analogies and metaphors that would resonate
4. Learning style preferences

Keep it concise (2-3 sentences) and actionable for creating personalized educational content.

Enhanced Profile:"""

        try:
            return self._generate_with_retry(prompt)
        except RateLimitError as e:
            print("⚠️ Gemini rate limit for interest profile. Using fallback profile.")
            return self._fallback_interest_profile(interest_description)
        except Exception as e:
            raise Exception(f"Error enhancing interest profile: {str(e)}")
    
    def summarize_content(self, text: str, target_duration: int) -> Dict[str, str]:
        """
        Summarize content and extract key learning objectives
        
        Args:
            text: Input text to summarize
            target_duration: Target video duration in seconds
            
        Returns:
            Dictionary with summary and key concepts
        """
        # Calculate approximate word count for script based on duration
        # Average speaking rate: 150 words per minute
        target_words = int((target_duration / 60) * 150)
        
        prompt = f"""Analyze this learning content and create a concise summary suitable for a {target_duration}-second educational video.

Content:
{text[:4000]}  # Limit to avoid token limits

Create:
1. A clear summary of the main concept (2-3 sentences)
2. 3-5 key learning points
3. One memorable takeaway

Target length: approximately {target_words} words total.

Format your response as:
SUMMARY: [summary]
KEY POINTS:
- [point 1]
- [point 2]
- [point 3]
TAKEAWAY: [memorable conclusion]"""

        try:
            content = self._generate_with_retry(prompt)
            
            # Parse the response
            summary = ""
            key_points = []
            takeaway = ""
            
            sections = content.split('\n')
            current_section = None
            
            for line in sections:
                line = line.strip()
                if line.startswith('SUMMARY:'):
                    current_section = 'summary'
                    summary = line.replace('SUMMARY:', '').strip()
                elif line.startswith('KEY POINTS:'):
                    current_section = 'points'
                elif line.startswith('TAKEAWAY:'):
                    current_section = 'takeaway'
                    takeaway = line.replace('TAKEAWAY:', '').strip()
                elif line.startswith('-') and current_section == 'points':
                    key_points.append(line.lstrip('- ').strip())
                elif current_section == 'summary' and line:
                    summary += ' ' + line
                elif current_section == 'takeaway' and line:
                    takeaway += ' ' + line
            
            return {
                'summary': summary.strip(),
                'key_points': key_points,
                'takeaway': takeaway.strip()
            }
        except RateLimitError:
            print("⚠️ Gemini rate limit for summarization. Using heuristic summary.")
            return self._fallback_summary(text)
        except Exception as e:
            raise Exception(f"Error summarizing content: {str(e)}")
    
    def personalize_content(self, summary_data: Dict[str, str], interest_profile: str, target_duration: int) -> Dict[str, list]:
        """
        Personalize content using user's interest profile
        
        Args:
            summary_data: Summarized content data
            interest_profile: User's enhanced interest profile
            target_duration: Target video duration in seconds
            
        Returns:
            Personalized script for video narration
        """
        target_words = int((target_duration / 60) * 150)
        
        scene_json_example = """{
  "script": "Full voiceover text joining every scene together with smooth transitions.",
  "scenes": [
    {
      "scene_id": 1,
      "timestamp": "0-10s",
      "narration": "Only the lines spoken during this beat (no repetition).",
      "visual_prompt": "Specific visual: e.g., macro shot of sunlight pouring into chloroplasts inside a leaf."
    }
  ]
}"""

        prompt = f"""You are an educational storyteller and art director. Create an engaging {target_duration}-second narration AND a scene-by-scene visual plan.

CONTENT SUMMARY:
{summary_data['summary']}

KEY POINTS:
{chr(10).join('- ' + point for point in summary_data['key_points'])}

TAKEAWAY:
{summary_data['takeaway']}

STUDENT'S INTERESTS:
{interest_profile}

Create a narration that:
1. Opens with a vivid hook tied to the student's interests
2. Introduces new information every sentence (no repetition or looping)
3. Highlights what the viewer should be picturing each moment (sunlight hitting leaves, close-ups of plant cells, energy transfer, etc.)
4. Ends with an inspiring call-to-action tied to the takeaway

Then break the narration into a JSON document with this exact shape:
```
{scene_json_example}
```

Guidelines for scenes:
- The visual prompt must describe realistic subject-matter (plants, sunlight, cells, molecules) and avoid abstract shapes unless necessary.
- Each scene should focus on a different moment of the process (light capture, chemical reactions, energy storage, real-world impact, etc.).
- Ensure scene narration segments do not repeat sentences from previous scenes.

Return ONLY the JSON (no markdown, no commentary)."""

        try:
            raw_response = self._generate_with_retry(prompt)
            clean_response = self._strip_code_fences(raw_response)
            structured = None
            try:
                structured = json.loads(clean_response)
            except json.JSONDecodeError:
                cleaned = self._clean_script_text(raw_response)
                structured = {
                    'script': cleaned,
                    'scenes': []
                }

            if not isinstance(structured, dict):
                structured = {'script': str(structured), 'scenes': []}

            narration_segments = [scene.get('narration', '') for scene in structured.get('scenes', []) if scene.get('narration')]
            if narration_segments:
                structured['script'] = ' '.join(narration_segments)
            structured['script'] = self._clean_script_text(structured.get('script', ''))
            structured['script'] = self._dedupe_sentences(structured['script'])

            # Normalize scenes
            normalized_scenes = []
            for idx, scene in enumerate(structured.get('scenes', []), start=1):
                narration = self._clean_script_text(scene.get('narration', ''))
                if not narration:
                    continue
                visual_prompt = scene.get('visual_prompt') or "Use concrete imagery of the concept in action"
                normalized_scenes.append({
                    'scene_id': scene.get('scene_id', idx),
                    'timestamp': scene.get('timestamp', ''),
                    'narration': narration,
                    'visual_prompt': visual_prompt.strip()
                })

            structured['scenes'] = normalized_scenes
            if not structured['scenes'] and structured.get('script'):
                structured['scenes'] = [
                    {
                        'scene_id': 1,
                        'narration': structured['script'],
                        'visual_prompt': structured['script']
                    }
                ]
            return structured
        except RateLimitError:
            print("⚠️ Gemini rate limit for script. Using template-based narration.")
            return self._fallback_script(summary_data, interest_profile, target_duration)
        except Exception as e:
            raise Exception(f"Error personalizing content: {str(e)}")
    
    def generate_video_prompts(self, script: str, num_scenes: int = 4) -> list[str]:
        """
        Generate visual prompts for animation based on script
        
        Args:
            script: Video script
            num_scenes: Number of visual scenes to generate
            
        Returns:
            List of visual prompts for animation
        """
        prompt = f"""Based on this educational video script, create {num_scenes} visual scene descriptions for animation.

SCRIPT:
{script}

For each scene, describe:
- Visual elements (characters, objects, settings)
- Animation style (modern, colorful, engaging)
- Key actions or transitions

Keep each description to 1-2 sentences, suitable for AI animation generation.

Format as:
SCENE 1: [description]
SCENE 2: [description]
etc."""

        try:
            content = self._generate_with_retry(prompt)
            
            # Parse scenes
            scenes = []
            for line in content.split('\n'):
                if line.strip().startswith('SCENE'):
                    scene_desc = line.split(':', 1)[1].strip() if ':' in line else line
                    scenes.append(scene_desc)
            
            return scenes[:num_scenes]
        except RateLimitError:
            print("⚠️ Gemini rate limit for visual prompts. Using scripted fallback prompts.")
            return self._fallback_visual_prompts(script, num_scenes)
        except Exception as e:
            raise Exception(f"Error generating visual prompts: {str(e)}")

    def generate_sketch_html(
        self,
        original_text: str,
        processed_content: Dict,
        duration_seconds: int,
        interest_description: str
    ) -> str:
        """Ask Gemini for the full HTML5 sketch animation application."""
        scenes = processed_content.get('scene_details') or []
        script_text = processed_content.get('script', '')
        summary = processed_content.get('summary', '')
        key_points = processed_content.get('key_points', [])
        math_terms = self._detect_math_expressions(scenes, script_text)
        math_sprites = {}
        if self.math_helper and math_terms:
            try:
                math_sprites = self.math_helper.generate_glyphs(math_terms)
            except Exception:
                math_sprites = {}

        key_point_lines = '\n'.join(f"- {point}" for point in key_points)
        scene_json = json.dumps(scenes[:10], indent=2, ensure_ascii=False)
        truncated_source = textwrap.shorten(original_text or '', width=2000, placeholder=' ...')
        math_sprite_json = json.dumps(math_sprites, ensure_ascii=False)

        advanced_prompt = f"""
ROLE: You are the "Executive Producer" and "Creative Content Pipeline Manager." Your output MUST be a single, complete HTML5 Sketch Animation application that visually explains the learner's topic. You silently perform the required analysis pipeline but only return the final HTML.

MANDATORY FOUR-STAGE PIPELINE (complete internally, never print stages):
• Stage 1 – Foundational Analysis: extract 5-8 essential bullet points from the topic and name the audience/grade level.
• Stage 2 – Interest & Analogy Mapping: {"if the interest description is 'No Interest', choose simple, everyday analogies and practical applications that anyone can understand. Use common life situations and real-world examples. Otherwise, choose a vivid analogy that aligns with the learner's interest description"} and fuse it with Stage 1 points to form the hook.
• Stage 3 – Scene Grid: divide the total duration (default {duration_seconds}s unless overridden) into exactly sequential scenes (≈5s each). For every scene craft (a) a narration sentence that flows from previous beats and (b) a VERY THOROUGH visual instruction describing motions, props, and stick-figure poses.
• Stage 4 – Code Integration: convert the scene grid into the narration array (timestamps + text) and into explicit if/else if blocks inside renderScene(...) so each time window renders unique visuals.

CRITICAL SCENE ASSIGNMENT RULES:
- Each narration line MUST be assigned to exactly one 5-second scene
- Scene duration = total duration ÷ number of narration lines (minimum 5 seconds per scene)
- Each scene's visual description MUST be derived from and directly illustrate its assigned narration line
- Visual descriptions must be EXTREMELY detailed: specify exact positions, colors, movements, transitions, stick-figure poses, and animation timing

VERY THOROUGH VISUAL DESCRIPTION REQUIREMENTS:
For each scene, describe:
1. Opening state (what's visible when scene starts)
2. Main animation sequence (what moves, appears, or transforms)
3. Stick-figure actions (idle, thinking, running, pointing, writing, etc.)
4. Color scheme and visual style for that scene
5. Specific objects/shapes and their positions
6. Motion paths and timing (e.g., "moves from left to right over 2 seconds")
7. Ending state (what's visible when scene ends)
8. Transitions to next scene

Example of thorough visual description:
"Scene opens with a stick-figure standing at left in blue color. Over 3 seconds, the stick-figure walks to center while a large green circle grows from small to large at position (400, 200). The stick-figure points at the circle with right arm raised. Yellow particles float upward from bottom to top over 2 seconds. Scene ends with stick-figure at center pointing at the fully grown circle."

SPECIAL INSTRUCTIONS FOR "NO INTEREST" OPTION:
If interest description is "No Interest":
- Use the simplest possible language and explanations
- Choose analogies from everyday life: cooking, driving, shopping, household chores, weather, nature, school activities
- Focus on practical applications anyone can understand
- Avoid technical jargon or specialized knowledge
- Use common objects and situations everyone experiences
- Make it universally accessible regardless of background or interests

TECH + QUALITY REQUIREMENTS (non-negotiable):
1. Paper background (#fffcf5) and 'Patrick Hand' font via Google Fonts.
2. Implement roughLine(x1,y1,x2,y2,color) with noticeable wobble (use Math.random()*3) and drawStickFigure(x,y,pose,scale,color) supporting idle / thinking / running / pointing / writing poses that match narration verbs.
3. Canvas must be 1920×1080 and the animation loop must use requestAnimationFrame with a dt accumulator to respect the selected duration precisely.
4. Provide narration array timestamps from the scene grid so subtitles remain synchronized.
5. Layout: everything (canvas, subtitles/lyrics, controls, duration slider) must fit inside a single 16:9 frame. Keep subtitles immediately above a compact bottom control strip that includes Play/Pause, a timeline slider, timecode label, duration slider (30–180s, default {duration_seconds}s), and an Export Video button.
6. Implement Export Video using canvas.captureStream(24) + MediaRecorder to download a .webm file (toggle button text between "Export Video" and "Stop Export").
7. No external drawing libraries (no rough.js). Only vanilla JS + Canvas.
8. renderScene(...) must contain explicit conditional windows (if/else if) bound to the scene schedule so the visuals never stall.
9. Visual design must feel vibrant and diverse—mix lively colors, props, particles, and motion so scenes never degrade into plain squares or static text. Do not print literal headings such as "html" above the canvas.
10. The animation must be fully functional: subtitles and buttons remain visible, controls respond, and the Export button captures canvas.captureStream(24) so learners get a downloadable .webm.
11. Return a COMPLETE HTML document beginning with <!DOCTYPE html>. No Markdown fences, comments, or explanations.
12. Each scene's visual content MUST directly illustrate its assigned narration line - no generic or unrelated visuals.

CONTENT CONTEXT FOR YOUR PIPELINE:
Interest description: {interest_description}
Summary: {summary}
Key points:\n{key_point_lines}
Scene plan JSON:\n{scene_json}
Detected math expressions to highlight: {json.dumps(math_terms, ensure_ascii=False)}
Math glyph sprites (base64 PNG). If empty, ignore. Otherwise declare `const mathGlyphSprites = {math_sprite_json}` and draw them via `ctx.drawImage` when showing equations.
Original learner input (truncated): {truncated_source}

Silently execute all four stages, then output only the final HTML5 Sketch Animation that satisfies every requirement above.
        """

        try:
            html = self._generate_with_retry(advanced_prompt)
            html = self._strip_code_fences(html)
            if "<!DOCTYPE html" not in html:
                raise ValueError("Gemini did not return HTML")
            return html
        except Exception as e:
            print(f"⚠️ Gemini HTML generation failed: {e}")
            return self._build_fallback_html(processed_content, duration_seconds)

    def _detect_math_expressions(self, scenes: list, script_text: str) -> list[str]:
        """Extract simple math-like expressions for optional highlighting."""
        candidates = []
        for scene in scenes:
            for field in ('narration', 'visual_prompt'):
                value = scene.get(field)
                if value:
                    candidates.append(value)
        if script_text:
            candidates.append(script_text)

        if not candidates:
            return []

        combined = ' '.join(candidates)
        expr_pattern = re.compile(r"([A-Za-z0-9\\s]+[=∑∫≈<>]+[A-Za-z0-9\\s\\^\\*/\\+\\-]+)")
        expressions = []
        for match in expr_pattern.findall(combined):
            cleaned = match.strip()
            if 3 < len(cleaned) <= 80:
                expressions.append(cleaned)

        return expressions[:5]

    def _build_fallback_html(self, processed_content: Dict, duration_seconds: int) -> str:
        """Produce deterministic HTML when Gemini is unavailable."""
        scenes = processed_content.get('scene_details') or []
        if not scenes:
            key_points = processed_content.get('key_points') or []
            scenes = [
                {
                    'narration': kp,
                    'visual_prompt': kp
                }
                for kp in key_points[:6]
            ] or [
                {
                    'narration': processed_content.get('summary', 'Keep learning!'),
                    'visual_prompt': 'Hand-drawn figures explaining the topic'
                }
            ]

        beats = 12
        total_duration = duration_seconds or 60
        source_items = scenes or [{'narration': 'Keep learning!', 'visual_prompt': 'Hand-drawn figures explaining the topic'}]
        scene_plan = []
        for i in range(beats):
            src = source_items[i % len(source_items)]
            start_ratio = i / beats
            end_ratio = (i + 1) / beats
            scene_plan.append({
                'id': i + 1,
                'start_ratio': round(start_ratio, 4),
                'end_ratio': round(end_ratio, 4),
                'narration': src.get('narration', f"Scene {i + 1}"),
                'visual': src.get('visual_prompt') or src.get('narration', f"Scene {i + 1}")
            })

        scene_plan_json = json.dumps(scene_plan, ensure_ascii=False)
        total_duration_label = f"{total_duration // 60}:{str(total_duration % 60).zfill(2)}"

        return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Sketch Animation Preview</title>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap" rel="stylesheet">
  <style>
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f0f0f0;
      font-family: 'Patrick Hand', cursive;
      color: #333;
    }}
    #player {{
      background: #fff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 18px 45px rgba(0,0,0,0.12);
      width: 900px;
      max-width: 95vw;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }}
    #canvas-wrap {{
      position: relative;
      border: 2px solid #333;
      border-radius: 6px;
      background: #fffcf5;
    }}
    canvas {{
      display: block;
      width: 100%;
      height: auto;
      border-radius: 4px;
    }}
    .scene-indicator {{
      position: absolute;
      top: 12px;
      left: 12px;
      font-size: 1rem;
      padding: 4px 10px;
      border-radius: 12px;
      background: rgba(255,255,255,0.9);
      border: 1px solid #999;
    }}
    #subtitles {{
      padding: 16px;
      background: #ededed;
      border-radius: 6px;
      border-left: 5px solid #333;
      min-height: 3.2rem;
      font-size: 1.3rem;
      line-height: 1.35;
      text-align: center;
    }}
    #controls {{
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      padding: 12px;
      background: #f8f8f8;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
    }}
    #controls button {{
      font-family: inherit;
      font-size: 1.05rem;
      padding: 8px 18px;
      border: none;
      border-radius: 4px;
      background: #333;
      color: #fff;
      cursor: pointer;
      transition: background 0.2s;
    }}
    #controls button:hover {{ background: #555; }}
    #controls button.recording {{
      background: #c0392b;
      animation: pulse 1.4s infinite;
    }}
    #scrubber {{ flex: 1 1 280px; }}
    #time-display {{ min-width: 110px; text-align: right; font-size: 1rem; }}
    .duration-field {{ display: flex; align-items: center; gap: 6px; font-size: 0.95rem; }}
    @keyframes pulse {{
      0% {{ transform: scale(1); }}
      50% {{ transform: scale(1.05); }}
      100% {{ transform: scale(1); }}
    }}
  </style>
</head>
<body>
  <div id="player">
    <div id="canvas-wrap">
      <canvas id="animCanvas" width="960" height="540"></canvas>
      <div class="scene-indicator" id="sceneLabel">Scene 1</div>
    </div>
    <div id="subtitles">Preparing narration…</div>
    <div id="controls">
      <button id="btnPlayPause">Pause</button>
      <input type="range" id="scrubber" min="0" max="{total_duration}" step="0.01" value="0">
      <span id="time-display">0:00 / {total_duration_label}</span>
      <div class="duration-field">
        <label for="durationSlider">Len</label>
        <input type="range" id="durationSlider" min="30" max="180" step="10" value="{total_duration}">
        <span id="durationLabel">{total_duration}s</span>
      </div>
      <button id="btnExport">Export Video</button>
    </div>
  </div>
  <script>
    const scenePlan = {scene_plan_json};
    let totalDuration = {total_duration};
    let narration = buildNarration(totalDuration);
    const canvas = document.getElementById('animCanvas');
    const ctx = canvas.getContext('2d');
    const subtitleBox = document.getElementById('subtitles');
    const sceneLabel = document.getElementById('sceneLabel');
    const btnPlayPause = document.getElementById('btnPlayPause');
    const scrubber = document.getElementById('scrubber');
    const timeDisplay = document.getElementById('time-display');
    const btnExport = document.getElementById('btnExport');
    const durationSlider = document.getElementById('durationSlider');
    const durationLabel = document.getElementById('durationLabel');

    function buildNarration(duration) {{
      return scenePlan.map(scene => ({ t: Number((scene.start_ratio * duration).toFixed(2)), text: scene.narration }));
    }}

    function formatTime(seconds) {{
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
      return `${{mins}}:${{secs}}`;
    }}

    function roughLine(x1, y1, x2, y2, color = '#333') {{
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1 + (Math.random() - 0.5) * 3, y1 + (Math.random() - 0.5) * 3);
      ctx.lineTo(x2 + (Math.random() - 0.5) * 3, y2 + (Math.random() - 0.5) * 3);
      ctx.stroke();
      ctx.restore();
    }}

    function drawStickFigure(x, y, pose = 'idle', scale = 1, color = '#333') {{
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y - 45 * scale, 14 * scale, 0, Math.PI * 2);
      ctx.stroke();
      roughLine(x, y - 25 * scale, x, y + 30 * scale, color);
      if (pose === 'running') {{
        roughLine(x, y - 5 * scale, x - 30 * scale, y - 10 * scale, color);
        roughLine(x, y - 5 * scale, x + 30 * scale, y + 10 * scale, color);
      }} else if (pose === 'thinking') {{
        roughLine(x, y - 5 * scale, x - 28 * scale, y - 15 * scale, color);
        roughLine(x, y - 5 * scale, x + 18 * scale, y + 5 * scale, color);
      }} else {{
        roughLine(x, y - 5 * scale, x - 24 * scale, y - 6 * scale, color);
        roughLine(x, y - 5 * scale, x + 24 * scale, y - 6 * scale, color);
      }}
      roughLine(x, y + 30 * scale, x - 15 * scale, y + 65 * scale, color);
      roughLine(x, y + 30 * scale, x + 15 * scale, y + 65 * scale, color);
      ctx.restore();
    }}

    function renderScene(time) {{
      ctx.fillStyle = '#fffcf5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const active = scenePlan.find(scene => time >= scene.start_ratio * totalDuration && time < scene.end_ratio * totalDuration) || scenePlan[scenePlan.length - 1];
      if (!active) return;
      const index = active.id - 1;
      const progress = (time - active.start_ratio * totalDuration) / Math.max((active.end_ratio - active.start_ratio) * totalDuration, 0.0001);
      ctx.fillStyle = ['#f9d5e5','#cfe0e8','#f7f4ea','#b5e7a0'][index % 4];
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#333';
      ctx.font = "30px 'Patrick Hand'";
      ctx.fillText(active.visual, 40, 60, canvas.width - 80);
      const baseX = 160 + (index % 4) * 120;
      const baseY = 260 + (index % 3) * 40;
      const pose = progress > 0.65 ? 'running' : progress > 0.3 ? 'thinking' : 'idle';
      drawStickFigure(baseX, baseY, pose, 1 + progress * 0.3);
      roughLine(80, 360, 720, 360, '#555');
      roughLine(80, 220 + Math.sin(progress * Math.PI * 2) * 80, 720, 260, '#c0392b');
      sceneLabel.textContent = `Scene ${active.id}`;
    }}

    let isPlaying = true;
    let currentTime = 0;
    let lastTimestamp = 0;
    let mediaRecorder = null;
    let recordedChunks = [];

    function updateUI() {{
      const activeLine = narration.reduce((line, entry) => entry.t <= currentTime ? entry.text : line, narration[0]?.text || '');
      subtitleBox.textContent = activeLine || '…';
      timeDisplay.textContent = `${{formatTime(currentTime)}} / ${{formatTime(totalDuration)}}`;
      scrubber.value = currentTime.toFixed(2); // Sync scrubber to currentTime
    }}
    function loop(timestamp) {{
      if (!lastTimestamp) lastTimestamp = timestamp;
      const dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      
      // CORE SYNC POINT 1: Animation Loop (The Constant Time Writer)
      if (isPlaying) {{
        currentTime += dt; // The core update using delta time
        if (currentTime >= totalDuration) {{
          currentTime = totalDuration;
          isPlaying = false;
          btnPlayPause.textContent = 'Replay';
          if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
        }}
      }}
      
      renderScene(currentTime); // Renders based on currentTime
      updateUI(); // Updates scrubber and time display
      requestAnimationFrame(loop);
    }}

    // CORE SYNC POINT 2: Play/Pause Button (The State Toggle)
    btnPlayPause.addEventListener('click', () => {{
      if (currentTime >= totalDuration) currentTime = 0;
      isPlaying = !isPlaying; // Toggle state only
      btnPlayPause.textContent = isPlaying ? 'Pause' : 'Play';
      lastTimestamp = 0;
    }});

    // CORE SYNC POINT 3: Scrubber (The Time Override)
    scrubber.addEventListener('input', (event) => {{
      currentTime = parseFloat(event.target.value) || 0; // Direct time jump
      isPlaying = false; // Stop playback
      btnPlayPause.textContent = 'Play';
      renderScene(currentTime); // Force immediate redraw
      updateUI(); // Update all UI elements
    }});

    durationSlider.addEventListener('input', (event) => {{
      totalDuration = parseInt(event.target.value, 10);
      durationLabel.textContent = `${{totalDuration}}s`;
      narration = buildNarration(totalDuration);
      currentTime = Math.min(currentTime, totalDuration);
      scrubber.max = totalDuration;
      updateUI();
    }});

    btnExport.addEventListener('click', () => {{
      if (mediaRecorder && mediaRecorder.state === 'recording') {{
        mediaRecorder.stop();
        return;
      }}
      recordedChunks = [];
      btnExport.textContent = 'Recording…';
      btnExport.classList.add('recording');
      const stream = canvas.captureStream(24);
      mediaRecorder = new MediaRecorder(stream, {{ mimeType: 'video/webm; codecs=vp9' }});
      mediaRecorder.ondataavailable = (evt) => {{ if (evt.data.size > 0) recordedChunks.push(evt.data); }};
      mediaRecorder.onstop = () => {{
        const blob = new Blob(recordedChunks, {{ type: 'video/webm' }});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sketch_animation.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        btnExport.textContent = 'Export Video';
        btnExport.classList.remove('recording');
      }};
      mediaRecorder.start();
    }});

    // Listen for messages from parent window
    window.addEventListener('message', (event) => {{
      console.log('Received message:', event.data);
      if (event.data.action === 'play') {{
        console.log('Playing animation');
        if (currentTime >= totalDuration) currentTime = 0;
        isPlaying = true;
        btnPlayPause.textContent = 'Pause';
        lastTimestamp = 0;
        updateUI();
      }} else if (event.data.action === 'pause') {{
        console.log('Pausing animation');
        isPlaying = false;
        btnPlayPause.textContent = 'Play';
        updateUI();
      }} else if (event.data.action === 'seek') {{
        console.log('Seeking to:', event.data.data);
        currentTime = Math.max(0, Math.min(totalDuration, event.data.data || 0));
        isPlaying = false;
        btnPlayPause.textContent = 'Play';
        renderScene(currentTime);
        updateUI();
      }} else if (event.data.action === 'sync') {{
        console.log('Sync request - sending current state');
        sendUpdateToParent();
      }} else if (event.data.action === 'export') {{
        btnExport.click();
      }}
    }});

    // Send updates to parent window
    function sendUpdateToParent() {{
      if (window.parent && window.parent !== window) {{
        window.parent.postMessage({{
          type: 'animationUpdate',
          currentTime: currentTime,
          duration: totalDuration,
          isPlaying: isPlaying
        }}, '*');
      }}
    }}

    // Update the existing updateUI function to also send to parent
    const originalUpdateUI = updateUI;
    updateUI = function() {{
      originalUpdateUI();
      sendUpdateToParent();
    }};

    requestAnimationFrame(loop);
  </script>
</body>
</html>"""

    def process_content(self, text: str, interest_profile: str, target_duration: int) -> Dict:
        """Process and personalize content for downstream animation generation."""
        summary_data = self.summarize_content(text, target_duration)
        script_bundle = self.personalize_content(summary_data, interest_profile, target_duration)
        script_text = script_bundle.get('script', '')
        scene_details = script_bundle.get('scenes', [])

        num_scenes = max(3, target_duration // 10)
        visual_prompts = list(script_bundle.get('visual_prompts') or [])

        if len(visual_prompts) < num_scenes:
            auto_prompts = self.generate_video_prompts(script_text, num_scenes)
            for prompt in auto_prompts:
                if len(visual_prompts) >= num_scenes:
                    break
                visual_prompts.append(prompt)

        if len(visual_prompts) < num_scenes:
            fallback_prompts = self._fallback_visual_prompts(script_text, num_scenes)
            needed = num_scenes - len(visual_prompts)
            visual_prompts.extend(fallback_prompts[:needed])

        visual_prompts = visual_prompts[:num_scenes] if visual_prompts else self._fallback_visual_prompts(script_text, num_scenes)
        script_text = self._dedupe_sentences(script_text)

        return {
            'summary': summary_data['summary'],
            'key_points': summary_data['key_points'],
            'takeaway': summary_data['takeaway'],
            'script': script_text,
            'visual_prompts': visual_prompts,
            'scene_details': scene_details,
            'duration': target_duration
        }
