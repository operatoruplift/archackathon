import { describe, expect, test } from 'vitest';
import { crossedTiers, unclaimedTiers, nextTier, progressToNextTier } from '@/lib/milestones';
import { REWARD_TIERS } from '@/lib/constants';

describe('milestone tiers', () => {
  test('tiers are strictly increasing', () => {
    const thresholds = REWARD_TIERS.map((t) => t.threshold);
    expect([...thresholds].sort((a, b) => a - b)).toEqual(thresholds);
    expect(new Set(thresholds).size).toBe(thresholds.length);
  });

  test('crossing detects thresholds inside (prev, next]', () => {
    expect(crossedTiers(0, 14).map((t) => t.tier)).toEqual([]);
    expect(crossedTiers(0, 15).map((t) => t.tier)).toEqual([1]);
    expect(crossedTiers(14, 16).map((t) => t.tier)).toEqual([1]);
    expect(crossedTiers(15, 16).map((t) => t.tier)).toEqual([]);
    expect(crossedTiers(38, 70).map((t) => t.tier)).toEqual([2]);
    expect(crossedTiers(0, 500).map((t) => t.tier)).toEqual([1, 2, 3, 4]);
  });

  test('unclaimed = earned minus already minted', () => {
    expect(unclaimedTiers(70, [1]).map((t) => t.tier)).toEqual([2]);
    expect(unclaimedTiers(70, [1, 2]).map((t) => t.tier)).toEqual([]);
    expect(unclaimedTiers(1000, []).map((t) => t.tier)).toEqual([1, 2, 3, 4]);
  });

  test('nextTier points at the next goal', () => {
    expect(nextTier(0)?.tier).toBe(1);
    expect(nextTier(15)?.tier).toBe(2);
    expect(nextTier(399)?.tier).toBe(4);
    expect(nextTier(400)).toBeNull();
  });

  test('progress stays within [0, 1]', () => {
    expect(progressToNextTier(0)).toBe(0);
    expect(progressToNextTier(500)).toBe(1);
    const mid = progressToNextTier(38);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
  });
});
