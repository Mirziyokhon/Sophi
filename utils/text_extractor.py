"""
Text extraction utilities for various content formats
"""
import os
import requests
from typing import Optional
from bs4 import BeautifulSoup
import PyPDF2
from PIL import Image
import pytesseract
import validators


class TextExtractor:
    """Extract text from various content formats"""
    
    @staticmethod
    def extract_from_pdf(file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
    
    @staticmethod
    def extract_from_image(file_path: str) -> str:
        """Extract text from image using OCR"""
        try:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            return text.strip()
        except Exception as e:
            raise Exception(f"Error extracting text from image: {str(e)}")
    
    @staticmethod
    def extract_from_url(url: str) -> str:
        """Extract text from web page"""
        try:
            if not validators.url(url):
                raise ValueError("Invalid URL format")
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.decompose()
            
            # Get text
            text = soup.get_text()
            
            # Clean up text
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = '\n'.join(chunk for chunk in chunks if chunk)
            
            return text.strip()
        except Exception as e:
            raise Exception(f"Error extracting text from URL: {str(e)}")
    
    @staticmethod
    def extract_from_text(text: str) -> str:
        """Process plain text input"""
        return text.strip()
    
    @staticmethod
    def validate_content_length(text: str, max_words: int = 3000) -> tuple[bool, int]:
        """Validate content length"""
        word_count = len(text.split())
        is_valid = word_count <= max_words
        return is_valid, word_count
    
    @staticmethod
    def extract(content_type: str, content: str) -> tuple[str, int]:
        """
        Main extraction method
        
        Args:
            content_type: Type of content ('pdf', 'image', 'url', 'text')
            content: File path or text content
            
        Returns:
            Tuple of (extracted_text, word_count)
        """
        if content_type == 'pdf':
            text = TextExtractor.extract_from_pdf(content)
        elif content_type == 'image':
            text = TextExtractor.extract_from_image(content)
        elif content_type == 'url':
            text = TextExtractor.extract_from_url(content)
        elif content_type == 'text':
            text = TextExtractor.extract_from_text(content)
        else:
            raise ValueError(f"Unsupported content type: {content_type}")
        
        is_valid, word_count = TextExtractor.validate_content_length(text)
        
        if not is_valid:
            raise ValueError(f"Content exceeds maximum length of 3000 words (found {word_count} words)")
        
        return text, word_count
