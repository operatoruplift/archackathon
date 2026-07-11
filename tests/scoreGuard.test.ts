import { describe, expect, test } from 'vitest';
import { validateScore } from '@/lib/scoreGuard';
import { GAME_META_BY_ID } from '@/lib/constants';
import type { GameId } from '@/lib/types';

const NOW = 1_800_000_000_000;

function guard(gameId: GameId, score: number, durationMs: number, recent: number[] = []) {
  return validateScore({ gameId, score, durationMs }, { recentSubmissionsMs: recent, now: NOW });
}

describe('score guard — anti-cheat gate before value moves on-chain', () => {
  test('accepts a legitimate run', () => {
    expect(guard('color-sequence', 120, 45_000)).toEqual({ ok: true });
  });

  test('rejects unknown games', () => {
    expect(guard('not-a-game' as GameId, 10, 60_000)).toEqual({ ok: false, reason: 'unknown_game' });
  });

  test('rejects negative and non-integer scores', () => {
    expect(guard('math-blitz', -5, 60_000)).toEqual({ ok: false, reason: 'invalid_score' });
    expect(guard('math-blitz', 10.5, 60_000)).toEqual({ ok: false, reason: 'invalid_score' });
  });

  test('rejects impossible scores per game', () => {
    for (const meta of Object.values(GAME_META_BY_ID)) {
      expect(guard(meta.id, meta.maxScore + 1, meta.minDurationMs + 1000)).toEqual({
        ok: false,
        reason: 'score_too_high',
      });
      expect(guard(meta.id, meta.maxScore, meta.minDurationMs)).toEqual({ ok: true });
    }
  });

  test('rejects runs finished faster than humanly possible', () => {
    expect(guard('whack-a-mole', 100, 3_000)).toEqual({ ok: false, reason: 'too_fast' });
  });

  test('rate-limits rapid submissions inside one minute', () => {
    const meta = GAME_META_BY_ID['speed-clicker'];
    const recent = Array.from({ length: meta.maxPerMinute }, (_, i) => NOW - (i + 1) * 5_000);
    expect(guard('speed-clicker', 50, 15_000, recent)).toEqual({ ok: false, reason: 'rate_limited' });
  });

  test('old submissions fall out of the rate window', () => {
    const recent = [NOW - 61_000, NOW - 120_000, NOW - 300_000, NOW - 600_000];
    expect(guard('speed-clicker', 50, 15_000, recent)).toEqual({ ok: true });
  });
});
