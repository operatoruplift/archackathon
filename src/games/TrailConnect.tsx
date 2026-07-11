import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatChip, GameFrame } from './ui';
import type { GameProps } from './types';

const COUNT = 12;
const MAX_SCORE = 300;

interface Node {
  value: number;
  cell: number;
}

/** Numbers scattered over a 4×4 grid (12 of 16 cells used). */
function scatter(): Node[] {
  const cells = Array.from({ length: 16 }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return Array.from({ length: COUNT }, (_, i) => ({ value: i + 1, cell: cells[i] }));
}

export function TrailConnect({ onGameOver }: GameProps) {
  const { t } = useTranslation();
  const nodes = useMemo(scatter, []);
  const [nextValue, setNextValue] = useState(1);
  const [errors, setErrors] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [shake, setShake] = useState<number | null>(null);
  const endedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const tap = (node: Node) => {
    if (endedRef.current) return;
    if (node.value === nextValue) {
      if (node.value === COUNT) {
        endedRef.current = true;
        const score = Math.max(0, MAX_SCORE - seconds * 4 - errors * 15);
        setTimeout(() => onGameOver(score), 500);
        return;
      }
      setNextValue(node.value + 1);
    } else if (node.value > nextValue) {
      setErrors((e) => e + 1);
      setShake(node.value);
      setTimeout(() => setShake(null), 300);
    }
  };

  const byCell = new Map(nodes.map((n) => [n.cell, n]));

  return (
    <GameFrame
      hud={
        <>
          <StatChip label="→" value={nextValue <= COUNT ? nextValue : '✓'} />
          <StatChip label={t('shell.timeLeft')} value={`${seconds}s`} />
        </>
      }
    >
      <div className="grid w-full max-w-md grid-cols-4 gap-2 md:gap-3">
        {Array.from({ length: 16 }, (_, cell) => {
          const node = byCell.get(cell);
          if (!node) return <div key={cell} className="aspect-square" />;
          const done = node.value < nextValue;
          return (
            <button
              key={cell}
              type="button"
              onClick={() => tap(node)}
              className={`aspect-square rounded-full border text-2xl font-bold transition-all duration-200 md:text-3xl ${
                done
                  ? 'border-crystal-cyan/60 bg-crystal-cyan/25 text-crystal-cyan'
                  : 'border-white/20 bg-white/10 text-cream hover:bg-white/20'
              } ${shake === node.value ? 'animate-[crystalPulse_0.3s_ease-in-out] border-red-400 bg-red-500/30' : ''}`}
            >
              {node.value}
            </button>
          );
        })}
      </div>
    </GameFrame>
  );
}
