import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatChip, GameFrame } from './ui';
import type { GameProps } from './types';

const MAX_TRIES = 7;
const POINTS_PER_SPARE_TRY = 30;

export function NumberGuesser({ onGameOver }: GameProps) {
  const { t } = useTranslation();
  const secretRef = useRef(1 + Math.floor(Math.random() * 100));
  const [guess, setGuess] = useState(50);
  const [tries, setTries] = useState(0);
  const [hint, setHint] = useState<'up' | 'down' | null>(null);
  const endedRef = useRef(false);

  const submit = () => {
    if (endedRef.current) return;
    const used = tries + 1;
    setTries(used);
    if (guess === secretRef.current) {
      endedRef.current = true;
      setTimeout(() => onGameOver(Math.max(0, (MAX_TRIES + 1 - used) * POINTS_PER_SPARE_TRY)), 500);
      return;
    }
    if (used >= MAX_TRIES) {
      endedRef.current = true;
      setTimeout(() => onGameOver(0), 500);
      return;
    }
    setHint(guess < secretRef.current ? 'up' : 'down');
  };

  const bump = (delta: number) => setGuess((g) => Math.min(100, Math.max(1, g + delta)));

  return (
    <GameFrame
      hud={
        <>
          <StatChip label={t('shell.round')} value={`${tries}/${MAX_TRIES}`} />
          {hint && <StatChip label="1–100" value={hint === 'up' ? '⬆️' : '⬇️'} />}
        </>
      }
    >
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur-md md:p-10">
        <div className="text-7xl font-bold tabular-nums text-cream md:text-8xl">{guess}</div>
        <input
          type="range"
          min={1}
          max={100}
          value={guess}
          onChange={(e) => setGuess(Number(e.target.value))}
          className="w-64 accent-crystal-cyan md:w-80"
          aria-label="Guess"
        />
        <div className="flex items-center gap-3">
          {[-10, -1, +1, +10].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => bump(d)}
              className="h-14 w-14 rounded-xl border border-white/20 bg-white/10 text-lg font-bold text-cream backdrop-blur-md transition-transform active:scale-95"
            >
              {d > 0 ? `+${d}` : d}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={submit}
          className="rounded-full bg-gold px-10 py-4 text-xl font-bold text-ink transition-transform hover:scale-105 active:scale-95"
        >
          {t('shell.go')}
        </button>
      </div>
    </GameFrame>
  );
}
