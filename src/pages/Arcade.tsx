import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Play } from 'lucide-react';
import { GAME_META } from '@/lib/constants';
import type { GameId } from '@/lib/types';
import { useArcade } from '@/context/ArcadeContext';
import { ArcadeHeader } from '@/components/arcade/ArcadeHeader';
import { GameShell } from '@/components/arcade/GameShell';
import { WalletChip } from '@/components/arcade/WalletChip';

const CATEGORY_KEY: Record<string, string> = {
  memory: 'arcade.catMemory',
  reaction: 'arcade.catReaction',
  logic: 'arcade.catLogic',
  attention: 'arcade.catAttention',
  math: 'arcade.catMath',
};

export default function Arcade() {
  const { t } = useTranslation();
  const { session } = useArcade();
  const [playing, setPlaying] = useState<GameId | null>(null);

  if (!session) return <Navigate to="/login" replace />;

  const flagship = GAME_META.find((g) => g.isNew);
  const classics = GAME_META.filter((g) => !g.isNew);

  return (
    <div className="min-h-screen bg-cream">
      <ArcadeHeader active="arcade" />

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-4 md:hidden">
          <WalletChip />
        </div>

        {/* Flagship: the 13th game shipped tonight */}
        {flagship && (
          <button
            type="button"
            onClick={() => setPlaying(flagship.id)}
            className="group relative mb-8 flex w-full flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-teal to-[#1B2C55] p-6 text-left shadow-lg transition-transform duration-300 hover:scale-[1.01] md:flex-row md:items-center md:p-8"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-crystal-violet/30 blur-3xl"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 right-40 h-56 w-56 rounded-full bg-crystal-cyan/25 blur-3xl"
            />
            <span className="relative z-10">
              <span className="mb-3 inline-block rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-widest text-ink">
                {t('arcade.newBadge')} · Ârc NS Buildathon
              </span>
              <span className="flex items-center gap-3">
                <span className="text-5xl" aria-hidden="true">
                  {flagship.icon}
                </span>
                <span>
                  <span className="block font-display text-3xl font-bold text-cream md:text-4xl">
                    {t(`games.${flagship.id}.name`)}
                  </span>
                  <span className="mt-1 block max-w-md text-sm text-cream/70">
                    {t(`games.${flagship.id}.howTo`)}
                  </span>
                </span>
              </span>
            </span>
            <span className="relative z-10 mt-5 inline-flex items-center gap-2 self-start rounded-full bg-cream px-6 py-3 text-lg font-bold text-ink transition-transform duration-200 group-hover:scale-105 md:mt-0 md:self-center">
              <Play size={18} strokeWidth={2.5} aria-hidden="true" />
              {t('landing.playNow')}
            </span>
          </button>
        )}

        <h2 className="mb-4 font-display text-2xl font-bold text-ink md:text-3xl">
          {t('arcade.gamesTitle')}
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {classics.map((game) => (
            <li key={game.id}>
              <button
                type="button"
                onClick={() => setPlaying(game.id)}
                className="group flex w-full flex-col items-start gap-3 rounded-2xl border border-ink/5 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg md:p-5"
              >
                <span className="text-4xl transition-transform duration-200 group-hover:scale-110 md:text-5xl" aria-hidden="true">
                  {game.icon}
                </span>
                <span className="min-h-[2.5rem] text-base font-bold leading-tight text-ink md:text-lg">
                  {t(`games.${game.id}.name`)}
                </span>
                <span className="rounded-full bg-cream px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink/60">
                  {t(CATEGORY_KEY[game.category])}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </main>

      {playing && <GameShell gameId={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}
