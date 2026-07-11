export type GameCategory = 'memory' | 'reaction' | 'logic' | 'attention' | 'math';

export type GameId =
  | 'speed-clicker'
  | 'color-match'
  | 'reaction-time'
  | 'memory-cards-easy'
  | 'memory-cards-hard'
  | 'number-guesser'
  | 'pattern-match'
  | 'sliding-puzzle'
  | 'trail-connect'
  | 'whack-a-mole'
  | 'math-blitz'
  | 'emoji-odd-one-out'
  | 'color-sequence';

export interface GameMeta {
  id: GameId;
  category: GameCategory;
  icon: string;
  /** Server-side guard: highest score a legitimate run can produce. */
  maxScore: number;
  /** Server-side guard: fastest a legitimate run can finish, in ms. */
  minDurationMs: number;
  /** Server-side guard: max score submissions per minute per user. */
  maxPerMinute: number;
  /** The 13th game shipped during the Arc NS Buildathon. */
  isNew?: boolean;
}

export interface ScoreSubmission {
  gameId: GameId;
  score: number;
  durationMs: number;
}

export interface RewardTier {
  tier: number;
  /** Crystal balance needed to unlock this tier. */
  threshold: number;
}

export interface Reward {
  id: string;
  tier: number;
  cnftAssetId: string | null;
  signature: string | null;
  createdAt: string;
  /** True when minted by the local demo simulator rather than on devnet. */
  demo: boolean;
}

export interface Session {
  userId: string;
  displayName: string;
  qrCardId: string;
}

export interface SubmitResult {
  accepted: boolean;
  reason?: string;
  crystalsAwarded: number;
  newBalance: number;
  /** Tiers whose thresholds were crossed by this submission. */
  unlockedTiers: number[];
}

export interface MintResult {
  tier: number;
  cnftAssetId: string | null;
  signature: string | null;
  demo: boolean;
}
