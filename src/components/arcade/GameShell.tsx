import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { gameComponents } from '@/games/registry';
import { GAME_META_BY_ID } from '@/lib/constants';
import { crystalsForScore } from '@/lib/crystals';
import { explorerTxUrl, explorerAddressUrl } from '@/lib/solana';
import { useArcade } from '@/context/ArcadeContext';
import type { GameId, MintResult } from '@/lib/types';

type Phase = 'howto' | 'countdown' | 'playing' | 'summary';
type SubmitState = 'idle' | 'saving' | 'saved' | { rejected: string };

interface MintProgress {
  tier: number;
  status: 'minting' | 'done';
  result?: MintResult;
}

interface GameShellProps {
  gameId: GameId;
  onClose: () => void;
}

const COUNTDOWN_STEP_MS = 700;

export function GameShell({ gameId, onClose }: GameShellProps) {
  const { t } = useTranslation();
  const { provider } = useArcade();
  const queryClient = useQueryClient();
  const meta = GAME_META_BY_ID[gameId];
  const Game = gameComponents[gameId];

  const [phase, setPhase] = useState<Phase>('howto');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [mint, setMint] = useState<MintProgress | null>(null);
  const startRef = useRef(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      startRef.current = Date.now();
      setPhase('playing');
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), COUNTDOWN_STEP_MS);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    setPhase('summary');
  }, []);

  const restart = () => {
    setScore(0);
    setSubmitState('idle');
    setCountdown(3);
    setPhase('countdown');
  };

  const submit = async () => {
    setSubmitState('saving');
    try {
      const result = await provider.submitScore({
        gameId,
        score,
        durationMs: Date.now() - startRef.current,
      });
      if (!result.accepted) {
        setSubmitState({ rejected: result.reason ?? 'generic' });
        return;
      }
      setSubmitState('saved');
      await queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success(t('toasts.crystalsEarned', { count: result.crystalsAwarded }));

      for (const tier of result.unlockedTiers) {
        toast(t('toasts.milestone', { name: t(`rewards.tier${tier}Name`) }), { icon: '💎' });
        setMint({ tier, status: 'minting' });
        try {
          const minted = await provider.mintTier(tier);
          setMint({ tier, status: 'done', result: minted });
          toast.success(minted.demo ? t('toasts.mintDemo') : t('toasts.mintSuccess'));
          await queryClient.invalidateQueries({ queryKey: ['rewards'] });
          // hold the celebration so the player (and the judges) can see it
          await new Promise((resolve) => setTimeout(resolve, 3200));
        } catch {
          toast.error(t('shell.rejected_generic'));
        }
        setMint(null);
      }
    } catch {
      setSubmitState({ rejected: 'generic' });
    }
  };

  const rejectionText = (reason: string): string => {
    const known = ['score_too_high', 'too_fast', 'rate_limited'];
    return known.includes(reason) ? t(`shell.rejected_${reason}`) : t('shell.rejected_generic');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(`games.${gameId}.name`)}
      className="fixed inset-0 z-[70] flex flex-col bg-gradient-to-b from-ink via-[#0E3B49] to-[#081E27]"
    >
      <header className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('shell.exit')}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-cream backdrop-blur-md transition-colors hover:bg-white/20"
        >
          <X size={20} strokeWidth={2} />
        </button>
        <div className="flex items-center gap-2 text-cream">
          <span className="text-2xl" aria-hidden="true">
            {meta.icon}
          </span>
          <span className="text-lg font-bold md:text-xl">{t(`games.${gameId}.name`)}</span>
          {meta.isNew && (
            <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ink">
              {t('arcade.newBadge')}
            </span>
          )}
        </div>
        <div className="w-11" aria-hidden="true" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-4 pb-6 md:px-6">
        {phase === 'howto' && (
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/5 p-8 text-center backdrop-blur-md md:p-10">
              <div className="mb-4 text-6xl" aria-hidden="true">
                {meta.icon}
              </div>
              <h2 className="mb-2 text-2xl font-bold text-cream md:text-3xl">{t(`games.${gameId}.name`)}</h2>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cream/50">
                {t('shell.howToPlay')}
              </p>
              <p className="mb-8 text-lg leading-relaxed text-cream/90">{t(`games.${gameId}.howTo`)}</p>
              <button
                type="button"
                autoFocus
                onClick={() => setPhase('countdown')}
                className="w-full rounded-full bg-gold py-4 text-xl font-bold text-ink transition-transform hover:scale-[1.02] active:scale-95"
              >
                {t('shell.start')}
              </button>
            </div>
          </div>
        )}

        {phase === 'countdown' && (
          <div className="flex flex-1 items-center justify-center" aria-live="assertive">
            <span
              key={countdown}
              className="animate-scale-in font-display text-[10rem] font-bold text-cream md:text-[14rem]"
            >
              {countdown > 0 ? countdown : t('shell.go')}
            </span>
          </div>
        )}

        {phase === 'playing' && <Game onGameOver={handleGameOver} />}

        {phase === 'summary' && (
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/5 p-8 text-center backdrop-blur-md md:p-10">
              <h2 className="mb-6 text-2xl font-bold text-cream md:text-3xl">{t('shell.gameOver')}</h2>
              <p className="text-xs font-semibold uppercase tracking-widest text-cream/50">
                {t('shell.yourScore')}
              </p>
              <p className="mb-2 font-display text-8xl font-bold tabular-nums text-cream">{score}</p>
              <p className="mb-8 inline-block rounded-full bg-gold/20 px-4 py-1.5 text-lg font-bold text-gold">
                💎 {t('shell.crystalsEarned', { count: crystalsForScore(score) })}
              </p>

              {typeof submitState === 'object' && (
                <div className="mb-6 rounded-2xl border border-red-300/30 bg-red-500/15 p-4 text-left">
                  <p className="font-bold text-red-200">{t('shell.rejectedTitle')}</p>
                  <p className="text-sm text-red-100/80">{rejectionText(submitState.rejected)}</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {submitState === 'idle' || submitState === 'saving' ? (
                  <button
                    type="button"
                    disabled={submitState === 'saving'}
                    onClick={() => void submit()}
                    className="w-full rounded-full bg-gold py-4 text-xl font-bold text-ink transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                  >
                    {submitState === 'saving' ? t('shell.submitting') : t('shell.submit')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={restart}
                    className="w-full rounded-full bg-gold py-4 text-xl font-bold text-ink transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    {t('shell.playAgain')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-full border border-white/25 bg-white/10 py-4 text-lg font-semibold text-cream backdrop-blur-md transition-colors hover:bg-white/20"
                >
                  {t('shell.exit')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Milestone mint celebration */}
      {mint && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink/70 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-3xl border border-gold/40 bg-gradient-to-b from-ink to-[#081E27] p-8 text-center shadow-[0_0_80px_rgba(201,151,47,0.35)]">
            <img
              src={`/cnft/tier-${mint.tier}.svg`}
              alt=""
              width={800}
              height={800}
              className={`mx-auto mb-4 h-36 w-36 rounded-2xl ${mint.status === 'minting' ? 'animate-crystal-pulse' : ''}`}
            />
            <h3 className="mb-1 text-2xl font-bold text-cream">{t('rewards.unlocked')}</h3>
            <p className="mb-4 text-sm text-cream/70">
              {t('rewards.unlockedDesc', { tier: t(`rewards.tier${mint.tier}Name`) })}
            </p>
            {mint.status === 'minting' ? (
              <p className="flex items-center justify-center gap-2 text-sm font-semibold text-crystal-cyan">
                <span className="h-2 w-2 animate-ping rounded-full bg-crystal-cyan" />
                {t('rewards.minting')}
              </p>
            ) : (
              <div className="flex flex-col items-center gap-2">
                {mint.result?.demo ? (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cream/70">
                    {t('rewards.demoTag')}
                  </span>
                ) : (
                  <span className="rounded-full bg-crystal-cyan/20 px-3 py-1 text-xs font-semibold text-crystal-cyan">
                    {t('rewards.onchainTag')} ✓
                  </span>
                )}
                {mint.result?.signature && (
                  <a
                    href={explorerTxUrl(mint.result.signature)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-gold underline underline-offset-4"
                  >
                    {t('rewards.viewTx')} ↗
                  </a>
                )}
                {mint.result?.cnftAssetId && !mint.result.demo && (
                  <a
                    href={explorerAddressUrl(mint.result.cnftAssetId)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-gold underline underline-offset-4"
                  >
                    {t('rewards.viewAsset')} ↗
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
