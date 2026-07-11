-- ============================================================
-- Arc NS Buildathon addition — strictly additive Solana layer:
-- custodial wallets, milestone rewards (cNFTs), reward tiers,
-- QR card mapping, and the server-side score guard.
-- Nothing in 0001 is modified; the Crystal trigger is untouched.
-- ============================================================

-- ── Custodial wallet address on the profile ─────────────────
alter table public.profiles
  add column solana_wallet text;

-- ── Encrypted custodial wallets (service-role only) ─────────
-- Secrets are AES-GCM encrypted by the mint-reward-cnft edge
-- function with WALLET_ENC_KEY (Vault upgrade path documented).
create table public.wallets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  public_key text not null unique,
  encrypted_secret text not null,
  created_at timestamptz not null default now()
);

-- RLS enabled with NO policies: anon/authenticated get nothing;
-- the service role bypasses RLS.
alter table public.wallets enable row level security;
revoke all on public.wallets from anon, authenticated;

-- ── Reward tiers (configurable thresholds) ──────────────────
create table public.reward_tiers (
  tier integer primary key,
  threshold integer,          -- null for ops-minted tiers (monthly champion)
  name text not null
);

alter table public.reward_tiers enable row level security;

create policy "reward_tiers_readable" on public.reward_tiers
  for select using (true);

-- ── Milestone rewards (minted cNFTs) ────────────────────────
create table public.milestone_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  cnft_asset_id text,
  milestone_tier integer not null references public.reward_tiers (tier),
  mint_signature text,
  created_at timestamptz not null default now(),
  unique (user_id, milestone_tier)
);

alter table public.milestone_rewards enable row level security;

-- Users may only SELECT their own rewards; there is deliberately
-- no INSERT/UPDATE/DELETE policy — only the service_role (which
-- bypasses RLS, i.e. the mint-reward-cnft edge function) writes.
create policy "milestone_rewards_select_own" on public.milestone_rewards
  for select using (auth.uid() = user_id);

revoke insert, update, delete on public.milestone_rewards from anon, authenticated;

-- ── QR cards (passwordless senior login) ────────────────────
create table public.qr_cards (
  card_id text primary key,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.qr_cards enable row level security;
revoke all on public.qr_cards from anon, authenticated;  -- edge functions only

-- ── Server-side score guard ─────────────────────────────────
-- Scores were client-trusted; before Crystals carry on-chain
-- value, inserts must pass a sanity gate. BEFORE trigger so a
-- rejected score never reaches the award trigger.
create or replace function public.guard_score_insert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  g public.games%rowtype;
  recent_count integer;
begin
  select * into g from public.games where slug = new.game_slug;
  if not found then
    raise exception 'unknown_game';
  end if;
  if new.score > g.max_score then
    raise exception 'score_too_high';
  end if;
  if new.duration_ms < g.min_duration_ms then
    raise exception 'too_fast';
  end if;
  select count(*) into recent_count
  from public.scores
  where user_id = new.user_id
    and game_slug = new.game_slug
    and created_at > now() - interval '1 minute';
  if recent_count >= g.max_per_minute then
    raise exception 'rate_limited';
  end if;
  return new;
end;
$$;

create trigger t_guard_score
  before insert on public.scores
  for each row execute function public.guard_score_insert();

-- ── Milestone mint hook ─────────────────────────────────────
-- Recommended wiring: Supabase Dashboard → Database Webhooks →
-- on INSERT into user_crystals → POST to the mint-reward-cnft
-- edge function. The function is also invoked client-side after
-- a game and re-verifies the balance server-side, so both paths
-- are safe and idempotent (unique user_id + tier).
