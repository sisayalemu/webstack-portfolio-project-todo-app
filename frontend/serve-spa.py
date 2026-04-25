#!/usr/bin/env python3
import http.server
import socketserver
import os
from urllib.parse import urlparse

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL
        parsed_path = urlparse(self.path)
        
        # If it's a request for a static file that exists, serve it
        if os.path.exists(parsed_path.path.lstrip('/')):
            super().do_GET()
        else:
            # For all other paths, serve index.html (SPA routing)
            self.path = '/index.html'
            super().do_GET()

if __name__ == "__main__":
    PORT = 4173
    
    # Change to the dist directory
    os.chdir('/home/dev/project/SisayA-todo-app/frontend/dist')
    
    with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
        print(f"Serving SPA on http://0.0.0.0:{PORT}")
        httpd.serve_forever()
