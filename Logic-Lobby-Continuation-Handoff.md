# Logic Lobby — Continuation Handoff

This file is the implementation handoff for the next coding agent. Continue from the current codebase; do not restart the project from scratch.

## 1. Current Product Decision

The original section-wise/classroom seeding model is **discarded**.

The event now uses:

```text
ONE START QR FOR EVERYONE
        ↓
Server creates a random seed / iteration (1–63) for that participant
        ↓
Seed is locked in a signed session
        ↓
Q1 → Q2 → Q3
        ↓
GPS / campus verification
        ↓
Physical board
        ↓
ONE FIXED BOARD QR
        ↓
Same session → same seed
        ↓
Seed-specific canteen puzzle
        ↓
Submission
        ↓
Logic Lobby reveal
```

Important consequences:

- There is **one universal starting QR**.
- There is **one universal physical-board QR**.
- The seed is **per participant/session**, not per class, stream, section, or year.
- There are **63 deterministic puzzle iterations**.
- Two participants may receive the same iteration; this is acceptable.
- Year / stream / section are only participant metadata collected at final submission.
- Year / stream / section must NOT influence the puzzle seed.

## 2. What Is Already Working

The current implementation has already been tested with:

- 63 available randomized iterations.
- 63 distinct complete puzzle combinations.
- 63 unique final canteen codes.

The API flow has also been tested end-to-end in the working environment.

Do not throw away the existing backend and rebuild it unless a concrete bug requires it.

## 3. Core Files

Expected important files include:

```text
index.html
api/_logic.js
api/session.js
api/answer.js
api/location.js
api/final.js
api/submit.js
package.json
vercel.json
dev-server.mjs
test.mjs
generate_qr.py
DEPLOY.md
.env.example
```

There may also be design/reference HTML files in the repository. Treat the original Logic Lobby design as the visual source of truth.

## 4. Frontend Requirements

Preserve the existing visual direction.

The intended visual language is:

- dark warm charcoal background
- warm ivory/cream text
- muted terracotta accent
- editorial typography
- restrained motion
- minimal, premium, mysterious feel

Do not introduce:

- generic AI-dashboard UI
- exposed stage maps
- visible seed numbers
- telemetry/log panels
- formula/debugger panels
- answer hints
- answer-revealing helper text
- unnecessary "Question 1 / Question 2 / Question 3" progress indicators
- generic SaaS styling

The player should only see the information necessary for the current point in the mystery.

## 5. Required Game Flow

### Entry

A participant opens the universal starting URL, with no seed query parameter required.

The server should create a secure session with:

```text
seed
completedStages
locationVerified
session timestamp / expiry
```

The seed must be generated once and then remain stable for that session.

Refreshing the browser must NOT generate a new seed.

### Puzzle stages

The seed deterministically controls the participant's:

- Q1 variation/parameters
- Q2 variation/parameters
- Q3 expected answer / transformation
- final canteen scenario

Answer checking must happen server-side.

Do not expose the expected answers in the HTML/JavaScript sent to participants.

### Campus verification

Current campus point:

```text
Latitude:  28.720746820087875
Longitude: 77.1413492831149
```

Current initial radius:

```text
900 metres
```

The radius should remain configurable so it can later be tightened after a real on-campus test.

Failure behavior should be intentionally vague:

```text
Not quite. Keep looking.
```

Do not reveal:

- distance from campus
- direction
- coordinates
- how far outside the radius they are

Use the browser Geolocation API and server-side validation.

### Physical board

After successful campus verification, show the board stage.

The board stage is an intentional handoff to the physical world.

The digital page should contain:

- a placeholder area for a future photo of the real board/location
- minimal wording telling the participant to find the board and continue from what they find there

For local development only, a localhost-only continuation control may be used to bypass the physical QR for testing.

That bypass must NOT exist in production.

### Physical board QR

The board has exactly ONE fixed QR.

Suggested route:

```text
/final
```

The QR itself carries no participant seed.

When the participant scans it on the same device/browser session:

```text
/final
   ↓
server reads signed session
   ↓
gets participant seed
   ↓
serves that seed's canteen scenario
```

A participant without a valid completed session must not be able to directly access the final puzzle.

## 6. Final Canteen Puzzle

The supplied canteen data contains three vendors:

- Kirparam
- Delicious Grounds
- Exotica

The final puzzle must present exactly one scenario from each vendor.

The UI should use a natural sentence, for example:

```text
You bought two Spring Rolls from Kirparam,
then one Tandoori Burgers from Delicious Grounds,
and finally one Mochaccino from Exotica.
Enter the three totals.
```

The participant enters:

```text
DDD-DDD-DDD
```

Example:

```text
2 × ₹35 = 070
1 × ₹80 = 080
1 × ₹60 = 060

070-080-060
```

The required value is the **total paid for the stated quantity**, not the unit price.

Rules:

- one item from each vendor
- deterministic from the participant seed
- include vendor + exact item name
- avoid ambiguous item names
- ideally avoid repetitive/identical price combinations
- leading zeroes are mandatory
- validation format must be:

```regex
^\d{3}-\d{3}-\d{3}$
```

The final code must be validated on the server.

## 7. Submission

After the correct canteen code, collect:

```text
Name
Email
Enrollment Number
Year
Stream
Section
```

Important:

- Year/stream/section should preferably be derived from participant input only because they are now metadata, not puzzle seed inputs.
- The server should still validate/sanitize all fields.
- The submission record should also include:
  - participant seed
  - completion timestamp
  - optionally session ID / event ID if needed internally

All successful completions should be logged. There is no top-10 cutoff.

Completion order can be reconstructed from timestamps.

## 8. Persistence

The current backend supports a submission webhook approach.

Production needs a real persistent destination.

Expected environment variables:

```text
LOGIC_LOBBY_SESSION_SECRET
SUBMISSION_WEBHOOK_URL
BOARD_CLUE
```

Do not hard-code secrets.

Do not silently claim that submissions are stored if the configured persistence destination is unavailable.

A failed persistence call should produce a clear controlled error.

## 9. Security / Flow Hardening

Before deployment, verify all of the following:

- Changing the URL seed/parameters cannot switch the active participant seed after session creation.
- The seed is stored server-side or in a properly signed HttpOnly session cookie.
- Participants cannot skip directly to later stages.
- `/api/final` rejects users who have not completed the required earlier stages.
- Final submission is rejected unless the final puzzle was completed.
- Invalid seed/session data is rejected cleanly.
- Answers are validated server-side.
- Production responses do not expose the full answer bank or expected answers.
- Cookies use appropriate security flags in production.
- Session lifetime is finite.
- User-provided submission fields are validated and sanitized.

Do not attempt to make the system impossible to cheat. The intended anti-AI barrier is primarily physical presence.

## 10. Local Verification

Use:

```bash
cd /home/harshil/logic-lobby-v2
node test.mjs
```

Expected:

```text
PASS: 63 randomized iterations available.
Distinct complete puzzle combinations: 63
Unique final canteen codes: 63
```

Then:

```bash
npm run dev
```

Expected local address:

```text
http://localhost:8000
```

Test:

```text
http://localhost:8000/
```

The bare URL should work. Do not require `?c=...` for real participants.

Test the complete local flow without needing to wait for the physical QR. Use the development-only board continuation path if present.

Do NOT rely only on a visually correct frontend; exercise the API/state transitions too.

## 11. QR Codes

There should now be only:

### Starting QR

One universal URL for everyone:

```text
https://YOUR-DOMAIN/
```

### Physical board QR

One universal URL:

```text
https://YOUR-DOMAIN/final
```

There are NO classroom-specific QR codes anymore.

The previous 63-classroom QR-generation model is obsolete.

## 12. Vercel Deployment

Do NOT install the Vercel CLI.

Deploy through the Vercel web dashboard.

High-level flow:

```text
GitHub repository
      ↓
Vercel → Add New / Project
      ↓
Import repository
      ↓
Configure project
      ↓
Set environment variables
      ↓
Deploy
```

Environment variables:

```text
LOGIC_LOBBY_SESSION_SECRET=<strong random secret>
SUBMISSION_WEBHOOK_URL=<persistent submission endpoint>
BOARD_CLUE=<final board clue>
```

After changing environment variables in Vercel, redeploy so the deployment receives the new values.

## 13. Production Test Before Event

Run one full real-phone test on the deployed site.

Check:

1. Universal QR opens.
2. Session is created.
3. Refresh keeps the same puzzle.
4. Q1 works.
5. Q2 works.
6. Q3 works.
7. GPS permission appears.
8. On-campus coordinates pass.
9. Off-campus coordinates fail without leaking distance/direction.
10. Board stage appears.
11. `/final` only works after the proper session state.
12. Correct seed-specific canteen scenario appears.
13. Correct code is accepted.
14. Incorrect code is rejected.
15. Submission is persisted.
16. Completion screen appears.

## 14. Physical GPS Testing

The current location radius is intentionally loose.

Test with several phones and carriers from:

- inside the target building
- campus edge
- just outside campus
- different floors if relevant

Record whether legitimate participants are accepted.

Only after testing should the radius be changed.

Do not tighten the radius merely because one phone reports a noisy position.

## 15. Physical Board

Before launch:

- replace the board-photo placeholder with the real photo if desired
- finalize the physical clue
- print the board
- attach the one universal QR
- test the QR from normal phone scanning distance
- ensure the QR remains readable under expected lighting

Do not expose the secret final clue in the public source if it is meant to stay hidden.

## 16. Final QR Generation

After the Vercel URL is final:

```bash
python generate_qr.py https://YOUR-DOMAIN.vercel.app
```

Only generate:

```text
START QR
BOARD FINAL QR
```

Do not generate the obsolete per-classroom QR set.

## 17. Working Method for the Next Agent

Work in checkpoints.

Do not make a giant batch of unrelated changes.

Recommended sequence:

```text
Checkpoint 1
Confirm current architecture and files.

Checkpoint 2
Confirm random per-session seeding is still correct.

Checkpoint 3
Confirm frontend flow and board handoff.

Checkpoint 4
Confirm API security and stage gating.

Checkpoint 5
Set up persistence.

Checkpoint 6
Prepare Vercel configuration.

Checkpoint 7
Deploy.

Checkpoint 8
Production test.

Checkpoint 9
Finalize physical assets and QR codes.
```

After each checkpoint, report:

```text
DONE
- what changed
- what was tested
- exact command/output if relevant

REMAINING
- next single action
```

Do not overwhelm the user with all remaining steps at once.

## 18. Important Context / Do Not Regress

The user explicitly changed the architecture because first-year sections were reshuffled and distributing separate section-specific QRs is now operationally impractical.

Therefore:

**Do not reintroduce section-wise/classroom seeding.**

The definitive rule is:

> One universal starting QR, random participant seed, 63 deterministic iterations, one universal physical-board QR.

The project's mystery experience and dark editorial visual direction are intentional. Functional improvements must not turn the site back into an exposed technical dashboard.
