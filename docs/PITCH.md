# Crystal Z — 3-Minute Judging Pitch

## 0:00 — The hook

> "Crystal Z is not a prototype. It's a brain-training arcade **in production today** — 2,000
> seniors and caregivers across Singapore, 73% engagement, tri-lingual, QR-card login for
> seniors who don't have email. They already earn Crystals and redeem real $5 vouchers at
> community events. Tonight, in 9 hours, we made that reward economy **verifiable, ownable,
> and on-chain.**"

## 0:30 — The live demo (see DEMO_SCRIPT.md)

1. Tap a demo QR card — "this is how Mdm. Tan, 74, logs in. No password. No seed phrase."
2. Play **Crystal Sequence** — "the 13th game, built tonight via our existing 3-edit pattern."
3. Score lands → Crystals tick up → **milestone crossed**.
4. The badge mints — "that's a Metaplex compressed NFT on Solana Devnet. Cost: a fraction of
   a cent. The senior never saw gas, keys, or a wallet install — we generate custodial
   wallets server-side, encrypted at rest."
5. Open "My Rewards" → click **View transaction** → Solana Explorer. "Verifiable by anyone."

## 1:45 — Why this is hard (and why we could do it in 9 hours)

- "Scores used to be client-trusted. Before value moves on-chain, we shipped a **server-side
  score guard** — max score, minimum duration, rate limit, enforced in Postgres, mirrored in
  the client, parity-tested in CI."
- "The mint function **recomputes balances server-side** — you cannot spoof a milestone."
- "The Crystal ledger, QR-card auth, and our service-role edge-function pattern already run
  in production. We only had to add the chain."

## 2:15 — Why Solana

- Sub-cent compressed NFT mints → thousands of badges and monthly-winner vouchers are
  economically trivial.
- Near-instant finality → the badge appears during the game-over screen, not tomorrow.
- One shared global state → sponsors and community partners can audit reward pools end-to-end.

## 2:35 — What's next

> "Milestone badges today. Next: monthly-champion voucher cNFTs settling against Singapore's
> CDC government vouchers, Honeycomb on-chain missions, sponsor-funded and fully auditable
> reward pools — and mainnet, once our anti-cheat hardening is complete. We're NZmark —
> Healthy Tec. We build for the fastest-growing population in APAC: $11B serviceable market,
> four converging tailwinds. Crystals on Solana is how eldercare rewards become real assets."

## One-liners for Q&A

- **Custody?** App-managed keypairs, AES-GCM at rest, Vault/KMS upgrade path, progressive
  self-custody on the roadmap. Right call for a 75-year-old with a QR card.
- **Why cNFTs, not SPL tokens?** Badges are identity/provenance, not currency — and MAS-safe.
  Fungible value stays in vouchers redeemed at physical events.
- **Anti-cheat depth?** Guard now; server-authoritative game sessions + anomaly detection
  before mainnet.
- **Why no custom program?** Audited Bubblegum primitives, sub-cent mints, zero new audit
  surface in 9 hours. Composability when we need it.
