import { describe, expect, test } from 'vitest';
import { crystalsForScore } from '@/lib/crystals';

describe('crystalsForScore — mirrors award_crystals_for_score()', () => {
  test('awards FLOOR(score / 10) crystals', () => {
    expect(crystalsForScore(0)).toBe(0);
    expect(crystalsForScore(9)).toBe(0);
    expect(crystalsForScore(10)).toBe(1);
    expect(crystalsForScore(159)).toBe(15);
    expect(crystalsForScore(300)).toBe(30);
  });

  test('never awards for invalid input', () => {
    expect(crystalsForScore(-50)).toBe(0);
    expect(crystalsForScore(Number.NaN)).toBe(0);
    expect(crystalsForScore(Number.POSITIVE_INFINITY)).toBe(0);
  });
});
