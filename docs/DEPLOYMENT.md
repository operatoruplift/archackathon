# Deployment Guide

Three tiers — each is a superset of the previous. The site is fully demoable at Tier 0.

## Tier 0 — Demo Mode (zero config)

Push to `main` → Vercel builds the Vite app. No env vars needed.
- Three seeded QR personas, localStorage state, simulated mints.
- `/api/mint-reward-cnft` returns 503 (`mint_not_configured`) and the client falls back
  gracefully — this is expected, not an error.

## Tier 1 — Real devnet mints (no Supabase)

1. `npm run solana:setup`
   - creates `solana/.keys/payer.json` (gitignored), airdrops devnet SOL,
   - creates the Merkle tree + "Crystal Z Rewards" collection,
   - writes `solana/addresses.json` and prints every value below.
2. `npm run solana:mint-test` — confirm one manual mint end-to-end.
3. Vercel → Project → Settings → Environment Variables:
   ```
   SOLANA_RPC_URL=https://api.devnet.solana.com
   MERKLE_TREE_ADDRESS=<from setup>
   COLLECTION_MINT_ADDRESS=<from setup>
   PAYER_SECRET_KEY=<base58, from setup>   # devnet-only key
   PUBLIC_BASE_URL=https://<your-domain>
   MINT_ALLOWED_ORIGIN=https://<your-domain>
   ```
4. Redeploy. Demo-mode mints now hit devnet for real; celebration shows explorer links.

If the deployed domain differs from `archackathon-operatoruplift.vercel.app`, update the
absolute image/external URLs in `public/cnft/*.json` so wallets and DAS render badge art.

## Tier 2 — Full production path (Supabase)

1. Create a Supabase project → `supabase link` → `supabase db push` → run `supabase/seed.sql`.
2. Deploy functions:
   ```
   supabase functions deploy mint-reward-cnft
   supabase functions deploy qr-auth-validate
   ```
3. Secrets:
   ```
   supabase secrets set SOLANA_RPC_URL=... MERKLE_TREE_ADDRESS=... \
     COLLECTION_MINT_ADDRESS=... PAYER_SECRET_KEY=... \
     PUBLIC_BASE_URL=... WALLET_ENC_KEY=$(openssl rand -base64 32)
   ```
4. Seed users + QR cards: create auth users (email can be `card-<id>@qr.local`), then insert
   matching rows into `qr_cards` (`card_id`, `user_id`). Profiles are auto-created by trigger.
5. (Optional) Database Webhook: `user_crystals` INSERT → POST `mint-reward-cnft` — mints fire
   even if the client disconnects mid-celebration.
6. Frontend env on Vercel:
   ```
   VITE_SUPABASE_URL=https://<ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon>
   VITE_DAS_RPC_URL=<optional DAS-capable devnet RPC (Helius) for badge enrichment>
   ```

## Verification checklist

- [ ] `npm test` and `npm run typecheck` green
- [ ] `npm run solana:mint-test` produces a tx visible on explorer.solana.com (devnet)
- [ ] Fresh browser: QR login → new game → milestone → badge → explorer link
- [ ] `supabase functions logs mint-reward-cnft` shows balance-verified mints
