"""Lightweight helper to render math expressions into sprites using Manim."""
from __future__ import annotations

import base64
import subprocess
import textwrap
import uuid
from pathlib import Path
from typing import Dict, List

import config


class MathGlyphHelper:
    """Generate PNG sprites for math expressions via Manim (optional)."""

    def __init__(self) -> None:
        self.media_root = Path(config.TEMP_DIR) / "math_glyphs"
        self.media_root.mkdir(parents=True, exist_ok=True)
        self._manim_available = self._check_manim()

    def _check_manim(self) -> bool:
        try:
            import manim  # noqa: F401
            return True
        except Exception:
            return False

    def generate_glyphs(self, expressions: List[str]) -> Dict[str, str]:
        if not self._manim_available or not expressions:
            return {}

        sprites: Dict[str, str] = {}
        for expr in expressions:
            cleaned = (expr or "").strip()
            if not cleaned or cleaned in sprites:
                continue
            sprite = self._render_expression(cleaned)
            if sprite:
                sprites[cleaned] = sprite
        return sprites

    def _render_expression(self, expression: str) -> str | None:
        scene_id = f"Glyph{uuid.uuid4().hex[:8]}"
        script_name = f"math_{scene_id}.py"
        script_path = self.media_root / script_name
        escaped_expr = expression.replace("\\", "\\\\").replace('"', r"\"")
        script = textwrap.dedent(
            f"""
            from manim import *

            class {scene_id}(Scene):
                def construct(self):
                    tex = MathTex(r"{escaped_expr}").scale(2)
                    tex.set_color(BLACK)
                    self.add(tex)
            """
        )
        script_path.write_text(script, encoding="utf-8")

        media_dir = self.media_root / "media"
        cmd = [
            "python",
            "-m",
            "manim",
            "-ql",
            "-s",
            "--media_dir",
            str(media_dir),
            str(script_path),
            scene_id,
        ]
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=90,
                check=True,
            )
        except Exception:
            return None

        image_path = media_dir / "images" / script_path.stem / f"{scene_id}.png"
        if not image_path.exists():
            return None

        data = image_path.read_bytes()
        return f"data:image/png;base64,{base64.b64encode(data).decode('utf-8')}"


__all__ = ["MathGlyphHelper"]
