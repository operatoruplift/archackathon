# Crystal Z — Architecture

## Design principle: strictly additive

Crystal Z is live in production (2,000 beneficiaries, 73% engagement). The buildathon adds a
verifiable, ownable reward layer **on top** — nothing existing is removed or modified. The
append-only Crystal ledger and its `award_crystals_for_score()` trigger remain the single
source of truth; Solana mirrors *earned milestones* as compressed NFTs.

## Layers

| Layer | Production | Arc NS addition |
|---|---|---|
| Frontend | React 18, Vite, TS, Tailwind, TanStack Query, i18next (EN/MS/ZH) | Rewards UI, wallet chip, mint celebration, 13th game |
| Backend | Supabase — Postgres, RLS, Auth (QR cards), Edge Functions | `mint-reward-cnft`, `qr-auth-validate`, score-guard trigger, wallets schema |
| Ledger | `user_crystals` (append-only, `FLOOR(score/10)`) | unchanged |
| Value | manual voucher redemption | Metaplex Bubblegum cNFTs on Devnet |

## End-to-end flow

1. **Login** — physical QR card → `qr-auth-validate` (service role) maps card → user, returns a
   one-time magic-link token hash → client `verifyOtp()` establishes a session. No email or
   password surface for the senior.
2. **Play** — one of 13 self-contained React games. Each reports a single `onGameOver(score)`;
   the GameShell measures duration and owns submission.
3. **Guard** — `guard_score_insert()` (BEFORE INSERT, security definer) rejects
   `score > max_score`, `duration < min_duration_ms`, and `> max_per_minute` submissions.
   Limits live in the `games` table and are mirrored in `src/lib/constants.ts`;
   `tests/registry-sql-parity.test.ts` fails CI if they drift.
4. **Award** — the untouched production trigger appends `FLOOR(score/10)` Crystals with
   provenance (`source`, `game_slug`, `score_id`).
5. **Milestone** — when a threshold in `reward_tiers` is crossed, the client invokes
   `mint-reward-cnft` (a Database Webhook on `user_crystals` can invoke it too). The function
   **recomputes the balance server-side** — a spoofed call cannot mint an unearned tier — and
   `unique(user_id, milestone_tier)` makes it idempotent.
6. **Mint** — Bubblegum `mintToCollectionV1` into the "Crystal Z Rewards" collection tree
   (depth 14 ≈ 16k leaves, ~sub-cent per mint), leaf owner = the user's custodial pubkey,
   fee paid by the ops payer. Asset ID parsed via `parseLeafFromMintToCollectionV1Transaction`
   + `findLeafAssetIdPda`.
7. **Verify** — "My Rewards" renders badges from `milestone_rewards` (optionally enriched via
   DAS `getAssetsByOwner`), with explorer links for the transaction and the asset.

## Custody model

- Keypairs are generated **lazily server-side** on first reward contact.
- Secrets are AES-GCM-encrypted (WebCrypto) with `WALLET_ENC_KEY` and stored in `wallets`,
  a table with RLS enabled and **zero client policies** — only the service role reads it.
- Receiving cNFTs needs no user signature; future transfers (e.g. cNFT → CDC voucher
  settlement) will be ops-signed with explicit consent. Upgrade path: Supabase Vault / KMS.
- Why custodial: the audience is 75-year-olds with QR cards. Seed phrases are a non-starter;
  progressive self-custody ("export my wallet") is a roadmap item, not a day-one requirement.

## Why no custom on-chain program

The reward layer needs *ownership and verifiability*, not bespoke logic. Metaplex Bubblegum's
audited programs give us compressed mints at ~$0.000005 each; a custom Anchor program would
add audit surface without adding judge-visible value inside 9 hours. The endgame (Honeycomb
missions, sponsor-funded reward pools) composes on the same primitives.

## The provider seam (demo ⇄ production)

`src/lib/provider/` defines one `DataProvider` interface with two implementations:

- **`supabase`** — the production path described above.
- **`demo`** — zero-config localStorage state with three staged QR personas, the same guard
  logic, and a simulated mint (or a **real devnet mint** via `/api/mint-reward-cnft` when the
  Vercel env is configured). This is why the deployed site always demos, even with no backend.

The UI cannot tell the difference; `getProvider()` picks based on env vars and lazy-loads the
Supabase bundle only when configured.

## Security posture

- RLS on every table; ledger and rewards are insert-locked to definer functions / service role.
- Score guard is authoritative in Postgres; the client mirror only improves UX.
- Devnet only; the payer key funds worthless devnet SOL. The demo mint API is rate-limited
  and CORS-scoped (`MINT_ALLOWED_ORIGIN`).
- No secrets in the repo — `solana/.keys/` and `.env*` are gitignored; `npm run solana:setup`
  generates keys locally and prints what to paste into Vercel/Supabase secret stores.
