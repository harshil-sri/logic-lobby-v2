from pathlib import Path
import sys

try:
    import qrcode
except ImportError:
    raise SystemExit('Install the QR dependency once with: python -m pip install qrcode[pil]')

if len(sys.argv) != 2:
    raise SystemExit('Usage: python generate_qr.py https://your-domain.vercel.app')

base = sys.argv[1].rstrip('/')
out = Path('qr_output')
out.mkdir(exist_ok=True)

for name, url in {
    'START.png': base + '/',
    'BOARD_FINAL.png': base + '/final'
}.items():
    img = qrcode.make(url, error_correction=qrcode.constants.ERROR_CORRECT_M)
    img.save(out / name)
    print(f'{name}: {url}')
