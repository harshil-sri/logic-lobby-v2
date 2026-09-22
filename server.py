"""
Logic Lobby Local Development Server & Submission Receiver
Runs locally on http://localhost:8000 and logs student submissions to submissions.json
"""

import http.server
import socketserver
import json
import os
from datetime import datetime

PORT = 8000
SUBMISSIONS_FILE = "submissions.json"

class LogicLobbyHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == "/api/submit":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode("utf-8"))
                
                # Append to submissions.json
                submissions = []
                if os.path.exists(SUBMISSIONS_FILE):
                    try:
                        with open(SUBMISSIONS_FILE, "r") as f:
                            submissions = json.load(f)
                    except Exception:
                        submissions = []

                entry = {
                    "id": len(submissions) + 1,
                    "name": data.get("name"),
                    "email": data.get("email"),
                    "enrollmentNumber": data.get("enrollmentNumber"),
                    "cohort": data.get("cohort"),
                    "seed": data.get("seed"),
                    "elapsedSeconds": data.get("elapsedSeconds"),
                    "timestamp": data.get("timestamp", datetime.utcnow().isoformat()),
                    "verificationHash": data.get("verificationHash"),
                    "stagesCompleted": data.get("stagesCompleted", 7)
                }
                
                submissions.append(entry)
                
                with open(SUBMISSIONS_FILE, "w") as f:
                    json.dump(submissions, f, indent=2)

                print(f"[SUBMISSION #{entry['id']}] {entry['name']} ({entry['enrollmentNumber']}) - {entry['cohort']} - Time: {entry['elapsedSeconds']}s")

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                response = {"success": True, "message": "Submission recorded", "entry": entry}
                self.wfile.write(json.dumps(response).encode("utf-8"))

            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                response = {"error": str(e)}
                self.wfile.write(json.dumps(response).encode("utf-8"))
        else:
            self.send_error(404, "Endpoint not found")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), LogicLobbyHandler) as httpd:
        print(f"==================================================")
        print(f"  LOGIC LOBBY LOCAL SERVER RUNNING")
        print(f"  Access website: http://localhost:{PORT}")
        print(f"  API endpoint:   http://localhost:{PORT}/api/submit")
        print(f"  Leaderboard:    {SUBMISSIONS_FILE}")
        print(f"==================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
