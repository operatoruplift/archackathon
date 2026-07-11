import type { ComponentType } from 'react';
import type { GameId } from '@/lib/types';
import type { GameProps } from './types';
import { SpeedClicker } from './SpeedClicker';
import { ColorMatch } from './ColorMatch';
import { ReactionTime } from './ReactionTime';
import { MemoryCardsEasy, MemoryCardsHard } from './MemoryCards';
import { NumberGuesser } from './NumberGuesser';
import { PatternMatch } from './PatternMatch';
import { SlidingPuzzle } from './SlidingPuzzle';
import { TrailConnect } from './TrailConnect';
import { WhackAMole } from './WhackAMole';
import { MathBlitz } from './MathBlitz';
import { EmojiOddOneOut } from './EmojiOddOneOut';
import { ColorSequenceMemory } from './ColorSequenceMemory';

/**
 * The "3-edit pattern" for adding a game: (1) the component below,
 * (2) its row in src/lib/constants.ts + supabase/seed.sql,
 * (3) its name/how-to strings in src/i18n/locales/*.
 */
export const gameComponents: Record<GameId, ComponentType<GameProps>> = {
  'speed-clicker': SpeedClicker,
  'color-match': ColorMatch,
  'reaction-time': ReactionTime,
  'memory-cards-easy': MemoryCardsEasy,
  'memory-cards-hard': MemoryCardsHard,
  'number-guesser': NumberGuesser,
  'pattern-match': PatternMatch,
  'sliding-puzzle': SlidingPuzzle,
  'trail-connect': TrailConnect,
  'whack-a-mole': WhackAMole,
  'math-blitz': MathBlitz,
  'emoji-odd-one-out': EmojiOddOneOut,
  'color-sequence': ColorSequenceMemory,
};
