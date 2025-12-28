"""
Intelligent Video Duration Recommender
Analyzes content to recommend optimal video duration based on word count and complexity
"""

import re
from typing import Dict, List, Tuple

class DurationRecommender:
    """Recommends optimal video duration based on content analysis"""
    
    # Average speaking rates (words per minute)
    SPEAKING_RATES = {
        'slow': 120,      # Educational content, complex concepts
        'normal': 150,    # Standard presentation
        'fast': 180       # Quick overview
    }
    
    # Duration options in seconds
    DURATION_OPTIONS = [30, 60, 90, 120, 150, 180]
    
    @staticmethod
    def analyze_content_complexity(text: str) -> Dict[str, int]:
        """
        Analyze text complexity based on various factors
        
        Returns:
            Dictionary with complexity metrics
        """
        words = text.split()
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        # Count complex words (3+ syllables, simplified check)
        complex_words = sum(1 for word in words if len(word) > 8)
        
        # Count technical indicators
        technical_indicators = 0
        tech_patterns = [
            r'\b\d+\b',  # Numbers
            r'\b[A-Z]{2,}\b',  # Acronyms
            r'\b\w*\d\w*\b',  # Alphanumeric
            r'[=+\-*/]',  # Math symbols
        ]
        for pattern in tech_patterns:
            technical_indicators += len(re.findall(pattern, text))
        
        return {
            'word_count': len(words),
            'sentence_count': len(sentences),
            'avg_sentence_length': len(words) / len(sentences) if sentences else 0,
            'complex_words': complex_words,
            'technical_indicators': technical_indicators,
            'complexity_score': (complex_words / len(words) * 100) if words else 0
        }
    
    @staticmethod
    def calculate_optimal_duration(word_count: int, complexity_score: float) -> int:
        """
        Calculate optimal duration based on word count and complexity
        
        Args:
            word_count: Number of words in content
            complexity_score: Complexity score (0-100)
            
        Returns:
            Optimal duration in seconds
        """
        # Adjust speaking rate based on complexity
        if complexity_score > 15:  # High complexity
            speaking_rate = DurationRecommender.SPEAKING_RATES['slow']
        elif complexity_score > 8:  # Medium complexity
            speaking_rate = DurationRecommender.SPEAKING_RATES['normal']
        else:  # Low complexity
            speaking_rate = DurationRecommender.SPEAKING_RATES['fast']
        
        # Calculate base time needed (in seconds)
        base_time_seconds = (word_count / speaking_rate) * 60
        
        # Add buffer for pauses and visual transitions (20% for simple, 40% for complex)
        buffer_multiplier = 1.2 + (complexity_score / 100) * 0.4
        adjusted_time = base_time_seconds * buffer_multiplier
        
        # Find closest available duration option
        closest_duration = min(
            DurationRecommender.DURATION_OPTIONS,
            key=lambda x: abs(x - adjusted_time)
        )
        
        # Ensure minimum duration and handle very long content
        if word_count > 1500:  # Very long content
            return 180  # Maximum duration
        elif adjusted_time < 30:  # Very short content
            return 30  # Minimum duration
        
        return closest_duration
    
    @staticmethod
    def get_duration_recommendation(text: str) -> Dict:
        """
        Get comprehensive duration recommendation
        
        Args:
            text: Content text to analyze
            
        Returns:
            Dictionary with recommendation details
        """
        complexity = DurationRecommender.analyze_content_complexity(text)
        optimal_duration = DurationRecommender.calculate_optimal_duration(
            complexity['word_count'], 
            complexity['complexity_score']
        )
        
        # Generate recommendation reason
        reasons = []
        
        if complexity['word_count'] < 200:
            reasons.append("Short content - concise explanation possible")
        elif complexity['word_count'] > 1000:
            reasons.append("Long content - needs more time for thorough coverage")
        
        if complexity['complexity_score'] > 15:
            reasons.append("Complex concepts - slower pace recommended")
        elif complexity['complexity_score'] < 5:
            reasons.append("Simple concepts - faster pace possible")
        
        if complexity['technical_indicators'] > 10:
            reasons.append("Technical content - extra time for comprehension")
        
        # Find duration option info
        duration_labels = {
            30: "30 seconds",
            60: "1 minute", 
            90: "1.5 minutes",
            120: "2 minutes",
            150: "2.5 minutes",
            180: "3 minutes"
        }
        
        return {
            'recommended_duration': optimal_duration,
            'recommended_label': duration_labels.get(optimal_duration, f"{optimal_duration}s"),
            'word_count': complexity['word_count'],
            'complexity_score': complexity['complexity_score'],
            'reasons': reasons,
            'speaking_rate_estimate': complexity['word_count'] / (optimal_duration / 60),
            'all_options': DurationRecommender.DURATION_OPTIONS
        }
    
    @staticmethod
    def get_duration_quality_score(duration: int, word_count: int, complexity_score: float) -> Dict:
        """
        Get quality score for a specific duration option
        
        Returns:
            Dictionary with quality metrics
        """
        optimal = DurationRecommender.calculate_optimal_duration(word_count, complexity_score)
        
        # Calculate quality score (100 = perfect, lower = worse)
        time_difference = abs(duration - optimal)
        quality_score = max(0, 100 - (time_difference / optimal * 100))
        
        # Determine rating
        if quality_score >= 90:
            rating = "Excellent"
            color = "green"
        elif quality_score >= 70:
            rating = "Good"
            color = "blue"
        elif quality_score >= 50:
            rating = "Fair"
            color = "yellow"
        else:
            rating = "Poor"
            color = "red"
        
        # Generate feedback
        if duration < optimal - 30:
            feedback = "Too short - content may feel rushed"
        elif duration > optimal + 30:
            feedback = "Too long - may include unnecessary padding"
        else:
            feedback = "Good duration for this content"
        
        return {
            'duration': duration,
            'quality_score': quality_score,
            'rating': rating,
            'color': color,
            'feedback': feedback,
            'is_recommended': duration == optimal
        }
