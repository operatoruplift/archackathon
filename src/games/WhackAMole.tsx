import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatChip, GameFrame } from './ui';
import type { GameProps } from './types';

const GAME_SECONDS = 30;
const HOLES = 9;
const POINTS = 10;

export function WhackAMole({ onGameOver }: GameProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [moleAt, setMoleAt] = useState<number>(-1);
  const [score, setScore] = useState(0);
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

  useEffect(() => {
    const pop = setInterval(
      () => {
        if (!endedRef.current) setMoleAt(Math.floor(Math.random() * HOLES));
      },
      750 + Math.random() * 300,
    );
    return () => clearInterval(pop);
  }, []);

  const whack = (hole: number) => {
    if (endedRef.current || hole !== moleAt) return;
    scoreRef.current += POINTS;
    setScore(scoreRef.current);
    setMoleAt(-1);
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
      <div className="grid w-full max-w-md grid-cols-3 gap-3 md:gap-4">
        {Array.from({ length: HOLES }, (_, i) => (
          <button
            key={i}
            type="button"
            onPointerDown={() => whack(i)}
            aria-label={moleAt === i ? 'Mole!' : 'Empty hole'}
            className="flex aspect-square items-center justify-center rounded-full border border-white/15 bg-gradient-to-b from-white/10 to-white/5 text-5xl backdrop-blur-md transition-transform active:scale-95 md:text-6xl"
          >
            <span className={`transition-transform duration-150 ${moleAt === i ? 'scale-100' : 'scale-0'}`}>
              🐹
            </span>
          </button>
        ))}
      </div>
    </GameFrame>
  );
}
