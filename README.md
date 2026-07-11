# Crystal Z — Arc NS Buildathon Integration

**Crystals on Solana.** An extension of the Crystal Z cognitive-training arcade — 12 brain games, 2,000 seniors and caregivers in Singapore, a live off-chain Crystal ledger with real-world voucher redemption — introducing Solana-powered rewards built during the 9-hour Ârc NS Buildathon (11–12 July 2026).

**Live demo:** https://archackathon-operatoruplift.vercel.app · works instantly in zero-config **Demo Mode**; connect Supabase + devnet keys for real on-chain mints.

## 🌟 The Innovation

Bridging web2 caregiver tech with web3 primitives. By utilizing **custodial wallets** and **Metaplex compressed NFTs (cNFTs)** on Solana Devnet, we abstract gas and seed phrases away from the user — a 75-year-old with a QR card gets a seamless web2 experience with verifiable on-chain assets.

- **Crystals stay the earn-mechanic** — the production Postgres trigger (`FLOOR(score / 10)`) is untouched.
- **Solana becomes the reward layer** — milestone badges and monthly-winner vouchers minted for a fraction of a cent each.
- **Custodial by design** — lazily generated keypairs, AES-GCM-encrypted server-side. No seed phrases, no wallet installs.
- **Anti-cheat before value** — a server-side score guard (max score / min duration / rate limit per game) gates the mint path.

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, TanStack Query, i18next (EN / Melayu / 中文)
- **Backend:** Supabase (Postgres, RLS, Auth, Edge Functions) — remains the source of truth
- **Web3:** Metaplex Bubblegum (compressed NFTs), umi, Solana Devnet
- **Fallback:** Vercel serverless mint API + local Demo Mode so the deployed site always demos

## 🚀 Buildathon Scope (locked)

- ✅ Added 1 new cognitive mini-game — **Crystal Sequence**, the 13th game, via the existing 3-edit pattern
- ✅ Implemented a server-side score validation guard (Postgres trigger + client mirror, parity-tested)
- ✅ Custodial wallet generation with encrypted secrets
- ✅ Deployed a custom Deno edge function (`mint-reward-cnft`) that verifies balances server-side before minting
- ✅ Automated cNFT milestone rewards, visible in-app ("My Rewards") and on the Devnet explorer

Guardrails: Devnet only · custodial only · cNFT rewards only · one new game · existing Crystal trigger untouched · Supabase stays the source of truth.

## ⚡ Quick Start (Devnet)

```bash
npm install
cp .env.example .env.local        # leave blank for Demo Mode
npm run dev                       # launch the arcade at http://localhost:5173
npm test                          # 31 unit tests incl. SQL/i18n parity guards
```

### Full on-chain setup

1. **Provision devnet:** `npm run solana:setup` — creates payer, Merkle tree (depth 14 ≈ 16k leaves), and the "Crystal Z Rewards" collection NFT; prints every env var you need.
2. **Prove a mint:** `npm run solana:mint-test` → transaction + asset ID with explorer links.
3. **Supabase:** `supabase db push` (migrations + `supabase/seed.sql`), `supabase functions deploy mint-reward-cnft qr-auth-validate`, `supabase secrets set …` (see `.env.example`).
4. **Vercel:** set `SOLANA_RPC_URL`, `MERKLE_TREE_ADDRESS`, `COLLECTION_MINT_ADDRESS`, `PAYER_SECRET_KEY` to enable real devnet mints from the deployed demo without Supabase.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the click-by-click version.

## 🧭 Definition of Done

> A QR-card senior logs in → plays the **new** game → earns Crystals → crosses a milestone → a cNFT mints to their custodial wallet, appears in "My Rewards", and is verifiable on a Solana devnet explorer. Live, in front of judges.

Demo script: [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) · Pitch: [docs/PITCH.md](docs/PITCH.md)

## Architecture

```
Player (QR card, EN/MS/中文)
   │  plays 1 of 13 games
   ▼
scores INSERT ──▶ guard_score_insert()      BEFORE: max score / min duration / rate limit
   │             award_crystals_for_score() AFTER:  +FLOOR(score/10) Crystals (unchanged)
   ▼
user_crystals ledger (append-only, RLS)
   │  threshold crossed
   ▼
mint-reward-cnft edge function ── verifies balance server-side
   │  Metaplex Bubblegum mintToCollectionV1 (sub-cent fee, payer-sponsored)
   ▼
cNFT → custodial wallet ── "My Rewards" UI + Solana Explorer link
```

Full details, including the demo-mode provider seam and custody model: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Repository Map

```
src/               React app — landing portal, arcade, 13 games, rewards
supabase/          migrations (schema + RLS + triggers), seed, edge functions
solana/            devnet provisioning + mint scripts (umi / Bubblegum)
api/               Vercel serverless mint fallback
tests/             vitest — logic, score guard, SQL/i18n parity
docs/              architecture, pitch, demo script, deployment
```

---

NZmark Pte Ltd · [Healthy-Tec.com](https://healthy-tec.com) · Ârc NS Buildathon 2026. Devnet only — assets carry no monetary value.
