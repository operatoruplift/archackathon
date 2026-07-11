# Demo Script — click-by-click

**Setup (before judges arrive):**
- Open the deployed site in a clean browser profile (splash counter plays once per session).
- If real mints are configured (Vercel env), pre-check devnet RPC health and payer balance
  (`npm run solana:mint-test`). Demo Mode needs nothing.
- Language: start in English; switch to 中文 mid-demo for effect.

**The run (≈2 minutes):**

1. **Landing** (`/`) — let the 0→100 splash play. One line: "our live portal — 13 games,
   2,000 seniors, cNFT rewards." Scroll one screen to show the arcade mosaic, then click
   **Launch Arcade**.
2. **Login** (`/login`) — "Seniors tap a physical QR card — no email, no password." Click
   **Mr. Kumar Rajan** (8 💎 — 7 away from the first milestone).
3. **Arcade** (`/arcade`) — point at the progress bar: "7 Crystals to his first badge."
   Click the **NEW · Crystal Sequence** banner — "this is the 13th game, built tonight."
4. **Play** — Start → watch the crystals glow → repeat 3–4 levels (each level = 20 points;
   3 levels ≈ 60 points ≈ 6 Crystals; add one more game if needed — Speed Clicker is fastest).
   Any score ≥ 70 total works: **Collect Crystals**.
5. **Milestone** — toast "+N Crystals" → **"Milestone unlocked!"** overlay → badge mints.
   - Real mode: "View transaction" → Solana Explorer (devnet) in a new tab. Leave it open.
   - Demo mode: point at the "Demo mint" tag — "simulated locally; same pipeline."
6. **My Rewards** (`/rewards`) — First Facet glowing; wallet chip: "his custodial address —
   generated server-side, secret encrypted at rest." Click 中文 — entire UI flips.
7. **Close** — back to landing, scroll to the On-Chain section: "own what you earn."

**Fallbacks:**
- RPC down → Demo Mode still completes the full narrative (state it honestly).
- Milestone already claimed on this device → use **Cik Aisyah** (132 💎, 18 from tier 3) or
  clear site data (DevTools → Application → Clear storage).
- Projector fails → screenshots of every step live in the repo's QA artifacts.
