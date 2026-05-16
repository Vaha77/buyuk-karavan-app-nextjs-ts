from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import base64
from rembg import remove
from PIL import Image
import io

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/remove-bg':
            length = int(self.headers['Content-Length'])
            body = json.loads(self.rfile.read(length))
            
            # Base64 rasmni decode qilish
            img_data = base64.b64decode(body['image'])
            img = Image.open(io.BytesIO(img_data))
            
            # Fonni olib tashlash
            result = remove(img)
            
            # Natijani base64 ga o'girish
            buf = io.BytesIO()
            result.save(buf, format='PNG')
            result_b64 = base64.b64encode(buf.getvalue()).decode()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'image': result_b64}).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        print(f"[rembg] {args[0]} {args[1]}")

print("rembg server ishga tushdi: http://localhost:5001")
HTTPServer(('localhost', 5001), Handler).serve_forever()