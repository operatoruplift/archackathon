import { describe, expect, test } from 'vitest';
import {
  SEQUENCE_COLORS,
  growSequence,
  isCorrectStep,
  scoreForLevels,
  flashDurationMs,
  MAX_SEQUENCE_SCORE,
} from '@/games/lib/colorSequence';

describe('Crystal Sequence — the 13th game', () => {
  test('grows by exactly one valid crystal per level', () => {
    let seq = growSequence([]);
    expect(seq).toHaveLength(1);
    seq = growSequence(seq);
    expect(seq).toHaveLength(2);
    for (const color of seq) expect(SEQUENCE_COLORS).toContain(color);
  });

  test('growth is deterministic under an injected RNG', () => {
    expect(growSequence([], () => 0)).toEqual(['cyan']);
    expect(growSequence([], () => 0.99)).toEqual(['emerald']);
    expect(growSequence(['gold'], () => 0.3)).toEqual(['gold', 'violet']);
  });

  test('verifies taps positionally', () => {
    const seq = ['cyan', 'gold', 'cyan'] as const;
    expect(isCorrectStep([...seq], 0, 'cyan')).toBe(true);
    expect(isCorrectStep([...seq], 1, 'cyan')).toBe(false);
    expect(isCorrectStep([...seq], 2, 'cyan')).toBe(true);
  });

  test('scores 20 per completed level, capped at 300', () => {
    expect(scoreForLevels(0)).toBe(0);
    expect(scoreForLevels(-1)).toBe(0);
    expect(scoreForLevels(1)).toBe(20);
    expect(scoreForLevels(7)).toBe(140);
    expect(scoreForLevels(15)).toBe(MAX_SEQUENCE_SCORE);
    expect(scoreForLevels(50)).toBe(MAX_SEQUENCE_SCORE);
  });

  test('playback accelerates but never below the floor', () => {
    expect(flashDurationMs(1)).toBeGreaterThan(flashDurationMs(5));
    expect(flashDurationMs(100)).toBe(320);
  });
});
