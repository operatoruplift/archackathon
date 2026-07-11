import { CRYSTALS_PER_SCORE_DIVISOR } from './constants';

/**
 * Mirrors the production Postgres trigger `award_crystals_for_score()`:
 * Crystals awarded = FLOOR(score / 10). The trigger stays the source of
 * truth on-server; this mirror only drives optimistic UI.
 */
export function crystalsForScore(score: number): number {
  if (!Number.isFinite(score) || score <= 0) return 0;
  return Math.floor(score / CRYSTALS_PER_SCORE_DIVISOR);
}
