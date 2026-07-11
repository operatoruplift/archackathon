import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatChip, GameFrame } from './ui';
import type { GameProps } from './types';

const GAME_SECONDS = 30;
const POINTS = 10;

const SWATCHES = ['#3EC9C0', '#7C5CFF', '#C9972F', '#2F9E5B', '#D9534F', '#3B82D6'];

interface Round {
  left: string;
  right: string;
}

function makeRound(): Round {
  const left = SWATCHES[Math.floor(Math.random() * SWATCHES.length)];
  const same = Math.random() < 0.5;
  const right = same
    ? left
    : SWATCHES.filter((c) => c !== left)[Math.floor(Math.random() * (SWATCHES.length - 1))];
  return { left, right };
}

/** Language-neutral attention check: do the two crystals match? */
export function ColorMatch({ onGameOver }: GameProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [round, setRound] = useState<Round>(makeRound);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null);
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

  const answer = (saidMatch: boolean) => {
    if (endedRef.current) return;
    const isMatch = round.left === round.right;
    if (saidMatch === isMatch) {
      scoreRef.current += POINTS;
      setScore(scoreRef.current);
      setFlash('good');
    } else {
      setFlash('bad');
    }
    setTimeout(() => setFlash(null), 200);
    setRound(makeRound());
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
      <div
        className={`flex items-center gap-6 rounded-2xl border border-white/15 p-6 backdrop-blur-md transition-colors duration-200 md:gap-10 md:p-10 ${
          flash === 'good' ? 'bg-emerald-500/20' : flash === 'bad' ? 'bg-red-500/20' : 'bg-white/5'
        }`}
      >
        {[round.left, round.right].map((color, i) => (
          <svg key={i} viewBox="0 0 100 130" className="h-32 w-24 md:h-44 md:w-32" aria-hidden="true">
            <polygon points="50,4 92,42 78,126 22,126 8,42" fill={color} />
            <polygon points="50,4 78,126 22,126" fill="#fff" opacity="0.18" />
          </svg>
        ))}
      </div>
      <div className="flex gap-4 md:gap-6">
        <button
          type="button"
          onClick={() => answer(true)}
          className="h-20 w-32 rounded-2xl border border-emerald-300/40 bg-emerald-500/25 text-4xl text-emerald-100 backdrop-blur-md transition-transform active:scale-95 md:h-24 md:w-40"
          aria-label="Match"
        >
          ✓
        </button>
        <button
          type="button"
          onClick={() => answer(false)}
          className="h-20 w-32 rounded-2xl border border-red-300/40 bg-red-500/25 text-4xl text-red-100 backdrop-blur-md transition-transform active:scale-95 md:h-24 md:w-40"
          aria-label="No match"
        >
          ✗
        </button>
      </div>
    </GameFrame>
  );
}
