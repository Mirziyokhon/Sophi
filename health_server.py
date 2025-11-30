"""
Simple HTTP server for Railway health check
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import sys
import os

class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/_stcore/health':
            # Check basic health
            try:
                import config
                # Check if required API keys exist
                if config.GEMINI_API_KEY and config.ELEVENLABS_API_KEY:
                    self.send_response(200)
                    self.end_headers()
                    self.wfile.write(b'OK')
                else:
                    self.send_response(503)
                    self.end_headers()
                    self.wfile.write(b'Missing API keys')
            except Exception as e:
                self.send_response(503)
                self.end_headers()
                self.wfile.write(f'Health check failed: {str(e)}'.encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Suppress log messages
        pass

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 8501))
    server = HTTPServer(('0.0.0.0', port), HealthHandler)
    print(f"Health server running on port {port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        sys.exit(0)
