"""Test Manim animation for Sideview preview"""
from manim import *

class HelloWorld(Scene):
    def construct(self):
        # Set background
        self.camera.background_color = "#F5F5DC"
        
        # Create title
        title = Text(
            "Hello Manim!",
            font="Arial",
            color=BLUE,
            font_size=48
        )
        
        # Animate title
        self.play(Write(title), run_time=2)
        self.wait(1)
        
        # Create circle
        circle = Circle(radius=1.5, color=RED, fill_opacity=0.5)
        circle.shift(DOWN * 1)
        
        # Animate circle
        self.play(Create(circle), run_time=2)
        self.wait(1)
        
        # Transform
        square = Square(side_length=3, color=GREEN, fill_opacity=0.5)
        self.play(Transform(circle, square), run_time=2)
        self.wait(1)


class MathExample(Scene):
    def construct(self):
        # Mathematical equation
        equation = MathTex(
            r"E = mc^2",
            color=BLACK,
            font_size=60
        )
        
        self.play(Write(equation), run_time=3)
        self.wait(2)


class DiagramExample(Scene):
    def construct(self):
        self.camera.background_color = WHITE
        
        # Create nodes
        node1 = Circle(radius=0.5, color=BLUE, fill_opacity=0.8)
        node1.shift(LEFT * 3)
        
        node2 = Circle(radius=0.5, color=GREEN, fill_opacity=0.8)
        node2.shift(RIGHT * 3)
        
        # Create arrow
        arrow = Arrow(
            node1.get_right(),
            node2.get_left(),
            color=BLACK,
            stroke_width=3
        )
        
        # Animate
        self.play(Create(node1), Create(node2))
        self.play(GrowArrow(arrow))
        
        # Add labels
        label1 = Text("Start", color=BLACK, font_size=24)
        label1.next_to(node1, DOWN)
        
        label2 = Text("End", color=BLACK, font_size=24)
        label2.next_to(node2, DOWN)
        
        self.play(Write(label1), Write(label2))
        self.wait(2)
