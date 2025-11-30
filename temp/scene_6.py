
from manim import *

class Scene6(Scene):
    def construct(self):
        # Set background to whiteboard color
        self.camera.background_color = "#F5F5DC"  # Beige whiteboard
        
        # Title text with hand-drawn style
        title = Text(
            "So, next time youre cooking up a storm, remember ",
            font="Comic Sans MS",
            color=BLACK,
            font_size=36
        ).to_edge(UP)
        
        # Animate title writing
        self.play(Write(title), run_time=2)
        self.wait(0.5)
        
        # Create visual elements based on description
        
        # Create simple illustration
        shapes = VGroup(
            Circle(radius=0.5, color=BLUE, fill_opacity=0.3),
            Square(side_length=1, color=RED, fill_opacity=0.3),
            Triangle(color=GREEN, fill_opacity=0.3)
        ).arrange(RIGHT, buff=0.5)
        shapes.shift(DOWN * 0.5)
        
        self.play(LaggedStart(*[Create(s) for s in shapes], lag_ratio=0.3), run_time=2)

        
        # Hold final frame
        self.wait(1)
    
    def _create_sketchy_line(self, start, end):
        """Create a hand-drawn looking line"""
        line = Line(start, end, color=BLACK, stroke_width=3)
        line.set_stroke(opacity=0.8)
        return line
