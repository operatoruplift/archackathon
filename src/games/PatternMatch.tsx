import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatChip, GameFrame } from './ui';
import type { GameProps } from './types';

const GRID = 16;
const MAX_LEVELS = 10;
const POINTS_PER_LEVEL = 30;
const SHOW_MS = 1600;

function randomPattern(size: number): Set<number> {
  const cells = new Set<number>();
  while (cells.size < size) cells.add(Math.floor(Math.random() * GRID));
  return cells;
}

export function PatternMatch({ onGameOver }: GameProps) {
  const { t } = useTranslation();
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [pattern, setPattern] = useState<Set<number>>(() => randomPattern(3));
  const [showing, setShowing] = useState(true);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const endedRef = useRef(false);

  useEffect(() => {
    setShowing(true);
    setPicked(new Set());
    const timer = setTimeout(() => setShowing(false), SHOW_MS);
    return () => clearTimeout(timer);
  }, [pattern]);

  const end = (levelsDone: number) => {
    if (endedRef.current) return;
    endedRef.current = true;
    setTimeout(() => onGameOver(Math.min(MAX_LEVELS, levelsDone) * POINTS_PER_LEVEL), 500);
  };

  const tap = (cell: number) => {
    if (showing || endedRef.current || picked.has(cell)) return;
    if (pattern.has(cell)) {
      const next = new Set(picked).add(cell);
      setPicked(next);
      if (next.size === pattern.size) {
        if (level >= MAX_LEVELS) {
          end(level);
          return;
        }
        const nextLevel = level + 1;
        setTimeout(() => {
          setLevel(nextLevel);
          setPattern(randomPattern(Math.min(8, 2 + nextLevel)));
        }, 450);
      }
    } else {
      const left = lives - 1;
      setLives(left);
      if (left <= 0) end(level - 1);
    }
  };

  return (
    <GameFrame
      hud={
        <>
          <StatChip label={t('shell.level')} value={level} />
          <StatChip label="❤️" value={lives} />
        </>
      }
    >
      <div className="grid w-full max-w-md grid-cols-4 gap-2 md:gap-3">
        {Array.from({ length: GRID }, (_, i) => {
          const lit = showing && pattern.has(i);
          const good = picked.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => tap(i)}
              aria-label={`Tile ${i + 1}`}
              className={`aspect-square rounded-xl border transition-all duration-200 md:rounded-2xl ${
                lit
                  ? 'border-crystal-cyan bg-crystal-cyan/70 shadow-[0_0_24px_rgba(62,201,192,0.6)]'
                  : good
                    ? 'border-gold bg-gold/60'
                    : 'border-white/15 bg-white/5 hover:bg-white/10'
              }`}
            />
          );
        })}
      </div>
      <p className="text-sm font-semibold text-cream/60">{showing ? '👀' : '👆'}</p>
    </GameFrame>
  );
}
