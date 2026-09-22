import os
import glob

DEST_DIR = "/home/harshil/logic-lobby-v2"
html_files = glob.glob(os.path.join(DEST_DIR, "*.html"))

script_tag = '\n<script src="toggle.js"></script>\n'

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()
    
    if script_tag not in content:
        # Insert before </body> if it exists
        if '</body>' in content:
            content = content.replace('</body>', script_tag + '</body>')
        else:
            content += script_tag
        
        with open(file, 'w') as f:
            f.write(content)
        print(f"Injected script into {file}")

print("Injection complete.")
