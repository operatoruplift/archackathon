import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExternalLink, Lock, Sparkles } from 'lucide-react';
import { REWARD_TIERS, MONTHLY_CHAMPION_TIER } from '@/lib/constants';
import { explorerTxUrl, explorerAddressUrl } from '@/lib/solana';
import { useArcade } from '@/context/ArcadeContext';
import { useBalance, useRewards } from '@/hooks/useArcadeQueries';
import { ArcadeHeader } from '@/components/arcade/ArcadeHeader';
import { WalletChip } from '@/components/arcade/WalletChip';
import type { Reward } from '@/lib/types';

type TierState =
  | { kind: 'claimed'; reward: Reward }
  | { kind: 'claimable' }
  | { kind: 'locked' };

export default function Rewards() {
  const { t } = useTranslation();
  const { session, provider } = useArcade();
  const { data: balance = 0 } = useBalance();
  const { data: rewards = [] } = useRewards();
  const queryClient = useQueryClient();
  const [claiming, setClaiming] = useState<number | null>(null);

  if (!session) return <Navigate to="/login" replace />;

  const stateFor = (tier: number, threshold: number): TierState => {
    const reward = rewards.find((r) => r.tier === tier);
    if (reward) return { kind: 'claimed', reward };
    if (balance >= threshold) return { kind: 'claimable' };
    return { kind: 'locked' };
  };

  const claim = async (tier: number) => {
    setClaiming(tier);
    try {
      const result = await provider.mintTier(tier);
      toast.success(result.demo ? t('toasts.mintDemo') : t('toasts.mintSuccess'));
      await queryClient.invalidateQueries({ queryKey: ['rewards'] });
    } catch {
      toast.error(t('shell.rejected_generic'));
    } finally {
      setClaiming(null);
    }
  };

  const champion = rewards.find((r) => r.tier === MONTHLY_CHAMPION_TIER);

  return (
    <div className="min-h-screen bg-cream">
      <ArcadeHeader active="rewards" />

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">{t('rewards.title')}</h1>
        <p className="mt-2 max-w-2xl text-ink/70">{t('rewards.subtitle')}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <WalletChip />
          {provider.kind === 'demo' && (
            <span className="rounded-full border border-amber-400/40 bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900">
              {t('rewards.demoNote')}
            </span>
          )}
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REWARD_TIERS.map(({ tier, threshold }) => {
            const state = stateFor(tier, threshold);
            const claimed = state.kind === 'claimed';
            return (
              <li
                key={tier}
                className={`relative flex flex-col overflow-hidden rounded-3xl border p-5 transition-all duration-300 ${
                  claimed
                    ? 'border-gold/50 bg-gradient-to-b from-ink to-[#0A2833] shadow-[0_0_40px_rgba(201,151,47,0.25)]'
                    : state.kind === 'claimable'
                      ? 'border-crystal-cyan/50 bg-white shadow-md'
                      : 'border-ink/10 bg-white/60'
                }`}
              >
                <img
                  src={`/cnft/tier-${tier}.svg`}
                  alt={`${t(`rewards.tier${tier}Name`)} badge`}
                  width={800}
                  height={800}
                  loading="lazy"
                  className={`mx-auto mb-4 h-32 w-32 rounded-2xl ${state.kind === 'locked' ? 'opacity-40 grayscale' : ''}`}
                />
                <h3 className={`text-lg font-bold ${claimed ? 'text-cream' : 'text-ink'}`}>
                  {t(`rewards.tier${tier}Name`)}
                </h3>
                <p className={`text-sm ${claimed ? 'text-cream/60' : 'text-ink/60'}`}>
                  {t(`rewards.tier${tier}Desc`)}
                </p>

                <div className="mt-4 flex flex-1 flex-col justify-end gap-2">
                  {state.kind === 'claimed' && (
                    <>
                      <span
                        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                          state.reward.demo
                            ? 'bg-white/10 text-cream/70'
                            : 'bg-crystal-cyan/20 text-crystal-cyan'
                        }`}
                      >
                        <Sparkles size={12} aria-hidden="true" />
                        {state.reward.demo ? t('rewards.demoTag') : t('rewards.onchainTag')}
                      </span>
                      {state.reward.signature && (
                        <a
                          href={explorerTxUrl(state.reward.signature)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold underline-offset-4 hover:underline"
                        >
                          {t('rewards.viewTx')} <ExternalLink size={13} aria-hidden="true" />
                        </a>
                      )}
                      {state.reward.cnftAssetId && !state.reward.demo && (
                        <a
                          href={explorerAddressUrl(state.reward.cnftAssetId)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold underline-offset-4 hover:underline"
                        >
                          {t('rewards.viewAsset')} <ExternalLink size={13} aria-hidden="true" />
                        </a>
                      )}
                    </>
                  )}

                  {state.kind === 'claimable' && (
                    <button
                      type="button"
                      disabled={claiming !== null}
                      onClick={() => void claim(tier)}
                      className="w-full rounded-full bg-gold py-2.5 text-sm font-bold text-ink transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-60"
                    >
                      {claiming === tier ? t('rewards.minting') : `💎 ${t(`rewards.tier${tier}Name`)}`}
                    </button>
                  )}

                  {state.kind === 'locked' && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/40">
                      <Lock size={14} aria-hidden="true" />
                      {t('rewards.empty')}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Monthly champion voucher (minted by ops for leaderboard winners) */}
        {champion && (
          <div className="mt-6 flex items-center gap-4 rounded-3xl border border-gold/50 bg-gradient-to-r from-ink to-teal p-5">
            <img
              src="/cnft/tier-99.svg"
              alt={t('rewards.tier99Name')}
              width={800}
              height={800}
              className="h-20 w-20 rounded-xl"
            />
            <div>
              <h3 className="text-lg font-bold text-cream">{t('rewards.tier99Name')}</h3>
              <p className="text-sm text-cream/60">{t('rewards.tier99Desc')}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
