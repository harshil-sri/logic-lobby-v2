# Logic Lobby — Fresher Kickoff Event (Planning Doc)

**Status:** Structure locked. Stage 2 hosting decided (Vercel + geolocation gate). Stream/section seed table locked. Design system locked (warm/terracotta, not purple) with all 7 screen prompts drafted. Remaining: geolocation radius testing, Stage 3 second-filter decision, floor/room booking, puzzle content, backend build.
**Last updated:** Sep 16, 2026

---

## 1. Core Concept

An anonymous, mystery-driven recruitment funnel for incoming first years, built as a multi-stage puzzle hunt that bridges from digital → physical → back to digital. No mention of "Logic Lobby" or the tech society name until the final reveal screen. Framing throughout: **"We're looking for the best of the best among the freshers."**

**Why this shape:** Freshers won't seek out a tech society on day one — the hook has to be mystery/exclusivity, not a pitch. AI tools can solve most digital puzzles instantly, so the actual filter is built into stages that require physical presence (a geolocation check, a specific floor, a specific board) rather than into puzzle difficulty.

**Core identity (revealed only at the end, per decision to make it explicit as the initiative's brand):**
Logic Lobby exists because AI coding tools let people skip the exact struggle that builds a programmer's actual internal logic. The event itself is proof: some stages were AI-solvable, some weren't — the difference between those is the entire point.

---

## 2. Full Stage Structure (Locked)

### Stage 0 — Classroom QR Distribution
- QR codes handed personally to **class representatives**, not posted publicly.
- Script for CRs (kept vague, exclusivity-driven):
  > "Make sure people in your class scan this. Don't share it outside your class. We won't say what this is, who's behind it, or anything else — just know that whoever completes it has great rewards coming."
- Add scripted urgency: emphasize "today only" / first-come framing so CRs push immediate scanning instead of "later" (which = never for most freshers).
- Each classroom gets a **seeded QR** (see Section 3) — different classes get different puzzle inputs, so screenshotted answers don't work outside the originating class.
- 1–2 QR codes per classroom is enough (seeding is per-class, not per-student).
- Expected scale: 100–250 students.

### Stage 1 — Three-Question Gated Chain (on landing page)
Landing page is personalized per seed: *"Welcome, AI/ML Section C freshers."*

1. **Q1 — Math/logic riddle.** Seeded arithmetic/sequence puzzle. Correct answer unlocks Q2.
2. **Q2 — Python read-the-output.** Short snippet using only 11th/12th-grade basics (variables, for loop, if/else — no libraries, no NumPy). "What does this print?" Seeded by changing a number in the loop/condition. Correct answer unlocks Q3.
3. **Q3 — Combine Q1 + Q2.** Simple operation or cipher combining both prior answers → produces one final decoded string. Naturally unique per seed since it depends on two prior seeded answers.

**Design intent:** This stage is fully AI-solvable and that's fine — it's the top of the funnel, not the filter. Its job is to get maximum attempts through to Stage 2, and to test genuine base-level understanding for the students who solve it manually.

**Output of Stage 1:** One decoded string — an entry code typed into a box on the same page, which unlocks Stage 2's location-check page.

### Stage 2 — Geolocation Gate (hosted on Vercel)
- **Infra decision (locked):** hosted on Vercel — public, anonymous, no IT dependency, no on-campus infra needed. Domain/deployment stays unbranded.
- **Physical filter mechanism:** since Vercel is reachable from anywhere, the "must be on campus" constraint is rebuilt using the browser's Geolocation API instead of network range. Page requests location permission on load; coordinates are checked (client or server-side) against a fixed radius (e.g. 300–500m) around the building.
- **Inside radius:** page unlocks and reveals a cryptic clue pointing toward Stage 3's floor.
- **Outside radius:** deliberately vague failure message (no distance/direction shown) — prevents triangulating the location by trial and error from off-campus.
- This is a *stronger* physical filter than the old LAN-gate idea, since it's decoupled from hosting entirely and GPS spoofing is a meaningfully higher bar for a casual fresher than "walk near a router."

### Stage 3 — Physical Poster Board
- A specific poster board, on a specific floor (out of 8) of the building, is the target.
- *Which* floor is itself part of the puzzle chain — not stated outright, hinted at via Stage 2's clue.
- Poster carries a cryptic message/clue leading to the final answer.
- **Second physical filter:** a QR code physically stuck next to the poster (or a second, tighter geolocation check) reveals the Stage 4 submission link — meaning the *only* way to reach final submission is to have physically stood in front of that exact board. Nothing from this point on can be completed remotely.
- **Monitoring plan:** passive personal observation, a few backup copies kept on hand for quick replacement if tampered with, floor guard asked informally to keep an eye on it, friends stationed around campus as informal lookouts. If pulled down, just re-post immediately — no need for a technical anti-tamper solution.
- This is the strongest anti-AI filter in the whole flow: no LLM can walk to a floor and read a board.

### Stage 4 — Submission & Reveal
- At the poster/final point, participant submits **name, email, enrollment number** via a form → logged to backend with timestamp (first-come order = leaderboard).
- Submission is **never closed off** — everyone who finishes gets logged, not just the top 10.
- On submission: a "Congratulations" screen displays their details back to them.
- **This is the moment the tech society/Logic Lobby identity is named for the first time.** Reveal message should land the core idea: *you just solved stages that AI could and couldn't help with — notice which ones.*
- Top 10 (by completion time) get public shoutout/recognition.

---

## 3. Seeding System

**Problem it solves:** Every classroom needs a functionally-different puzzle (so shared/screenshotted answers don't work class-to-class) without maintaining 15 separate puzzle designs.

**Mechanism:** One puzzle *template* + one *seed number* per classroom, derived from stream + section.

```
seed = stream_base + section_offset

Stream bases (locked — actual VIPS-TC stream list):
  CSE            = 10
  AIML           = 20
  AIDS           = 30
  Cybersecurity  = 40
  VLSI           = 50
  IIOT           = 60
  CSAM           = 70

Section offsets (adjust if a stream has more/fewer than 3 sections):
  A = +1
  B = +2
  C = +3

Example: AIML Section C          → seed = 20 + 3 = 23
         Cybersecurity Section B → seed = 40 + 2 = 42
```

**Note:** confirm actual section counts per stream before finalizing — some streams (e.g. VLSI, IIOT) may have only one or two sections rather than three. Offsets above assume up to A/B/C; drop unused ones per stream in the final lookup table.

- The seed drives **everything** downstream from one lookup: the landing page copy ("Welcome AI/ML Section C"), Q1's numbers, Q2's snippet variable, and therefore Q3's combined output — all from the same single value.
- QR code for each classroom just encodes a URL with the seed as a query param:
  `yoursite.com/puzzle?c=13`
- Server reads `c=13`, looks up (or derives) the puzzle inputs for that seed, and checks submitted answers against values computed for that seed.
- No manual per-student tracking needed — the seed is carried through the URL/session at every step, and gets logged automatically alongside the final Stage 4 submission.
- For 10–15 classrooms, a plain lookup table (seed → puzzle inputs) is simpler to build/debug than a hash-derived approach. Only move to hashing if the number of classes grows much larger.

---

## 4. Open Questions / Pending

1. ~~**Hosting feasibility for Stage 2 (LAN gate):**~~ **Resolved** — pivoted away from LAN/hotspot hosting entirely. Stage 2 is now hosted on Vercel with a geolocation-based physical filter (see Section 2, Stage 2). No IT/lab-professor dependency needed for hosting.

2. **Geolocation radius tuning:** what radius around the building correctly includes the whole campus/relevant area without being so wide it stops functioning as a filter? Needs on-site testing with real GPS coordinates before launch.

3. **Room/floor booking for Stage 3:** does the target floor/board location need any formal booking, or is it a "find it, no permission needed" public space?

4. **Stage 3 second filter mechanism:** decide between a physical QR code stuck next to the poster vs. a second, tighter geolocation check as the gate to Stage 4's submission link.

5. ~~**Final stream/section base numbers:**~~ **Resolved** — stream list confirmed (CSE, AIML, AIDS, Cybersecurity, VLSI, IIOT, CSAM), base numbers locked in Section 3. Still need: exact section count per stream (A/B/C vs. A/B only) before the lookup table is fully final.

---

## 5. Dead Ends / Discarded Ideas (kept for reference)

- **Public "dead drop" posters/QR codes around campus with no personal handout.** Discarded — freshers on day one aren't self-motivated enough to seek out and scan an unexplained QR with no direct human prompt. Personal handout via CRs replaced this.
- **Naming the tech society or "Logic Lobby" on the QR/landing page from the start.** Discarded — anonymity was judged necessary both for the mystery hook and for getting informal buy-in before formally requesting permissions.
- **IP-address-as-answer over student wifi**, with the LAN gate hosted arbitrarily on student wifi infra without pre-checking client isolation. Discarded as the *default* plan — replaced first with own-hardware hotspot/IT-approved lab hosting as options, then discarded entirely in favor of Vercel + geolocation once the local-hosting approach was judged too dependent on infra outside your control.
- **Own hotspot/travel router hosting for Stage 2.** Discarded after further thought — a single hotspot can't cover a whole building, has device-count limits under concurrent load, and still requires on-site testing/coordination. Replaced with Vercel hosting + Geolocation API check, which is infra-independent and works identically regardless of building size.
- **Cutting off submissions once top 10 are reached.** Discarded — decided to log everyone who finishes, not just top 10, since it's a recruitment funnel, not a competition with a hard cutoff.
- **Treating cipher/encoding puzzle difficulty as the anti-AI mechanism.** Discarded as flawed reasoning — any modern LLM solves standard ciphers instantly, so no amount of puzzle cleverness in Stage 1 is a real filter. Reframed: Stage 1 is intentionally AI-solvable (funnel stage), and the real filters are physical-presence stages (2 and 3).
- **Deep purple accent as the primary design color.** Discarded after first design pass — purple (especially neon/saturated purple) reads as the generic "AI-generated app" default and undercuts the premium, non-templated feel the event needs. Replaced with a warm editorial palette (ivory/bone base, warm charcoal text, muted terracotta-orange accent).

---

## 6. QR Code Generation — Tools & Method

### Recommended: Python `qrcode` library (local, no third-party upload of seed URLs)

Since each QR encodes a URL containing your seed logic, generating locally avoids handing your full seed → classroom mapping to an external bulk-generator service before the event happens.

**Setup:**
```bash
pip install qrcode[pil] --break-system-packages
```

**Bulk generation script (one PNG per seed):**
```python
import qrcode

# seed table: classroom label -> seed value
# base: CSE=10, AIML=20, AIDS=30, Cybersecurity=40, VLSI=50, IIOT=60, CSAM=70
# offset: A=+1, B=+2, C=+3 (drop sections a stream doesn't have)
seeds = {
    "CSE_A": 11, "CSE_B": 12, "CSE_C": 13,
    "AIML_A": 21, "AIML_B": 22, "AIML_C": 23,
    "AIDS_A": 31, "AIDS_B": 32, "AIDS_C": 33,
    "CYBERSEC_A": 41, "CYBERSEC_B": 42, "CYBERSEC_C": 43,
    "VLSI_A": 51, "VLSI_B": 52,
    "IIOT_A": 61, "IIOT_B": 62,
    "CSAM_A": 71, "CSAM_B": 72,
    # confirm actual section counts per stream before finalizing
}

base_url = "https://yoursite.com/puzzle"

for label, seed in seeds.items():
    url = f"{base_url}?c={seed}"
    img = qrcode.make(url, error_correction=qrcode.constants.ERROR_CORRECT_M)
    img.save(f"qr_{label}.png")
```

- `ERROR_CORRECT_M` (~15% correction) is a good default — codes still scan reliably even if slightly creased/dirty from handling.
- Output PNGs are named per classroom for easy sorting before handoff to CRs.

### For printing (grid sheet instead of separate files)
If you want all QR codes laid out on one printable page (to cut and hand out), use `Pillow` to paste the generated PNGs into a grid canvas, or `reportlab` to build a labeled PDF grid (classroom name printed under each code). Ask for this script separately once classroom count/layout is finalized — not needed until seed table is locked.

### Alternative (no-code option)
Bulk web generators like QR Code Monkey or uQR.me accept a CSV of URLs and return a zip of QR PNGs. Faster if you don't want to touch a script, but means uploading your full seed-URL mapping to a third party — only use this if speed matters more than keeping the seed scheme private pre-event.

**Scanning tip:** keep printed QR size at minimum ~2.5–3cm square for reliable phone-camera scanning from a normal handheld distance.

---

## 8. Design Prompts (for Google Stitch)

**Color palette (locked — warm editorial, not purple):** Background is a soft warm ivory/bone (#F5F4ED), card/surface areas an even warmer off-white (#FAFAF7). Primary text is a deep warm charcoal (#2E2B26) — never pure black. Secondary/muted text is a soft warm gray-brown (#87867F). Single accent color is a muted clay-terracotta orange (#D97757), used sparingly — CTAs, active states, focus rings, small accent details only, never as a background wash or gradient. No neon, no glow, no gradient text. Typography: distinctive modern sans-serif (Geist, Satoshi, or Outfit — never Inter), track-tight headlines, relaxed body leading. Motion: spring-physics, restrained, no bouncing chevrons or scroll prompts. Layout: asymmetric, generous whitespace, no centered-box-in-middle-of-screen defaults, no 3-column equal card rows. Overall feel: quiet, confident, slightly literary — a well-designed print zine translated to screen, not a typical SaaS landing page.

*(Paste this palette/system paragraph into every prompt below, or feed Stitch the first generated screen as a reference so later screens inherit the same tokens rather than reinterpreting the palette fresh each time.)*

### 8.1 — Landing Page
[Design system above] + Full-screen hero, no navigation, no branding. Large, bold, track-tight headline centered slightly left of true-center: **"Do you think you have what it takes to be the best?"** Below it, smaller text showing a placeholder for dynamic personalization: *"Welcome, AI/ML Section C."* Below that, a short cryptic subline: *"Three questions stand between you and what comes next. Most won't finish."* Single CTA button in the terracotta accent reading **"Begin."** No imagery, purely typographic and spatial.

### 8.2 — Q1: Math/Logic Riddle
[Design system above] + Minimal progress indicator top of page: three thin dashes, first filled terracotta, other two muted gray, reading "1 of 3." Below it, riddle text in confident medium-weight type: placeholder *"A sequence follows a hidden rule: 2, 6, 12, 20, 30 ... What comes next?"* Below that, single input field labeled "Your answer," minimal underline-style border, terracotta focus ring. Single "Submit" button, tactile press-down feedback. Wrong-answer state: small inline text below input in a muted warm red-brown, reading *"Not quite. Try again."*

### 8.3 — Q2: Python Read-the-Output
[Design system above] + Progress indicator "2 of 3," first two dashes filled. Prompt line: *"What does this print?"* Below it, a code block styled like a minimal editor pane — warm off-white surface (#FAFAF7), thin 1px warm-gray border, generous padding, monospace font (Geist Mono or JetBrains Mono), keywords in muted terracotta, rest in charcoal. Same input + Submit pattern as Q1 below the code block.

### 8.4 — Q3: Combine & Decode
[Design system above] + Progress indicator full, "3 of 3." Instruction line: *"Combine what you've found. One final answer remains."* Same input/Submit pattern. On success, a gentle upward cross-fade reveals a monospace decoded-output block with a soft warm terracotta glow (restrained, not neon), showing placeholder text formatted as a two-line reveal (label + value pairs), followed by a short closing line: *"Find where this leads. You're close."*

### 8.5 — Stage 2: Location Verification (Geolocation Gate)
[Design system above] + A single-focus screen centered around a location-check moment. Main visual: a simple, custom line-drawn location-pin glyph (not a generic map-pin emoji) with a soft pulsing terracotta ring animation around it — a quiet "verifying" loop, not a spinner. Headline: *"Are you where you need to be?"* Below it, small muted text: *"This page only opens for those standing close enough."* A "Check my location" button in the terracotta accent triggers the browser geolocation permission prompt.

Two resulting states on the same screen:
- **Success state:** the pin glyph settles/stops pulsing, a checkmark line-icon appears beside it, and a short reveal fades in below — a cryptic text clue pointing toward Stage 3's floor, styled the same as Q3's decoded-output block.
- **Failure state:** the pin glyph stays muted/gray, and a short, deliberately vague line appears: *"Not quite. Keep looking."* — no distance or direction given, so it can't be gamed by trial and error.

### 8.6 — Stage 3: Physical Clue & Poster Placeholder
[Design system above] + This screen acts as the digital handoff into the physical world. Headline: *"You're close. Find the board."* Below it, a photograph-style placeholder component — a warm off-white bordered frame, styled like a Polaroid or evidence photo (slightly rounded corners, thin cream border, subtle drop shadow tinted warm rather than pure black), containing a placeholder image area labeled clearly as **[PLACEHOLDER: photo of the actual poster board to be swapped in later]**. Beneath the photo frame, a short instructional line in muted text: *"Scan what you find there to continue."* No further explanation, no map, no floor number stated outright — once the placeholder is swapped for the real photo, it should visually hint at the location (a distinctive hallway detail, stairwell signage, window view) without spelling it out.

*Separately — the physical printed poster itself (not a webpage):* a single portrait-orientation poster using the same design system — warm ivory background, deep charcoal typography, one terracotta accent line or shape. Minimal, unbranded, text-forward. Placeholder cryptic message centered or asymmetrically placed: *[PLACEHOLDER: cryptic message/cipher leading to final answer]*. Add a small QR code (or leave space for one) if the physical-QR route is chosen as Stage 3's second filter, linking directly to Stage 4.

### 8.7 — Stage 4: Final Reveal & Submission
[Design system above, slightly warmer/more celebratory on load — a brief soft terracotta glow bloom animation] + Large headline: *"You made it."* Half a second later, a second line fades in: *"This was Logic Lobby."* Below that, reflective text: *"Some of what you just solved, AI could've done for you. Some of it, nothing could — except you."* Below that, a clean form — Name, Email, Enrollment Number — minimal labeled inputs, single terracotta "Submit" button. On submit, transition into a confirmation state: a custom line-drawn checkmark glyph (not a generic icon), the submitted name echoed back, and a closing line: *"Welcome to VIPS. We'll be in touch."*

---

## 9. Next Steps (Monday onward)

- [x] Decide Stage 2 hosting approach — Vercel, geolocation-gated
- [ ] Test/tune geolocation radius on-site with real building coordinates
- [ ] Decide Stage 3 second-filter mechanism: physical QR vs. tighter geolocation check
- [x] Confirm actual stream list + lock base-number seed table
- [ ] Confirm exact section count per stream (some may not have a C section)
- [ ] Confirm floor/room booking requirements for Stage 3 poster location
- [ ] Draft actual Q1 (math riddle) and Q2 (Python snippet) content, seeded per classroom
- [ ] Build backend: seed-aware puzzle serving + answer checking + Stage 4 submission logging + Vercel deployment
- [ ] Generate QR codes once seed table is final
- [ ] Brief CRs individually with distribution script (Section 2, Stage 0)
- [ ] Run all 7 design prompts (Section 8) through Stitch and assemble into the actual site
- [ ] Take/select real photo of the poster board location to replace Stage 3 placeholder
- [ ] Print physical poster using the design spec in Section 8
