import { REWARD_TIERS } from './constants';
import type { RewardTier } from './types';

/** Tiers whose thresholds sit inside (prevBalance, newBalance]. */
export function crossedTiers(prevBalance: number, newBalance: number): RewardTier[] {
  return REWARD_TIERS.filter((t) => t.threshold > prevBalance && t.threshold <= newBalance);
}

/** Tiers already earned by `balance` but not yet minted. */
export function unclaimedTiers(balance: number, claimed: number[]): RewardTier[] {
  const claimedSet = new Set(claimed);
  return REWARD_TIERS.filter((t) => t.threshold <= balance && !claimedSet.has(t.tier));
}

/** The next tier to work toward, or null when all standard tiers are earned. */
export function nextTier(balance: number): RewardTier | null {
  return REWARD_TIERS.find((t) => t.threshold > balance) ?? null;
}

/** 0..1 progress from the previous threshold toward the next one. */
export function progressToNextTier(balance: number): number {
  const next = nextTier(balance);
  if (!next) return 1;
  const prev = [...REWARD_TIERS].reverse().find((t) => t.threshold <= balance);
  const floor = prev ? prev.threshold : 0;
  if (next.threshold === floor) return 1;
  return Math.min(1, Math.max(0, (balance - floor) / (next.threshold - floor)));
}

export function tierByNumber(tier: number): RewardTier | undefined {
  return REWARD_TIERS.find((t) => t.tier === tier);
}
