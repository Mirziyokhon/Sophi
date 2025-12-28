"""
Text extraction utilities for various content formats
"""
import os
import requests
from typing import Optional, List, Union
from bs4 import BeautifulSoup
import PyPDF2
from PIL import Image
import pytesseract
import validators
from pdf2image import convert_from_path
import base64
from io import BytesIO
import tempfile


class TextExtractor:
    """Extract text from various content formats"""
    
    @staticmethod
    def get_pdf_info(file_path: str) -> dict:
        """Get PDF information including page count"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                return {
                    'page_count': len(pdf_reader.pages),
                    'title': pdf_reader.metadata.get('/Title', 'Untitled') if pdf_reader.metadata else 'Untitled',
                    'author': pdf_reader.metadata.get('/Author', 'Unknown') if pdf_reader.metadata else 'Unknown'
                }
        except Exception as e:
            raise Exception(f"Error reading PDF info: {str(e)}")
    
    @staticmethod
    def generate_pdf_previews(file_path: str, max_pages: int = None) -> List[dict]:
        """Generate preview images for PDF pages"""
        try:
            # Get total page count first
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                total_pages = len(pdf_reader.pages)
            
            print(f"DEBUG: Total pages in PDF: {total_pages}")
            
            # If max_pages not specified, generate all pages
            if max_pages is None:
                max_pages = total_pages
            else:
                max_pages = min(max_pages, total_pages)
            
            print(f"DEBUG: Will generate previews for {max_pages} pages")
            
            # Convert pages to images
            images = convert_from_path(file_path, dpi=150, first_page=1, last_page=max_pages)
            
            print(f"DEBUG: Generated {len(images)} preview images")
            
            previews = []
            for i, image in enumerate(images, 1):
                try:
                    # Convert image to base64 for JSON response
                    buffer = BytesIO()
                    image.save(buffer, format='PNG', optimize=True)
                    image_base64 = base64.b64encode(buffer.getvalue()).decode()
                    
                    previews.append({
                        'page_number': i,
                        'image_base64': image_base64,
                        'width': image.width,
                        'height': image.height
                    })
                    print(f"DEBUG: Successfully generated preview for page {i}")
                except Exception as page_error:
                    print(f"Warning: Failed to generate preview for page {i}: {page_error}")
                    # Add placeholder for failed page
                    previews.append({
                        'page_number': i,
                        'image_base64': '',
                        'width': 612,  # Default letter size width
                        'height': 792,  # Default letter size height
                        'error': True
                    })
            
            print(f"DEBUG: Returning {len(previews)} previews total")
            return previews
        except Exception as e:
            print(f"DEBUG: Error in generate_pdf_previews: {str(e)}")
            raise Exception(f"Error generating PDF previews: {str(e)}")
    
    @staticmethod
    def extract_from_pdf(file_path: str, pages: Union[str, List[int]] = 'all') -> str:
        """Extract text from PDF file with page selection"""
        try:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                total_pages = len(pdf_reader.pages)
                
                if pages == 'all':
                    page_indices = list(range(total_pages))
                elif isinstance(pages, str) and pages.isdigit():
                    # Single page
                    page_num = int(pages) - 1  # Convert to 0-based index
                    if 0 <= page_num < total_pages:
                        page_indices = [page_num]
                    else:
                        raise ValueError(f"Page {pages} does not exist. PDF has {total_pages} pages.")
                elif isinstance(pages, list):
                    # Multiple pages
                    page_indices = []
                    for page_num in pages:
                        page_idx = page_num - 1  # Convert to 0-based index
                        if 0 <= page_idx < total_pages:
                            page_indices.append(page_idx)
                        else:
                            raise ValueError(f"Page {page_num} does not exist. PDF has {total_pages} pages.")
                else:
                    raise ValueError("Invalid pages parameter. Use 'all', page number, or list of page numbers.")
                
                # Extract text from selected pages
                for i in page_indices:
                    text += pdf_reader.pages[i].extract_text() + "\n"
                    
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
    def validate_and_truncate_content(text: str, max_words: int = 3000) -> tuple[str, int, bool]:
        """Validate content length and truncate if necessary"""
        words = text.split()
        word_count = len(words)
        was_truncated = False
        
        if word_count > max_words:
            # Truncate to first max_words
            truncated_words = words[:max_words]
            text = ' '.join(truncated_words)
            word_count = max_words
            was_truncated = True
        
        return text, word_count, was_truncated
    
    @staticmethod
    def extract(content_type: str, content: str) -> tuple[str, int, bool]:
        """
        Main extraction method
        
        Args:
            content_type: Type of content ('pdf', 'image', 'url', 'text')
            content: File path or text content
            
        Returns:
            Tuple of (extracted_text, word_count, was_truncated)
        """
        if content_type == 'pdf':
            # Handle optional pages parameter
            if isinstance(content, tuple) and len(content) == 2:
                file_path, pages = content
                text = TextExtractor.extract_from_pdf(file_path, pages)
            else:
                text = TextExtractor.extract_from_pdf(content)
        elif content_type == 'image':
            text = TextExtractor.extract_from_image(content)
        elif content_type == 'url':
            text = TextExtractor.extract_from_url(content)
        elif content_type == 'text':
            text = TextExtractor.extract_from_text(content)
        else:
            raise ValueError(f"Unsupported content type: {content_type}")
        
        processed_text, word_count, was_truncated = TextExtractor.validate_and_truncate_content(text)
        
        return processed_text, word_count, was_truncated
