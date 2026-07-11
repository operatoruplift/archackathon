-- ============================================================
-- Crystal Z core schema — mirrors the production arcade:
-- profiles, roles, games catalogue, scores, and the
-- server-authoritative append-only Crystal ledger.
-- ============================================================

create extension if not exists pgcrypto;

-- ── Profiles ────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Player',
  qr_card_id text unique,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'Player'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Roles ───────────────────────────────────────────────────
create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'ops')),
  primary key (user_id, role)
);

alter table public.user_roles enable row level security;

create policy "user_roles_select_own" on public.user_roles
  for select using (auth.uid() = user_id);

create or replace function public.has_role(uid uuid, r text)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (select 1 from public.user_roles where user_id = uid and role = r);
$$;

-- ── Games catalogue ─────────────────────────────────────────
-- max_score / min_duration_ms / max_per_minute drive the score
-- guard; they mirror src/lib/constants.ts (parity-tested in CI).
create table public.games (
  slug text primary key,
  category text not null check (category in ('memory', 'reaction', 'logic', 'attention', 'math')),
  max_score integer not null check (max_score > 0),
  min_duration_ms integer not null check (min_duration_ms >= 0),
  max_per_minute integer not null check (max_per_minute > 0),
  is_new boolean not null default false,
  sort integer not null default 0
);

alter table public.games enable row level security;

create policy "games_readable" on public.games
  for select using (true);

-- ── Scores ──────────────────────────────────────────────────
create table public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  game_slug text not null references public.games (slug),
  score integer not null check (score >= 0),
  duration_ms integer not null check (duration_ms >= 0),
  created_at timestamptz not null default now()
);

create index scores_user_game_recent on public.scores (user_id, game_slug, created_at desc);

alter table public.scores enable row level security;

create policy "scores_insert_own" on public.scores
  for insert with check (auth.uid() = user_id);

create policy "scores_select_own" on public.scores
  for select using (auth.uid() = user_id);

-- ── Crystal ledger (append-only, server-authoritative) ─────
create table public.user_crystals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null check (amount > 0),
  source text not null,
  game_slug text,
  score_id uuid references public.scores (id),
  created_at timestamptz not null default now()
);

create index user_crystals_user on public.user_crystals (user_id, created_at desc);

alter table public.user_crystals enable row level security;

-- Users can read their balance; ONLY the definer trigger writes.
create policy "user_crystals_select_own" on public.user_crystals
  for select using (auth.uid() = user_id);

revoke insert, update, delete on public.user_crystals from anon, authenticated;

-- The existing production trigger — unchanged per buildathon guardrails:
-- Crystals awarded = FLOOR(score / 10).
create or replace function public.award_crystals_for_score()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  awarded integer;
begin
  awarded := floor(new.score / 10.0);
  if awarded > 0 then
    insert into public.user_crystals (user_id, amount, source, game_slug, score_id)
    values (new.user_id, awarded, 'game_score', new.game_slug, new.id);
  end if;
  return new;
end;
$$;

create trigger t_award_crystals
  after insert on public.scores
  for each row execute function public.award_crystals_for_score();

-- ── Monthly leaderboard ─────────────────────────────────────
-- Definer view exposing only display_name + monthly total.
create view public.monthly_leaderboard as
select p.display_name, sum(c.amount)::integer as crystals
from public.user_crystals c
join public.profiles p on p.id = c.user_id
where c.created_at >= date_trunc('month', now())
group by p.display_name
order by crystals desc
limit 10;

grant select on public.monthly_leaderboard to anon, authenticated;
