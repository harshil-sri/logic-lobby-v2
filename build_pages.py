import json
import urllib.request
import os
import re

OUTPUT_JSON = "/home/harshil/.gemini/antigravity-ide/brain/c4f8474b-508d-42d4-b330-f5126ad6f417/.system_generated/steps/12/output.txt"
DEST_DIR = "/home/harshil/logic-lobby-v2"

# Ensure dest dir exists
os.makedirs(DEST_DIR, exist_ok=True)

with open(OUTPUT_JSON, 'r') as f:
    data = json.load(f)

screens = data.get('screens', [])

def get_page_info(title):
    # Determine base name
    title_lower = title.lower()
    base_name = "unknown"
    if "threshold" in title_lower:
        base_name = "index"
    elif "question 1" in title_lower:
        base_name = "question1"
    elif "question 2" in title_lower:
        base_name = "question2"
    elif "question 3" in title_lower:
        base_name = "question3"
    elif "verification" in title_lower:
        base_name = "verification"
    elif "conclusion" in title_lower:
        base_name = "conclusion"
    elif "poster" in title_lower:
        base_name = "poster"
    
    # Determine if dark
    is_dark = "dark" in title_lower
    return base_name, is_dark

downloads = []
for screen in screens:
    title = screen.get('title', '')
    html_info = screen.get('htmlCode', {})
    download_url = html_info.get('downloadUrl')
    
    if download_url:
        base_name, is_dark = get_page_info(title)
        downloads.append({
            'title': title,
            'base_name': base_name,
            'is_dark': is_dark,
            'url': download_url,
            'id': screen.get('name').split('/')[-1]
        })

# Check for duplicate Question 1 Dark Edition
q1s = [d for d in downloads if d['base_name'] == 'question1']
if len(q1s) == 2 and all(d['is_dark'] for d in q1s):
    # One of them is probably light. We'll download both and check their bg colors later, 
    # but for now let's just make the first one light.
    q1s[0]['is_dark'] = False

for d in downloads:
    filename = f"{d['base_name']}-dark.html" if d['is_dark'] else f"{d['base_name']}.html"
    filepath = os.path.join(DEST_DIR, filename)
    print(f"Downloading {d['title']} -> {filename}")
    req = urllib.request.Request(d['url'], headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        content = response.read().decode('utf-8')
        with open(filepath, 'w') as f:
            f.write(content)

print("All downloads finished.")
