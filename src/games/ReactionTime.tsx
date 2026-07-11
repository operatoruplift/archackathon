import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatChip, GameFrame } from './ui';
import type { GameProps } from './types';

const ROUNDS = 5;
const MAX_SCORE = 400;

type Phase = 'waiting' | 'ready' | 'tapped' | 'early';

export function ReactionTime({ onGameOver }: GameProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('waiting');
  const [round, setRound] = useState(1);
  const [lastMs, setLastMs] = useState<number | null>(null);
  const timesRef = useRef<number[]>([]);
  const readyAtRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const arm = () => {
    setPhase('waiting');
    timeoutRef.current = setTimeout(() => {
      readyAtRef.current = performance.now();
      setPhase('ready');
    }, 1000 + Math.random() * 2200);
  };

  useEffect(() => {
    arm();
    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = () => {
    const avg = timesRef.current.reduce((a, b) => a + b, 0) / timesRef.current.length;
    onGameOver(Math.max(0, Math.min(MAX_SCORE, Math.round(MAX_SCORE - avg))));
  };

  const tap = () => {
    if (phase === 'ready') {
      const ms = Math.round(performance.now() - readyAtRef.current);
      timesRef.current.push(ms);
      setLastMs(ms);
      setPhase('tapped');
    } else if (phase === 'waiting') {
      clearTimeout(timeoutRef.current);
      setPhase('early');
    }
  };

  const nextRound = () => {
    if (timesRef.current.length >= ROUNDS) {
      finish();
      return;
    }
    setRound(timesRef.current.length + 1);
    arm();
  };

  const surface: Record<Phase, string> = {
    waiting: 'bg-red-500/20 border-red-300/30',
    ready: 'bg-emerald-500/30 border-emerald-300/50 shadow-[0_0_80px_rgba(47,158,91,0.4)]',
    tapped: 'bg-white/10 border-white/20',
    early: 'bg-amber-500/20 border-amber-300/40',
  };

  return (
    <GameFrame
      hud={
        <>
          <StatChip label={t('shell.round')} value={`${round}/${ROUNDS}`} />
          {lastMs !== null && <StatChip label="ms" value={lastMs} />}
        </>
      }
    >
      <button
        type="button"
        onPointerDown={phase === 'waiting' || phase === 'ready' ? tap : undefined}
        onClick={phase === 'tapped' || phase === 'early' ? nextRound : undefined}
        className={`flex h-72 w-full max-w-xl select-none flex-col items-center justify-center gap-3 rounded-3xl border text-cream backdrop-blur-md transition-colors duration-150 md:h-80 ${surface[phase]}`}
      >
        <span className="text-6xl md:text-7xl">
          {phase === 'waiting' ? '🔴' : phase === 'ready' ? '🟢' : phase === 'early' ? '⚠️' : '👍'}
        </span>
        <span className="text-2xl font-bold md:text-3xl">
          {phase === 'waiting' && '…'}
          {phase === 'ready' && t('shell.go')}
          {phase === 'tapped' && `${lastMs} ms`}
          {phase === 'early' && '!'}
        </span>
      </button>
    </GameFrame>
  );
}
