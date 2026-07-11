import { GAME_META_BY_ID, RATE_LIMIT_WINDOW_MS } from './constants';
import type { ScoreSubmission } from './types';

export type GuardFailure = 'unknown_game' | 'invalid_score' | 'score_too_high' | 'too_fast' | 'rate_limited';

export type GuardResult = { ok: true } | { ok: false; reason: GuardFailure };

export interface GuardContext {
  /** Epoch-ms timestamps of this user's recent submissions for the same game. */
  recentSubmissionsMs: number[];
  now?: number;
}

/**
 * Client mirror of the server-side score guard. The authoritative copy runs
 * in Postgres (`guard_score_insert()` trigger in
 * supabase/migrations/0002_solana_rewards.sql) — scores are client-trusted
 * today, so this guard gates the path before Crystals carry on-chain value.
 */
export function validateScore(sub: ScoreSubmission, ctx: GuardContext): GuardResult {
  const meta = GAME_META_BY_ID[sub.gameId];
  if (!meta) return { ok: false, reason: 'unknown_game' };

  if (!Number.isInteger(sub.score) || sub.score < 0) {
    return { ok: false, reason: 'invalid_score' };
  }
  if (sub.score > meta.maxScore) {
    return { ok: false, reason: 'score_too_high' };
  }
  if (!Number.isFinite(sub.durationMs) || sub.durationMs < meta.minDurationMs) {
    return { ok: false, reason: 'too_fast' };
  }

  const now = ctx.now ?? Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recent = ctx.recentSubmissionsMs.filter((t) => t > windowStart);
  if (recent.length >= meta.maxPerMinute) {
    return { ok: false, reason: 'rate_limited' };
  }

  return { ok: true };
}
