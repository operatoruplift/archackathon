import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatChip, GameFrame } from './ui';
import type { GameProps } from './types';

const GAME_SECONDS = 60;
const POINTS = 15;

interface Problem {
  text: string;
  answer: number;
  options: number[];
}

function makeProblem(): Problem {
  const add = Math.random() < 0.6;
  let a = 2 + Math.floor(Math.random() * 18);
  let b = 2 + Math.floor(Math.random() * 18);
  if (!add && b > a) [a, b] = [b, a];
  const answer = add ? a + b : a - b;
  const options = new Set<number>([answer]);
  while (options.size < 4) {
    const off = answer + (Math.floor(Math.random() * 11) - 5);
    if (off >= 0 && off !== answer) options.add(off);
  }
  return {
    text: `${a} ${add ? '+' : '−'} ${b}`,
    answer,
    options: [...options].sort(() => Math.random() - 0.5),
  };
}

export function MathBlitz({ onGameOver }: GameProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [problem, setProblem] = useState<Problem>(makeProblem);
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

  const answer = (value: number) => {
    if (endedRef.current) return;
    if (value === problem.answer) {
      scoreRef.current += POINTS;
      setScore(scoreRef.current);
      setFlash('good');
    } else {
      setFlash('bad');
    }
    setTimeout(() => setFlash(null), 180);
    setProblem(makeProblem());
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
        className={`rounded-3xl border border-white/15 px-12 py-8 text-6xl font-bold tabular-nums text-cream backdrop-blur-md transition-colors duration-150 md:text-7xl ${
          flash === 'good' ? 'bg-emerald-500/25' : flash === 'bad' ? 'bg-red-500/25' : 'bg-white/5'
        }`}
      >
        {problem.text}
      </div>
      <div className="grid w-full max-w-md grid-cols-2 gap-3 md:gap-4">
        {problem.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => answer(option)}
            className="rounded-2xl border border-white/20 bg-white/10 py-6 text-3xl font-bold tabular-nums text-cream backdrop-blur-md transition-all duration-150 hover:bg-white/20 active:scale-95 md:text-4xl"
          >
            {option}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}
