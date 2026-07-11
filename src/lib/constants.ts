import type { GameMeta, RewardTier } from './types';

/**
 * Single source of truth for the arcade catalogue and anti-cheat limits.
 * `supabase/seed.sql` mirrors these values; `tests/registry-sql-parity.test.ts`
 * fails the build if the two ever drift.
 */
export const GAME_META: GameMeta[] = [
  { id: 'speed-clicker', category: 'reaction', icon: '⚡', maxScore: 150, minDurationMs: 14000, maxPerMinute: 4 },
  { id: 'color-match', category: 'attention', icon: '🎨', maxScore: 300, minDurationMs: 28000, maxPerMinute: 3 },
  { id: 'reaction-time', category: 'reaction', icon: '⏱️', maxScore: 400, minDurationMs: 8000, maxPerMinute: 4 },
  { id: 'memory-cards-easy', category: 'memory', icon: '🃏', maxScore: 240, minDurationMs: 10000, maxPerMinute: 3 },
  { id: 'memory-cards-hard', category: 'memory', icon: '🧠', maxScore: 320, minDurationMs: 20000, maxPerMinute: 3 },
  { id: 'number-guesser', category: 'logic', icon: '🔢', maxScore: 210, minDurationMs: 5000, maxPerMinute: 4 },
  { id: 'pattern-match', category: 'memory', icon: '🔷', maxScore: 300, minDurationMs: 15000, maxPerMinute: 3 },
  { id: 'sliding-puzzle', category: 'logic', icon: '🧩', maxScore: 300, minDurationMs: 20000, maxPerMinute: 2 },
  { id: 'trail-connect', category: 'attention', icon: '🔗', maxScore: 300, minDurationMs: 10000, maxPerMinute: 3 },
  { id: 'whack-a-mole', category: 'reaction', icon: '🔨', maxScore: 400, minDurationMs: 28000, maxPerMinute: 3 },
  { id: 'math-blitz', category: 'math', icon: '➕', maxScore: 400, minDurationMs: 55000, maxPerMinute: 2 },
  { id: 'emoji-odd-one-out', category: 'attention', icon: '🔍', maxScore: 360, minDurationMs: 40000, maxPerMinute: 2 },
  { id: 'color-sequence', category: 'memory', icon: '💎', maxScore: 300, minDurationMs: 12000, maxPerMinute: 3, isNew: true },
];

export const GAME_META_BY_ID = Object.fromEntries(GAME_META.map((g) => [g.id, g])) as Record<
  GameMeta['id'],
  GameMeta
>;

/**
 * Milestone thresholds (crystal balance). Deliberately demo-friendly so a
 * judge can watch a milestone crossing live: one good game earns 15–30
 * crystals. Production deployments tune these in the `reward_tiers` table.
 */
export const REWARD_TIERS: RewardTier[] = [
  { tier: 1, threshold: 15 },
  { tier: 2, threshold: 60 },
  { tier: 3, threshold: 150 },
  { tier: 4, threshold: 400 },
];

/** Special tier minted by ops for the monthly leaderboard winner voucher. */
export const MONTHLY_CHAMPION_TIER = 99;

export const CRYSTALS_PER_SCORE_DIVISOR = 10;

export const RATE_LIMIT_WINDOW_MS = 60_000;
