import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatChip, GameFrame } from './ui';
import type { GameProps } from './types';

const SIZE = 3;
const MAX_SCORE = 300;
const SHUFFLE_MOVES = 60;

const SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, 0];

function neighbors(emptyIndex: number): number[] {
  const row = Math.floor(emptyIndex / SIZE);
  const col = emptyIndex % SIZE;
  const out: number[] = [];
  if (row > 0) out.push(emptyIndex - SIZE);
  if (row < SIZE - 1) out.push(emptyIndex + SIZE);
  if (col > 0) out.push(emptyIndex - 1);
  if (col < SIZE - 1) out.push(emptyIndex + 1);
  return out;
}

/** Shuffle by walking random legal moves from solved — always solvable. */
function shuffled(): number[] {
  const board = [...SOLVED];
  let empty = board.indexOf(0);
  for (let i = 0; i < SHUFFLE_MOVES; i++) {
    const options = neighbors(empty);
    const pick = options[Math.floor(Math.random() * options.length)];
    [board[empty], board[pick]] = [board[pick], board[empty]];
    empty = pick;
  }
  return board;
}

export function SlidingPuzzle({ onGameOver }: GameProps) {
  const { t } = useTranslation();
  const [board, setBoard] = useState<number[]>(shuffled);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const endedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (endedRef.current) return;
    if (board.every((v, i) => v === SOLVED[i])) {
      endedRef.current = true;
      const score = Math.max(0, MAX_SCORE - moves - seconds);
      setTimeout(() => onGameOver(score), 600);
    }
  }, [board, moves, seconds, onGameOver]);

  const slide = (index: number) => {
    if (endedRef.current) return;
    const empty = board.indexOf(0);
    if (!neighbors(empty).includes(index)) return;
    const next = [...board];
    [next[empty], next[index]] = [next[index], next[empty]];
    setBoard(next);
    setMoves((m) => m + 1);
  };

  return (
    <GameFrame
      hud={
        <>
          <StatChip label={t('shell.moves')} value={moves} />
          <StatChip label={t('shell.timeLeft')} value={`${seconds}s`} />
        </>
      }
    >
      <div className="grid w-full max-w-sm grid-cols-3 gap-2 md:gap-3">
        {board.map((value, i) =>
          value === 0 ? (
            <div key="empty" className="aspect-square rounded-xl border border-dashed border-white/10 md:rounded-2xl" />
          ) : (
            <button
              key={value}
              type="button"
              onClick={() => slide(i)}
              className="aspect-square rounded-xl border border-white/20 bg-white/10 text-4xl font-bold text-cream backdrop-blur-md transition-all duration-150 hover:bg-white/20 active:scale-95 md:rounded-2xl md:text-5xl"
            >
              {value}
            </button>
          ),
        )}
      </div>
    </GameFrame>
  );
}
