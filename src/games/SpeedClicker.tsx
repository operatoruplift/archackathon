import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatChip, GameFrame } from './ui';
import type { GameProps } from './types';

const GAME_SECONDS = 15;

export function SpeedClicker({ onGameOver }: GameProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [clicks, setClicks] = useState(0);
  const clicksRef = useRef(0);
  const endedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          if (!endedRef.current) {
            endedRef.current = true;
            onGameOver(clicksRef.current);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onGameOver]);

  const tap = () => {
    if (endedRef.current) return;
    clicksRef.current += 1;
    setClicks(clicksRef.current);
  };

  return (
    <GameFrame
      hud={
        <>
          <StatChip label={t('shell.timeLeft')} value={`${timeLeft}s`} />
          <StatChip label={t('shell.score')} value={clicks} />
        </>
      }
    >
      <button
        type="button"
        onPointerDown={tap}
        className="flex h-56 w-56 select-none items-center justify-center rounded-full border-4 border-crystal-cyan/50 bg-gradient-to-b from-teal to-ink text-7xl shadow-[0_0_60px_rgba(62,201,192,0.35)] transition-transform duration-75 active:scale-90 md:h-72 md:w-72 md:text-8xl"
        aria-label="Tap"
      >
        ⚡
      </button>
    </GameFrame>
  );
}
