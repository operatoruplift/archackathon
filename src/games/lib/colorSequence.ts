/**
 * Pure logic for Crystal Sequence — the 13th game shipped during the
 * Arc NS Buildathon. Kept free of React so the rules are unit-testable.
 */

export const SEQUENCE_COLORS = ['cyan', 'violet', 'gold', 'emerald'] as const;
export type SeqColor = (typeof SEQUENCE_COLORS)[number];

export const POINTS_PER_LEVEL = 20;
export const MAX_SEQUENCE_SCORE = 300;

/** Append one random crystal to the sequence. */
export function growSequence(prev: SeqColor[], rand: () => number = Math.random): SeqColor[] {
  const index = Math.min(SEQUENCE_COLORS.length - 1, Math.floor(rand() * SEQUENCE_COLORS.length));
  return [...prev, SEQUENCE_COLORS[index]];
}

/** Is the player's tap correct for this position in the sequence? */
export function isCorrectStep(sequence: SeqColor[], stepIndex: number, tapped: SeqColor): boolean {
  return sequence[stepIndex] === tapped;
}

/** Score for the number of fully completed levels. */
export function scoreForLevels(levelsCompleted: number): number {
  if (levelsCompleted <= 0) return 0;
  return Math.min(MAX_SEQUENCE_SCORE, levelsCompleted * POINTS_PER_LEVEL);
}

/** Playback speeds up slightly as levels progress. */
export function flashDurationMs(level: number): number {
  return Math.max(320, 620 - level * 25);
}
