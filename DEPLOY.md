# Logic Lobby — Deployment Checklist

## 1. Test locally

```bash
cd /home/harshil/logic-lobby-v2
node test.mjs
python3 -m http.server 8000
```

The static page can be previewed at `http://localhost:8000/`, but the API routes need Vercel-style serverless execution. Use Vercel preview/production for the complete flow.

## 2. Push the project

```bash
git status
git diff --check
git add -A
git commit -m "Simplify Logic Lobby to universal QR seeding"
git push origin main
```

## 3. Import the GitHub repository into Vercel

Create a new project from the GitHub repository in the Vercel dashboard.

## 4. Add environment variables

`LOGIC_LOBBY_SESSION_SECRET` — long random secret, required.

`SUBMISSION_WEBHOOK_URL` — endpoint that permanently stores completion records, required for production logging.

`BOARD_CLUE` — the actual clue to print/display after location verification.

Redeploy after changing environment variables.

## 5. Test the deployment

Open `/` in a private/incognito browser. Everyone should receive a puzzle without any `?c=` parameter.

Then complete the flow using a single browser session. The fixed board QR should point to `/final`.

## 6. Generate the two physical QR codes

```bash
python3 generate_qr.py https://YOUR-DOMAIN.vercel.app
```

This creates:

- `qr_output/START.png` — universal starting QR for everyone.
- `qr_output/BOARD_FINAL.png` — universal physical-board QR.
