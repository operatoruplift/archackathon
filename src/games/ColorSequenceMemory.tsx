import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatChip, GameFrame } from './ui';
import {
  SEQUENCE_COLORS,
  growSequence,
  isCorrectStep,
  scoreForLevels,
  flashDurationMs,
  type SeqColor,
} from './lib/colorSequence';
import type { GameProps } from './types';

const REPLAYS_ALLOWED = 2;
const GAP_MS = 180;

const CRYSTAL_STYLE: Record<SeqColor, { base: string; lit: string; tone: number }> = {
  cyan: {
    base: 'from-[#1E7D96]/60 to-[#0F4C5C]/60 border-crystal-cyan/40',
    lit: 'from-[#8FE9E2] to-[#3EC9C0] border-white shadow-[0_0_60px_rgba(62,201,192,0.9)]',
    tone: 523.25,
  },
  violet: {
    base: 'from-[#5A3FD6]/60 to-[#2E2270]/60 border-crystal-violet/40',
    lit: 'from-[#B3A0FF] to-[#7C5CFF] border-white shadow-[0_0_60px_rgba(124,92,255,0.9)]',
    tone: 659.25,
  },
  gold: {
    base: 'from-[#C9972F]/60 to-[#6E5117]/60 border-gold/40',
    lit: 'from-[#F0CD82] to-[#C9972F] border-white shadow-[0_0_60px_rgba(201,151,47,0.9)]',
    tone: 783.99,
  },
  emerald: {
    base: 'from-[#2F9E5B]/60 to-[#17512E]/60 border-emerald-300/40',
    lit: 'from-[#8FE3B0] to-[#2F9E5B] border-white shadow-[0_0_60px_rgba(47,158,91,0.9)]',
    tone: 440,
  },
};

type Phase = 'watch' | 'input' | 'gameover';

/**
 * Crystal Sequence — the 13th game, shipped during the Arc NS Buildathon.
 * Watch the crystals glow, then repeat the sequence. Gentle tones support
 * players with lower vision; two "show again" lifelines keep it kind.
 */
export function ColorSequenceMemory({ onGameOver }: GameProps) {
  const { t } = useTranslation();
  const [sequence, setSequence] = useState<SeqColor[]>(() => growSequence([]));
  const [phase, setPhase] = useState<Phase>('watch');
  const [lit, setLit] = useState<SeqColor | null>(null);
  const [step, setStep] = useState(0);
  const [replaysLeft, setReplaysLeft] = useState(REPLAYS_ALLOWED);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioRef = useRef<AudioContext | null>(null);
  const endedRef = useRef(false);

  const level = sequence.length;

  const playTone = useCallback((color: SeqColor) => {
    try {
      audioRef.current ??= new AudioContext();
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = CRYSTAL_STYLE[color].tone;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      /* audio is best-effort */
    }
  }, []);

  const playback = useCallback(
    (seq: SeqColor[]) => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setPhase('watch');
      setStep(0);
      const flash = flashDurationMs(seq.length);
      seq.forEach((color, i) => {
        timersRef.current.push(
          setTimeout(
            () => {
              setLit(color);
              playTone(color);
            },
            400 + i * (flash + GAP_MS),
          ),
        );
        timersRef.current.push(setTimeout(() => setLit(null), 400 + i * (flash + GAP_MS) + flash));
      });
      timersRef.current.push(
        setTimeout(() => setPhase('input'), 400 + seq.length * (flash + GAP_MS) + 100),
      );
    },
    [playTone],
  );

  useEffect(() => {
    playback(sequence);
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, [sequence, playback]);

  useEffect(
    () => () => {
      void audioRef.current?.close().catch(() => undefined);
    },
    [],
  );

  const tap = (color: SeqColor) => {
    if (phase !== 'input' || endedRef.current) return;
    playTone(color);
    setLit(color);
    setTimeout(() => setLit(null), 220);

    if (!isCorrectStep(sequence, step, color)) {
      endedRef.current = true;
      setPhase('gameover');
      setTimeout(() => onGameOver(scoreForLevels(level - 1)), 700);
      return;
    }
    const nextStep = step + 1;
    if (nextStep === sequence.length) {
      setTimeout(() => setSequence((seq) => growSequence(seq)), 650);
    }
    setStep(nextStep);
  };

  const replay = () => {
    if (phase !== 'input' || replaysLeft <= 0) return;
    setReplaysLeft((r) => r - 1);
    playback(sequence);
  };

  return (
    <GameFrame
      hud={
        <>
          <StatChip label={t('shell.level')} value={level} />
          <StatChip label={t('shell.score')} value={scoreForLevels(level - 1)} />
        </>
      }
    >
      <div className="grid w-full max-w-md grid-cols-2 gap-3 md:gap-4">
        {SEQUENCE_COLORS.map((color) => {
          const style = CRYSTAL_STYLE[color];
          const isLit = lit === color;
          return (
            <button
              key={color}
              type="button"
              onPointerDown={() => tap(color)}
              disabled={phase !== 'input'}
              aria-label={`${color} crystal`}
              className={`flex aspect-square items-center justify-center rounded-3xl border bg-gradient-to-b backdrop-blur-md transition-all duration-150 ${
                isLit ? style.lit : style.base
              } ${phase === 'input' ? 'active:scale-95' : 'cursor-default'}`}
            >
              <svg viewBox="0 0 100 130" className={`h-24 w-16 md:h-32 md:w-24 ${isLit ? '' : 'opacity-80'}`} aria-hidden="true">
                <polygon points="50,4 92,42 78,126 22,126 8,42" fill="#FFFFFF" opacity={isLit ? 0.9 : 0.25} />
                <polygon points="50,4 78,126 22,126" fill="#FFFFFF" opacity={isLit ? 0.5 : 0.12} />
              </svg>
            </button>
          );
        })}
      </div>

      <div className="flex h-12 items-center gap-4">
        {phase === 'watch' && <span className="text-2xl" aria-hidden="true">👀</span>}
        {phase === 'input' && (
          <>
            <span className="text-2xl" aria-hidden="true">👆</span>
            <span className="text-sm font-semibold tabular-nums text-cream/70">
              {step}/{sequence.length}
            </span>
            {replaysLeft > 0 && (
              <button
                type="button"
                onClick={replay}
                className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-cream backdrop-blur-md transition-colors hover:bg-white/20"
              >
                🔁 ×{replaysLeft}
              </button>
            )}
          </>
        )}
        {phase === 'gameover' && <span className="text-2xl" aria-hidden="true">💫</span>}
      </div>
    </GameFrame>
  );
}
