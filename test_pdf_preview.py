#!/usr/bin/env python3
"""
Test script to verify PDF preview generation works for all pages
"""

import requests
import json
import os

def test_pdf_preview():
    """Test the PDF preview API endpoint"""
    
    # Test with a sample PDF file (you'll need to provide one)
    pdf_path = r"d:\Projects\Sophi - For Education\uploads\Sophi Pitch Deck.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found at {pdf_path}")
        print("Please update the path to your PDF file")
        return
    
    try:
        # Upload PDF and get previews
        with open(pdf_path, 'rb') as f:
            files = {'file': f}
            response = requests.post('http://localhost:8000/api/pdf/info', files=files)
        
        if response.status_code == 200:
            data = response.json()
            print(f"Success! PDF info: {data['pdf_info']}")
            print(f"Total previews returned: {data['preview_count']}")
            
            # Check each preview
            for i, preview in enumerate(data['previews']):
                has_image = bool(preview.get('image_base64'))
                has_error = preview.get('error', False)
                print(f"Page {i+1}: Image={has_image}, Error={has_error}, Size={preview.get('width', 0)}x{preview.get('height', 0)}")
            
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Exception occurred: {e}")

if __name__ == "__main__":
    test_pdf_preview()
