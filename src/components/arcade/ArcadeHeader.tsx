import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Trophy, Gamepad2 } from 'lucide-react';
import { useArcade } from '@/context/ArcadeContext';
import { useBalance } from '@/hooks/useArcadeQueries';
import { nextTier, progressToNextTier } from '@/lib/milestones';
import { LangSwitcher } from '@/components/ui/LangSwitcher';
import { WalletChip } from './WalletChip';

interface ArcadeHeaderProps {
  active: 'arcade' | 'rewards';
}

export function ArcadeHeader({ active }: ArcadeHeaderProps) {
  const { t } = useTranslation();
  const { session, logout } = useArcade();
  const { data: balance = 0 } = useBalance();
  const next = nextTier(balance);
  const progress = progressToNextTier(balance);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-baseline gap-1" aria-label="Crystal Z home">
          <span className="text-lg font-extrabold uppercase tracking-tight text-ink">Crystal</span>
          <span className="text-lg font-extrabold uppercase tracking-tight text-gold">Z</span>
        </Link>

        <span
          key={balance}
          className="animate-scale-in inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-cream"
        >
          <span aria-hidden="true">💎</span>
          <span className="text-base font-bold tabular-nums">{balance}</span>
          <span className="text-xs font-medium text-cream/60">{t('arcade.balance')}</span>
        </span>

        <div className="hidden md:block">
          <WalletChip />
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <LangSwitcher />
          {active === 'arcade' ? (
            <Link
              to="/rewards"
              className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-sm font-bold text-ink transition-transform hover:scale-105"
            >
              <Trophy size={16} strokeWidth={2.2} aria-hidden="true" />
              {t('arcade.myRewards')}
            </Link>
          ) : (
            <Link
              to="/arcade"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-bold text-cream transition-transform hover:scale-105"
            >
              <Gamepad2 size={16} strokeWidth={2.2} aria-hidden="true" />
              {t('arcade.gamesTitle')}
            </Link>
          )}
          <button
            type="button"
            onClick={() => void logout()}
            aria-label={t('arcade.logout')}
            title={t('arcade.logout')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition-colors hover:bg-ink hover:text-cream"
          >
            <LogOut size={15} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Progress to the next milestone — "progress-to-next-reward" from the roadmap */}
      <div className="mx-auto max-w-6xl px-4 pb-3 md:px-6">
        <div className="flex items-center justify-between text-xs font-semibold text-ink/70">
          <span>
            {session ? t('arcade.welcome', { name: session.displayName }) : ''}
          </span>
          <span>
            {next
              ? `${t('arcade.nextReward', { name: t(`rewards.tier${next.tier}Name`) })} · ${t('arcade.crystalsToGo', { count: next.threshold - balance })}`
              : t('arcade.allTiersEarned')}
          </span>
        </div>
        <div
          className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/10"
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-crystal-cyan via-gold to-gold transition-[width] duration-700 ease-out-expo"
            style={{ width: `${Math.max(4, progress * 100)}%` }}
          />
        </div>
      </div>
    </header>
  );
}
