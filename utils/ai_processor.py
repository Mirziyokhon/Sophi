"""
AI processing for content summarization and personalization
"""
import google.generativeai as genai
from typing import Optional, Dict, List
import json
import time
import random
import re
import textwrap
import asyncio
import math
import base64
import edge_tts
from pathlib import Path
import config
from moviepy.editor import AudioClip, AudioFileClip, concatenate_audioclips
from utils.math_glyph_helper import MathGlyphHelper
from utils.cache_manager import AnimationCache
from utils.queue_handler import RateLimitHandler


class RateLimitError(Exception):
    """Raised when the upstream LLM keeps throttling requests."""


class AIProcessor:
    """Handle AI-powered content processing"""

    def __init__(self):
        if not config.GEMINI_API_KEY:
            raise ValueError("Gemini API key not configured")
        genai.configure(api_key=config.GEMINI_API_KEY)
        # Use Gemini 3 Pro for superior quality and reasoning
        self.model = genai.GenerativeModel('gemini-3-pro-preview')
        self.html_model = genai.GenerativeModel('gemini-3-pro-preview')
        try:
            self.math_helper = MathGlyphHelper()
        except Exception:
            self.math_helper = None
        
        # Initialize cache and rate limit handler
        self.cache = AnimationCache()
        self.rate_limiter = RateLimitHandler()
    
    def _generate_with_retry(self, prompt: str, max_retries: int = 5) -> str:
        """Call Gemini model with exponential backoff using RateLimitHandler."""
        def _api_call():
            response = self.model.generate_content(prompt)
            return response.text.strip()
        
        try:
            return self.rate_limiter.call_with_retry(_api_call, max_retries=max_retries)
        except Exception as e:
            error_str = str(e)
            is_rate_limit = any(
                marker in error_str.lower()
                for marker in ["429", "rate limit", "resource exhausted", "quota"]
            )
            if is_rate_limit:
                raise RateLimitError(
                    f"Rate limit exceeded after {max_retries} retries. Please wait a few minutes and try again."
                )
            raise

    def _get_mock_processed_content(self, text: str, duration: int) -> Dict:
        """Return mock processed content for testing without API calls."""
        print("🧪 MOCK DATA: Generating test content (no Gemini API calls)")
        
        # Extract a preview from the input text
        preview = text[:100] if text else "sample content"
        
        return {
            'summary': f"This educational content explores key concepts from: {preview}... The material covers fundamental principles and practical applications.",
            'key_points': [
                "Understanding the core concept and its foundational principles",
                "Exploring how the concept applies in real-world scenarios",
                "Examining the relationships between different components",
                "Identifying practical applications and use cases",
                "Recognizing common patterns and best practices"
            ],
            'script': f"Welcome to this educational video! Today we're exploring an important topic. {preview}... Let's break down these concepts step by step and see how they connect to create a complete understanding.",
            'takeaway': "The key insight is understanding how these concepts work together to form a cohesive whole. Apply this knowledge to deepen your understanding.",
            'scene_details': [
                {
                    'scene_number': 0,
                    'start_ratio': 0.0,
                    'narration': "Let's begin by introducing the main concept.",
                    'visual_prompt': "Opening scene with title and key visual elements"
                },
                {
                    'scene_number': 1,
                    'start_ratio': 0.2,
                    'narration': "Here's how the first principle works in practice.",
                    'visual_prompt': "Visualization showing the first key concept"
                },
                {
                    'scene_number': 2,
                    'start_ratio': 0.4,
                    'narration': "Now let's connect this to the second important idea.",
                    'visual_prompt': "Diagram showing connections between concepts"
                },
                {
                    'scene_number': 3,
                    'start_ratio': 0.6,
                    'narration': "Notice how these elements interact and support each other.",
                    'visual_prompt': "Interactive visualization of concept relationships"
                },
                {
                    'scene_number': 4,
                    'start_ratio': 0.8,
                    'narration': "This brings us to the key insight and practical application.",
                    'visual_prompt': "Summary scene with main takeaway and call to action"
                }
            ],
            'visual_prompts': [
                "Hand-drawn sketch illustrating the main concept with clear labels",
                "Diagram showing step-by-step process flow",
                "Visualization of relationships between key components",
                "Summary graphic with key points highlighted"
            ]
        }
    
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
            base_prompt = (
                f"Scene {i + 1}: Illustrate {', '.join(chunk)} with energetic whiteboard animation."
            )
            prompts.append(self._enrich_visual_prompt(' '.join(chunk), base_prompt))
        return prompts[:num_scenes]

    def _enrich_visual_prompt(self, narration: str, prompt: str) -> str:
        """Add concrete subjects, props, and camera notes so visuals feel intentional."""
        narration = (narration or "").strip()
        prompt = (prompt or "").strip()
        if not narration and not prompt:
            narration = "Explain the concept using an annotated notebook sketch"

        merged = f"{narration} {prompt}".strip()
        keywords = self._extract_visual_keywords(merged)
        context_hint = self._infer_scene_context(keywords)
        camera_hint = self._suggest_camera_motion(keywords)

        detail_clause = ""
        if keywords:
            primary = ', '.join(keywords[:5])
            detail_clause = f" Highlight {primary} with labeled callouts and directional arrows."

        texture_clause = (
            " Render as a realistic sketchbook panel with cross-hatching, ink smudges, and sticky-note annotations."
        )

        enriched = f"{prompt or narration}. {context_hint} {camera_hint}{detail_clause} {texture_clause}"
        return ' '.join(enriched.split())

    def _extract_visual_keywords(self, text: str, max_terms: int = 6) -> List[str]:
        tokens = re.findall(r"[A-Za-z][A-Za-z'-]*", text or "")
        stopwords = {
            "the", "and", "or", "but", "so", "because", "to", "of", "a", "an", "is",
            "are", "was", "were", "this", "that", "these", "those", "with", "for",
            "into", "on", "in", "by", "from", "about", "it", "its", "their", "his",
            "her", "your", "you", "we", "they", "as", "at", "be", "can", "will",
            "should", "could", "just"
        }
        keywords: List[str] = []
        for token in tokens:
            lower = token.lower()
            if lower in stopwords or len(token) <= 2:
                continue
            if token not in keywords:
                keywords.append(token)
            if len(keywords) >= max_terms:
                break
        return keywords

    def _infer_scene_context(self, keywords: List[str]) -> str:
        if not keywords:
            return "Set the scene on an open notebook with depth cues and background props."

        keyword_set = {kw.lower() for kw in keywords}
        if keyword_set & {"lab", "molecule", "reaction", "experiment", "chemical", "cell"}:
            return "Stage the scene inside a cozy laboratory bench with glassware, instruments, and margin formulas."
        if keyword_set & {"city", "economy", "business", "market", "trade"}:
            return "Place the sketch over a city skyline with charts, sticky tabs, and floating currency icons."
        if keyword_set & {"earth", "planet", "ecosystem", "forest", "climate"}:
            return "Use a nature field spread with layered terrain sketches, contour lines, and atmosphere arrows."
        if keyword_set & {"student", "classroom", "teacher", "lesson"}:
            return "Draw a classroom chalkboard perspective with desks, reference cards, and highlighted key terms."
        return "Frame the concept with tangible props, depth layers, and contextual background scenery."

    def _suggest_camera_motion(self, keywords: List[str]) -> str:
        motions = [
            "Use a sweeping top-down camera that pans across the steps in sequence.",
            "Add a slow zoom-in to the core element before revealing surrounding context.",
            "Animate quick rack-focus moves between cause and effect elements.",
            "Employ a diagonal tracking shot so the viewer feels motion through the process."
        ]
        if not keywords:
            return random.choice(motions)

        if any(kw.lower() in {"cycle", "process", "flow", "chain", "timeline"} for kw in keywords):
            return "Animate a clockwise camera orbit that follows the process arrows."

        if any(kw.lower() in {"comparison", "vs", "balance", "tradeoff"} for kw in keywords):
            return "Split the canvas with a lateral slider that reveals side-by-side comparisons."

        return random.choice(motions)

    
    def enhance_interest_profile(self, interest_description: str) -> str:
        """
        Enhance user's interest description into structured learning profile
        
        Args:
            interest_description: User's interest description
            
        Returns:
            Enhanced and structured interest profile
        """
        # TESTING MODE: Return mock profile without API calls
        if config.TESTING_MODE:
            print("🧪 TESTING MODE: Using mock interest profile")
            return f"Mock enhanced profile for: {interest_description}. Core Themes: Educational exploration with practical applications. Learning Style: Interactive and engaging with real-world examples."
        
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
            print(f"⚠️ Full error details: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
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
                    scenes.append(self._enrich_visual_prompt(scene_desc, scene_desc))
            
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
        """Generate JSON-driven GSAP animation using Gemini 3 Pro - ALWAYS UNIQUE."""
        
        import random
        import uuid
        from datetime import datetime
        
        # Generate unique session ID for this animation (ensures uniqueness)
        unique_session = str(uuid.uuid4())[:8]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Scribble/sketch variants for consistent style
        creative_styles = [
            "scribbled notebook sequences with animated pencil shading and jitter lines",
            "sketchbook flip-through with marker overlays, ink bleed, and notebook margin doodles",
            "charcoal + chalk hybrid with rough cross-hatching, textured paper grain, and animated smudges",
            "blueprint pencil drafts with shaky outlines, animated eraser dust, and paper-tear transitions",
            "journal collage made of pen sketches, watercolor washes, and animated sticky notes"
        ]
        random_style = random.choice(creative_styles)
        
        # Random color palette for variety
        color_palettes = [
            {"primary": "#6366f1", "secondary": "#f59e0b", "accent": "#10b981"},
            {"primary": "#ef4444", "secondary": "#3b82f6", "accent": "#fbbf24"},
            {"primary": "#8b5cf6", "secondary": "#06b6d4", "accent": "#f43f5e"},
            {"primary": "#059669", "secondary": "#7c3aed", "accent": "#f97316"},
            {"primary": "#2563eb", "secondary": "#dc2626", "accent": "#16a34a"}
        ]
        random_palette = random.choice(color_palettes)
        
        print(f"🎨 Creating UNIQUE animation (session: {unique_session}, style: {random_style[:30]}...)")
        
        scenes = processed_content.get('scene_details', [])
        script_text = processed_content.get('script', '')
        summary = processed_content.get('summary', '')
        key_points = processed_content.get('key_points', [])
        
        # Prepare content context
        key_point_lines = '\n'.join(f"- {point}" for point in key_points)
        scene_json = json.dumps(scenes[:10], indent=2, ensure_ascii=False)
        truncated_source = textwrap.shorten(original_text or '', width=2000, placeholder=' ...')
        num_scenes = max(len(scenes), 1)
        
        # Define available visual elements
        visual_elements = """
SHAPES: createCircle, createSquare, createTriangle, createStar, createHeart, createDiamond, createHexagon
NUMBERS: createNumber (large standalone numbers), createNumberBadge (numbers in colored circles)
ICONS: createIcon (lightbulb, star, check, arrow-right, arrow-left, plus, minus, equals, multiply, divide, question, info, book, brain, target, trophy)
TEXT: createText (labels), createTitle (big headers), createFormula (math equations)
CONNECTORS: createArrow (directional arrows between points), createLine (solid/dashed lines)
FIGURES: createStickFigure (people), createAtom (labeled circles)
EFFECTS: createHighlightBox (colored highlight areas), createParticle (glowing dots)
"""
        
        prompt = f"""# TASK: Generate Complete HTML Animation from Scratch

You are creating a {duration_seconds}-second educational animation by writing HTML, CSS, and JavaScript from scratch.

## SESSION: {unique_session} | {timestamp}
**IMPORTANT: Create the ENTIRE animation from scratch - no predefined objects!**

## STYLE LOCK – SKETCHBOOK SCRIBBLE ONLY
- ALWAYS use hand-drawn pencil/ink strokes with visible jitter and textured paper backgrounds
- Layer multiple sketch elements (foreground doodles, mid-ground diagrams, background notebook grids)
- Keep motion continuous: quick pans, snap zooms, parallax page flips
- Apply pencil shading, cross-hatching, marker bleed, or watercolor splashes for realism
- Add notebook artifacts (torn edges, sticky notes, taped photos, measurement arrows)

## CREATIVE DIRECTION
**Style:** {random_style}
**Colors:** Primary: {random_palette['primary']}, Secondary: {random_palette['secondary']}, Accent: {random_palette['accent']}

## PACING + CAPTIONS
- Break narration into micro-beats of 1–3 seconds; no caption stays longer than 3s
- Keep multiple elements moving simultaneously (scribble reveals, morphing diagrams, bouncing arrows)
- Highlight important words with animated underlines, circling strokes, or marker highlights
- Ensure captions in #captions update in lockstep with audio timing metadata you provide

## SCENE REALISM
- Each beat should describe a believable scene (camera angle, lighting, materials, background context)
- Use props from real life (lab tools, cityscapes, students, chalkboards) drawn in sketch form
- Add atmospheric motion: drifting paper dust, pulsing energy lines, animated annotations

## TECHNICAL CAPABILITIES
You can use ANY of these web technologies:
- **SVG**: Paths, shapes, morphing, stroke animations
- **Canvas**: Drawing, gradients, particles, custom graphics
- **CSS Animations**: Keyframes, transforms, transitions
- **JavaScript**: GSAP, custom animations, dynamic elements
- **HTML5**: Semantic structure, accessibility

---

## CONTENT TO ANIMATE (Create HTML/CSS/JS animations based on this)
**Topic:** {summary}
**Key Points:**
{key_point_lines}

**Source:** {truncated_source[:500]}

**User Interest:** {interest_description}

---

## CREATIVE ANIMATION EXAMPLES

### Science/Chemistry:
```html
<div class="atom" id="oxygen">
  <svg viewBox="0 0 200 200">
    <circle class="nucleus" cx="100" cy="100" r="15"/>
    <ellipse class="orbit" rx="60" ry="20"/>
    <circle class="electron" cx="160" cy="100" r="8"/>
  </svg>
</div>
<style>
.electron {{ animation: orbit 2s linear infinite; }}
@keyframes orbit {{ from {{ transform: rotate(0deg); }} to {{ transform: rotate(360deg); }} }}
</style>
```

### Sports (Football Pitch):
```html
<div class="football-field">
  <svg viewBox="0 0 800 500">
    <rect class="field" fill="#2d7a2d"/>
    <line class="pitch-line" x1="400" y1="0" x2="400" y2="500"/>
    <circle class="center-circle" cx="400" cy="250" r="50"/>
    <path class="player-trajectory" d="M100,400 Q400,200 700,400"/>
  </svg>
</div>
```

### Math/Geometry:
```html
<div class="geometry-demo">
  <canvas id="triangle-canvas"></canvas>
  <script>
    const canvas = document.getElementById('triangle-canvas');
    const ctx = canvas.getContext('2d');
    // Draw animated triangle with angle measurements
  </script>
</div>
```

### History/Timeline:
```html
<div class="timeline">
  <div class="era" id="ancient">
    <div class="era-marker"></div>
    <div class="era-content">Ancient Times</div>
  </div>
</div>
```

---

## HTML STRUCTURE TEMPLATE

Use this structure as a starting point:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Educational Animation</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <style>
        body {{ margin: 0; padding: 0; background: #f0f0f0; font-family: Arial, sans-serif; }}
        #animation-container {{ width: 1920px; height: 1080px; position: relative; }}
        #stage {{ width: 100%; height: 800px; position: relative; }}
        #captions {{ height: 280px; background: white; display: flex; align-items: center; justify-content: center; font-size: 32px; text-align: center; }}
        
        /* YOUR CUSTOM STYLES HERE */
    </style>
</head>
<body>
    <div id="animation-container">
        <div id="stage">
            <!-- YOUR ANIMATION ELEMENTS HERE -->
        </div>
        <div id="captions">Ready to start...</div>
    </div>

    <script>
        // YOUR ANIMATION LOGIC HERE
        const timeline = gsap.timeline();
        
        function startAnimation() {{
            // Animation sequence
        }}
        
        // Auto-start
        window.onload = startAnimation;
    </script>
</body>
</html>
```

---

## OUTPUT REQUIREMENTS

1. **Complete HTML Document** - Include DOCTYPE, head, body, everything
2. **Creative Animations** - Use SVG paths, canvas, CSS keyframes, GSAP
3. **Unique Visual Metaphors** - Don't use standard shapes unless creatively modified
4. **GSAP Timeline** - Use GSAP for smooth animations and timing
5. **Captions** - Update #captions div with narration text throughout the animation
6. **Duration** - CRITICAL: Animation MUST last exactly {duration_seconds} seconds. Spread timeline events evenly across the full duration.
7. **Responsive** - Elements should be positioned absolutely within the stage
8. **Caption Text Array** - MUST include a JavaScript array named 'texts' or 'captions' with all narration text for TTS generation
9. **SMOOTH CONCLUSION** - CRITICAL: Animation MUST have a proper ending sequence:
   - Reserve last 3-5 seconds for conclusion
   - Add final summary caption or key takeaway message
   - Smoothly fade out or zoom out elements
   - Include visual closure (e.g., fade to black, final title card, or elegant transition)
   - DO NOT end abruptly - animations should feel complete and polished

## TECHNICAL GUIDELINES

- Use absolute positioning for all animated elements
- Create smooth transitions and transformations
- Add visual interest with gradients, shadows, and effects
- Include hover states or micro-interactions if appropriate
- Use semantic HTML5 elements
- Add comments explaining complex animations
- Test for performance - avoid too many simultaneous animations
- **Ending Sequence**: Last 10-15% of timeline should be dedicated to wrapping up gracefully
- Use fade-outs, scale-downs, or elegant transitions for final moments
- Consider adding a "Thank you for watching" or summary message at the end

Generate the COMPLETE HTML document with embedded CSS and JavaScript. No markdown, no explanations - just the HTML code.
"""

        try:
            print(f"🎨 Generating JSON animation timeline with Gemini 3 Pro...")
            
            # Try Gemini 3 Pro first, fall back to 2.0 Flash if not available
            model_options = ['gemini-3-pro-preview', 'gemini-2.0-flash-exp', 'gemini-1.5-pro']
            json_data = None
            last_error = None
            
            for model_name in model_options:
                try:
                    print(f"   Trying model: {model_name}")
                    json_model = genai.GenerativeModel(
                        model_name,
                        generation_config={
                            "temperature": 1.0,  # Balanced creativity
                            "top_p": 0.95,
                            "top_k": 64
                        }
                    )
                    
                    response = json_model.generate_content(prompt)
                    json_data = response.text.strip()
                    print(f"   ✅ Model {model_name} responded successfully")
                    break
                except Exception as model_error:
                    print(f"   ❌ Model {model_name} failed: {model_error}")
                    last_error = model_error
                    continue
            
            if json_data is None:
                raise Exception(f"All models failed. Last error: {last_error}")
            
            # Clean up response - remove markdown code blocks if present
            if json_data.startswith("```html"):
                json_data = json_data[7:]
            if json_data.startswith("```json"):
                json_data = json_data[7:]
            if json_data.startswith("```"):
                json_data = json_data[3:]
            if json_data.endswith("```"):
                json_data = json_data[:-3]
            json_data = json_data.strip()
            
            # Check if response is complete HTML or JSON
            if json_data.startswith("<!DOCTYPE html") or json_data.startswith("<html"):
                # Full HTML generation - extract captions and add TTS audio
                print(f"✅ Generated complete HTML animation from scratch")
                
                # Extract caption texts from HTML for TTS generation
                import re
                caption_texts = []
                
                # Try to find text content in various formats
                text_patterns = [
                    r'texts\s*=\s*\[(.*?)\]',  # texts = ["...", "..."]
                    r'captions\s*=\s*\[(.*?)\]',  # captions = ["...", "..."]
                    r'updateCaption\([^)]*\)',  # updateCaption calls
                ]
                
                for pattern in text_patterns:
                    matches = re.findall(pattern, json_data, re.DOTALL)
                    if matches:
                        # Extract quoted strings
                        quoted_strings = re.findall(r'"([^"]+)"', matches[0])
                        caption_texts.extend(quoted_strings)
                        break
                
                # Clean up HTML tags from captions
                cleaned_captions = []
                for text in caption_texts:
                    # Remove HTML tags
                    clean_text = re.sub(r'<[^>]+>', '', text)
                    # Remove extra whitespace
                    clean_text = ' '.join(clean_text.split())
                    if clean_text:
                        cleaned_captions.append(clean_text)
                
                # Generate TTS audio if captions found
                audio_data_uri = None
                if cleaned_captions:
                    try:
                        print(f"   Extracted {len(cleaned_captions)} captions for TTS")
                        audio_output_path = Path(config.TEMP_DIR) / f"narration_{int(time.time())}.mp3"
                        audio_output_path.parent.mkdir(parents=True, exist_ok=True)
                        
                        # Create evenly spaced timeline events across requested duration
                        if duration_seconds <= 0:
                            duration_seconds = 90
                        spacing = max(1.5, duration_seconds / max(1, len(cleaned_captions)))
                        timeline_events = [
                            {
                                "text": text,
                                "start": round(idx * spacing, 2),
                                "duration": spacing
                            }
                            for idx, text in enumerate(cleaned_captions)
                        ]
                        
                        audio_data_uri = self._generate_timeline_narration(
                            timeline_events,
                            audio_output_path,
                            duration_seconds
                        )
                        
                        if audio_output_path.exists():
                            audio_output_path.unlink()
                        
                        extra_injections = []
                        if audio_data_uri:
                            audio_element = f'<audio id="narrationAudio" src="{audio_data_uri}" preload="auto"></audio>'
                            extra_injections.append(audio_element)
                            print(f"   ✅ TTS audio embedded in HTML")
                        
                        caption_script = self._build_caption_sync_script(timeline_events)
                        if caption_script:
                            extra_injections.append(caption_script)
                        
                        if extra_injections:
                            injection_block = '\n'.join(extra_injections)
                            json_data = json_data.replace('</body>', f'{injection_block}\n</body>')
                    except Exception as e:
                        print(f"   ⚠️ TTS generation failed: {e}")
                else:
                    print(f"   ⚠️ No captions found in HTML for TTS generation")
                
                return json_data
            
            # Otherwise, treat as JSON for template-based generation (fallback)
            print(f"   Response is JSON format, using template-based generation")
            scene_data = json.loads(json_data)
            if "setup" not in scene_data or "timeline" not in scene_data:
                raise ValueError("Invalid JSON structure: missing setup or timeline")
            
            # Validate ID integrity
            setup_ids = set()
            for setup_action in scene_data.get('setup', []):
                if 'params' in setup_action and len(setup_action['params']) > 0:
                    setup_ids.add(setup_action['params'][0])
            
            missing_ids = []
            for timeline_event in scene_data.get('timeline', []):
                for id_field in ['target', 'from', 'to']:
                    if id_field in timeline_event:
                        ref_id = timeline_event[id_field]
                        if ref_id and ref_id not in setup_ids:
                            missing_ids.append(f"{id_field}='{ref_id}' at t={timeline_event.get('t', '?')}")
            
            if missing_ids:
                error_msg = f"ID validation failed: {', '.join(missing_ids[:3])} not found in setup"
                print(f"⚠️ {error_msg}")
                print(f"   Available IDs: {setup_ids}")
                raise ValueError(error_msg)
            
            print(f"✅ Generated animation with {len(scene_data.get('setup', []))} setup actions and {len(scene_data.get('timeline', []))} timeline events")
            print(f"   Setup IDs: {setup_ids}")
            
            # Generate TTS narration from timeline captions
            audio_data_uri = None
            try:
                audio_output_path = Path(config.TEMP_DIR) / f"narration_{int(time.time())}.mp3"
                audio_output_path.parent.mkdir(parents=True, exist_ok=True)
                audio_data_uri = self._generate_timeline_narration(
                    scene_data.get('timeline', []), 
                    audio_output_path,
                    duration_seconds
                )
                if audio_output_path.exists():
                    audio_output_path.unlink()
            except Exception as e:
                print(f"⚠️ TTS generation skipped: {e}")
            
            # Load GSAP template and inject JSON
            template_path = "utils/animation_engine_template.html"
            try:
                with open(template_path, 'r', encoding='utf-8') as f:
                    html_template = f.read()
            except FileNotFoundError:
                print(f"⚠️ Template not found at {template_path}, using fallback")
                return self._build_fallback_html(processed_content, duration_seconds)
            
            # Inject JSON data and audio into template
            safe_json = json.dumps(scene_data, ensure_ascii=False, indent=2)
            html = html_template.replace('{{SCENE_DATA_JSON}}', safe_json)
            
            if audio_data_uri:
                html = html.replace('{{AUDIO_DATA_URI}}', audio_data_uri)
                print(f"✅ Generated JSON-driven GSAP animation with TTS narration")
            else:
                html = html.replace('{{AUDIO_DATA_URI}}', '')
                print(f"✅ Generated JSON-driven GSAP animation (no audio)")
            
            print(f"✅ Unique animation generated (no caching - fresh every time)")
            
            return html
            
        except Exception as e:
            import traceback
            print(f"⚠️ JSON animation generation failed: {e}")
            print(f"   Error type: {type(e).__name__}")
            print(f"   Full traceback:")
            traceback.print_exc()
            print(f"   Falling back to simple HTML animation...")
            return self._build_fallback_html(processed_content, duration_seconds)

    def _generate_timeline_narration(self, timeline_events: list, output_path: Path, target_duration: int = 60) -> Optional[str]:
        """Generate synchronized TTS audio from timeline captions and return base64 data URI."""
        try:
            # Combine all timeline text into a single narration script
            narration_segments = []
            for event in timeline_events:
                text = event.get('text', '').strip()
                if text:
                    narration_segments.append(text)
            
            if not narration_segments:
                print("⚠️ No narration text found in timeline")
                return None
            
            full_script = ' '.join(narration_segments)
            print(f"🎤 Generating TTS narration ({len(full_script)} chars)...")
            
            # Use Edge-TTS to generate audio - English US Male voice
            voice = "en-US-GuyNeural"  # Clear English US Male voice
            
            async def _synthesize():
                await self._stream_tts_to_file(full_script, voice, output_path)
            
            # Run async TTS generation
            self._run_async_task(_synthesize)
            
            # Ensure audio reaches target duration by padding if needed
            if output_path.exists():
                self._extend_audio_duration(output_path, target_duration)
            
            # Verify file was created
            if not output_path.exists() or output_path.stat().st_size == 0:
                print("⚠️ TTS generation failed or produced empty file")
                return None
            
            # Read audio file and convert to base64 data URI
            with open(output_path, 'rb') as f:
                audio_bytes = f.read()
            
            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
            data_uri = f"data:audio/mpeg;base64,{audio_base64}"
            
            print(f"✅ TTS narration generated ({len(audio_bytes)} bytes)")
            return data_uri
            
        except Exception as e:
            print(f"⚠️ TTS generation failed: {e}")
            return None
    
    async def _stream_tts_to_file(
        self,
        script: str,
        voice: str,
        output_path: Path,
        rate: Optional[str] = None
    ) -> None:
        """Stream Edge-TTS audio chunks directly to disk to avoid buffering entire files."""
        output_path.parent.mkdir(parents=True, exist_ok=True)
        kwargs = {"text": script, "voice": voice}
        if rate:
            kwargs["rate"] = rate
        
        communicate = edge_tts.Communicate(**kwargs)
        try:
            with open(output_path, "wb") as audio_file:
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        audio_file.write(chunk["data"])
        except Exception:
            if output_path.exists():
                output_path.unlink()
            raise
    
    def _extend_audio_duration(self, audio_path: Path, target_duration: int) -> bool:
        """Extend audio duration by adding silence or repeating content if needed."""
        try:
            # Load the generated audio
            audio = AudioFileClip(str(audio_path))
            actual_duration = audio.duration
            
            print(f"   [AUDIO] Actual duration: {actual_duration:.1f}s, Target: {target_duration}s")
            
            if actual_duration >= target_duration:
                print(f"   [AUDIO] Duration is sufficient, no extension needed")
                audio.close()
                return True
            
            # Calculate how much silence we need to add
            silence_needed = target_duration - actual_duration
            print(f"   [AUDIO] Adding {silence_needed:.1f}s of silence to reach target duration")
            
            # Create silence clip
            def make_silence(t):
                return 0
            
            silence_clip = AudioClip(make_silence, duration=silence_needed, fps=44100)
            
            # Concatenate original audio with silence
            extended_audio = concatenate_audioclips([audio, silence_clip])
            
            # Save the extended audio
            temp_path = audio_path.parent / f"extended_{audio_path.name}"
            extended_audio.write_audiofile(str(temp_path), verbose=False, logger=None)
            
            # Replace original file
            audio_path.unlink()
            temp_path.rename(audio_path)
            
            # Clean up
            extended_audio.close()
            audio.close()
            silence_clip.close()
            
            print(f"   [AUDIO] Successfully extended audio to {target_duration}s")
            return True
            
        except Exception as e:
            print(f"   [AUDIO] Failed to extend audio: {e}")
            return False

    def _explode_caption_text(self, captions: List[str]) -> List[str]:
        """Break longer caption entries into shorter, high-energy phrases."""
        expanded: List[str] = []
        sentence_pattern = re.compile(r'[^.!?]+[.!?]?')
        
        for raw in captions or []:
            text = (raw or "").strip()
            if not text:
                continue
            
            if len(text) <= 110:
                expanded.append(text)
                continue
            
            segments = sentence_pattern.findall(text) or [text]
            for segment in segments:
                cleaned = segment.strip(" -–•·")
                if not cleaned:
                    continue
                if len(cleaned) > 120:
                    wrapped = textwrap.wrap(
                        cleaned,
                        width=65,
                        break_long_words=False,
                        break_on_hyphen=False
                    )
                    for chunk in wrapped:
                        chunk = chunk.strip(" -–•·")
                        if chunk:
                            expanded.append(chunk)
                else:
                    expanded.append(cleaned)
        
        fallbacks = [c.strip() for c in captions or [] if c and c.strip()]
        return (expanded[:30]) if expanded else fallbacks

    def _build_caption_timeline(self, captions: List[str], duration_seconds: int) -> List[Dict[str, float]]:
        """Create pacing metadata for captions so audio + subtitles stay energetic."""
        expanded = self._explode_caption_text(captions)
        if not expanded:
            return []
        
        words_per_second = 2.9  # Faster cadence for high-energy narration
        events: List[Dict[str, float]] = []
        current_time = 0.0
        
        for text in expanded:
            word_count = max(1, len(re.findall(r'\w+', text)))
            estimated = word_count / words_per_second + 0.35
            duration = max(1.1, min(4.0, estimated))
            events.append({
                "text": text,
                "start": round(current_time, 3),
                "duration": round(duration, 3)
            })
            current_time += duration
        
        if current_time <= 0:
            return events
        
        max_allowed = max(5.0, (duration_seconds or 60) - 0.5)
        if current_time > max_allowed:
            scale = max_allowed / current_time
            adjusted_time = 0.0
            for event in events:
                duration = max(0.9, round(event["duration"] * scale, 3))
                event["duration"] = duration
                event["start"] = round(adjusted_time, 3)
                adjusted_time += duration
        
        # Prevent overshooting the requested duration
        for event in events:
            end_time = event["start"] + event["duration"]
            if end_time > max_allowed:
                event["duration"] = max(0.8, round(max_allowed - event["start"], 3))
        
        return events

    def _normalize_timeline_events(self, timeline_events: list, duration_seconds: int) -> List[Dict[str, float]]:
        """Ensure timeline entries contain usable timing metadata."""
        sanitized: List[Dict[str, float]] = []
        missing_timing = False
        
        for event in timeline_events or []:
            text = (event.get('text') or event.get('caption') or '').strip()
            if not text:
                continue
            
            start = event.get('start', event.get('t', event.get('time')))
            duration = event.get('duration', event.get('len', event.get('length')))
            
            try:
                start_val = float(start)
                duration_val = float(duration)
            except (TypeError, ValueError):
                missing_timing = True
                start_val = 0.0
                duration_val = 0.0
            
            sanitized.append({
                "text": text,
                "start": start_val,
                "duration": duration_val
            })
            
            if duration_val <= 0:
                missing_timing = True
        
        if not sanitized:
            return []
        
        if missing_timing:
            return self._build_caption_timeline(
                [item["text"] for item in sanitized],
                duration_seconds
            )
        
        sanitized.sort(key=lambda item: item["start"])
        max_allowed = max(5.0, (duration_seconds or 60) - 0.5)
        for item in sanitized:
            if item["duration"] <= 0:
                item["duration"] = 1.0
            if item["start"] + item["duration"] > max_allowed:
                item["duration"] = max(0.7, max_allowed - item["start"])
        return sanitized

    def _build_caption_sync_script(self, timeline_events: list) -> str:
        """Create a JS helper that keeps captions synced with optional audio playback."""
        if not timeline_events:
            return ""

        sanitized_events = []
        fallback_spacing = 3.5
        for idx, event in enumerate(timeline_events):
            text = (event.get('text') or '').strip()
            if not text:
                continue
            try:
                start = float(event.get('start', idx * fallback_spacing))
            except (TypeError, ValueError):
                start = idx * fallback_spacing
            try:
                duration = float(event.get('duration', fallback_spacing))
            except (TypeError, ValueError):
                duration = fallback_spacing
            sanitized_events.append({
                "start": max(0.0, start),
                "duration": max(0.5, duration),
                "text": text
            })

        if not sanitized_events:
            return ""

        events_json = json.dumps(sanitized_events, ensure_ascii=False)
        script = f"""
<script>
(function() {{
    const captionEvents = {events_json};
    const captionEl = document.getElementById('captions') || document.getElementById('subtitles');
    if (!captionEl || !captionEvents.length) return;

    const audioEl = document.getElementById('narrationAudio');
    let timers = [];

    const setCaption = (text) => {{
        captionEl.textContent = text;
    }};

    const clearTimers = () => {{
        timers.forEach(id => clearTimeout(id));
        timers = [];
    }};

    const scheduleFrom = (offsetSeconds = 0) => {{
        clearTimers();
        captionEvents.forEach(event => {{
            const delay = Math.max(0, (event.start - offsetSeconds) * 1000);
            timers.push(setTimeout(() => setCaption(event.text), delay));
        }});
    }};

    const handlePlay = () => {{
        const current = audioEl ? audioEl.currentTime : 0;
        scheduleFrom(current);
    }};

    const handlePause = () => clearTimers();

    if (audioEl) {{
        audioEl.addEventListener('play', handlePlay);
        audioEl.addEventListener('seeked', handlePlay);
        audioEl.addEventListener('ratechange', handlePlay);
        audioEl.addEventListener('pause', handlePause);
    }} else {{
        window.addEventListener('load', () => scheduleFrom(0));
    }}

    window.__restartCaptionSync = () => {{
        if (audioEl) {{
            handlePlay();
        }} else {{
            scheduleFrom(0);
        }}
    }};

    if (document.readyState === 'complete') {{
        handlePlay();
    }} else {{
        window.addEventListener('load', handlePlay);
    }}
}})();
</script>"""
        return script.strip()

    def _run_async_task(self, coro_factory, timeout: int = 300):
        """Run async task in sync context, handling event loop properly.

        Longer TTS syntheses (2-3 minute scripts) can easily exceed 60s, so we
        allow a generous timeout (default 5 minutes) and let callers override if
        needed.
        """
        async def runner():
            await coro_factory()

        
        try:
            loop = asyncio.get_running_loop()
            # We're in FastAPI context with a running loop, use thread pool
            import concurrent.futures
            exception_box = []
            
            def thread_target():
                try:
                    new_loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(new_loop)
                    new_loop.run_until_complete(runner())
                    new_loop.close()
                except Exception as e:
                    exception_box.append(e)
            
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(thread_target)
                future.result(timeout=timeout)
            
            if exception_box:
                raise exception_box[0]
        except RuntimeError:
            # No event loop exists, create one
            new_loop = asyncio.new_event_loop()
            asyncio.set_event_loop(new_loop)
            try:
                new_loop.run_until_complete(runner())
            finally:
                new_loop.close()
    
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
      return scenePlan.map(scene => ({{ t: Number((scene.start_ratio * duration).toFixed(2)), text: scene.narration }}));
    }}

    function formatTime(seconds) {{
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
      return `${{{{mins}}}}:${{{{secs}}}}`;
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
      sceneLabel.textContent = `Scene ${{active.id}}`;
    }}

    let isPlaying = true;
    let currentTime = 0;
    let lastTimestamp = 0;
    let mediaRecorder = null;
    let recordedChunks = [];

    function updateUI() {{
      const activeLine = narration.reduce((line, entry) => entry.t <= currentTime ? entry.text : line, narration[0]?.text || '');
      subtitleBox.textContent = activeLine || '…';
      timeDisplay.textContent = `${{{{formatTime(currentTime)}}}} / ${{{{formatTime(totalDuration)}}}}`;
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
      durationLabel.textContent = `${{{{totalDuration}}}}s`;
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
        
        # TESTING MODE: Return mock data without API calls
        if config.TESTING_MODE:
            print("🧪 TESTING MODE: Using mock processed content (no Gemini API calls)")
            return self._get_mock_processed_content(text, target_duration)
        
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
        visual_prompts = [
            self._enrich_visual_prompt(
                scene_details[idx]['narration'] if idx < len(scene_details) else '',
                prompt
            )
            for idx, prompt in enumerate(visual_prompts)
        ]
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
