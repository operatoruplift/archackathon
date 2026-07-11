import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatChip, GameFrame } from './ui';
import type { GameProps } from './types';

const GAME_SECONDS = 45;
const POINTS = 12;
const GRID = 9;

const PAIRS: [string, string][] = [
  ['😺', '😸'],
  ['🍎', '🍅'],
  ['🌸', '💮'],
  ['🐢', '🐊'],
  ['🌕', '🌖'],
  ['🍊', '🎃'],
  ['⭐', '🌟'],
  ['🦆', '🐤'],
];

interface Round {
  common: string;
  odd: string;
  oddIndex: number;
}

function makeRound(): Round {
  const [a, b] = PAIRS[Math.floor(Math.random() * PAIRS.length)];
  const flip = Math.random() < 0.5;
  return {
    common: flip ? a : b,
    odd: flip ? b : a,
    oddIndex: Math.floor(Math.random() * GRID),
  };
}

export function EmojiOddOneOut({ onGameOver }: GameProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [round, setRound] = useState<Round>(makeRound);
  const [score, setScore] = useState(0);
  const [wrongAt, setWrongAt] = useState<number | null>(null);
  const scoreRef = useRef(0);
  const endedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          if (!endedRef.current) {
            endedRef.current = true;
            onGameOver(scoreRef.current);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onGameOver]);

  const tap = (index: number) => {
    if (endedRef.current) return;
    if (index === round.oddIndex) {
      scoreRef.current += POINTS;
      setScore(scoreRef.current);
      setRound(makeRound());
    } else {
      setWrongAt(index);
      setTimeout(() => setWrongAt(null), 250);
    }
  };

  return (
    <GameFrame
      hud={
        <>
          <StatChip label={t('shell.timeLeft')} value={`${timeLeft}s`} />
          <StatChip label={t('shell.score')} value={score} />
        </>
      }
    >
      <div className="grid w-full max-w-md grid-cols-3 gap-2 md:gap-3">
        {Array.from({ length: GRID }, (_, i) => (
          <button
            key={`${round.common}-${i}`}
            type="button"
            onClick={() => tap(i)}
            className={`flex aspect-square items-center justify-center rounded-xl border text-5xl backdrop-blur-md transition-all duration-150 active:scale-95 md:rounded-2xl md:text-6xl ${
              wrongAt === i ? 'border-red-400 bg-red-500/25' : 'border-white/15 bg-white/5 hover:bg-white/10'
            }`}
            aria-label={`Cell ${i + 1}`}
          >
            {i === round.oddIndex ? round.odd : round.common}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}
