import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { REWARDS_ART } from './crystalArt';
import { useStaggeredReveal } from '@/hooks/useStaggeredReveal';
import { EXPLORER_DEVNET_URL, REPO_URL } from '@/lib/links';

function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`rotate-[-45deg] ${className}`}>
      <path
        d="M1 7h12m0 0L8 2m5 5L8 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OnChainSection() {
  const { t } = useTranslation();
  const reveal = useStaggeredReveal();

  return (
    <section
      id="onchain"
      ref={reveal.containerRef as React.RefObject<HTMLElement>}
      aria-labelledby="onchain-heading"
      className="flex min-h-screen w-full scroll-mt-20 flex-col gap-1.5 overflow-hidden px-3 pb-1.5 pt-1.5 md:h-screen md:gap-2 md:px-5 md:pb-2 md:pt-2 md:scroll-mt-24"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-1.5 md:grid-cols-2 md:gap-2">
        {/* Left column */}
        <div className="flex flex-col gap-1.5 md:gap-2">
          <div
            className="flex min-h-[180px] flex-[1.2] flex-col justify-between rounded-xl bg-white p-5 md:min-h-0 md:rounded-2xl md:p-7"
            style={reveal.getAnimStyle(0)}
          >
            <h2
              id="onchain-heading"
              className="font-display text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[0.95] text-ink"
            >
              {t('landing.onchainTitle1')}
              <br />
              {t('landing.onchainTitle2')}
            </h2>
            <p className="text-xs font-semibold text-ink md:text-sm">{t('landing.onchainSubtitle')}</p>
          </div>

          <div className="flex min-h-[140px] flex-1 gap-1.5 md:min-h-0 md:gap-2" style={reveal.getAnimStyle(1)}>
            <div className="flex-1 overflow-hidden rounded-xl md:rounded-2xl">
              <img
                src="/cnft/tier-1.svg"
                alt="First Facet milestone badge — compressed NFT"
                width={800}
                height={800}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 overflow-hidden rounded-xl md:rounded-2xl">
              <img
                src="/cnft/tier-2.svg"
                alt="Crystal Collector milestone badge — compressed NFT"
                width={800}
                height={800}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div
            className="flex min-h-[160px] flex-[0.8] items-end justify-between rounded-xl bg-cream-deep p-5 md:min-h-0 md:rounded-2xl md:p-7"
            style={reveal.getAnimStyle(2)}
          >
            <div>
              <p className="mb-2 text-xs font-semibold text-ink md:mb-3 md:text-sm">{t('landing.consultLabel')}</p>
              <h3 className="text-xl font-bold leading-6 text-ink md:text-3xl md:leading-8">
                {t('landing.consultLine1')}
                <br />
                {t('landing.consultLine2')}
                <br />
                {t('landing.consultLine3')}
              </h3>
            </div>
            <Link
              to="/rewards"
              className="rounded-full bg-white px-5 py-3 text-base font-bold text-ink transition-transform hover:scale-105 md:px-8 md:py-5 md:text-xl"
            >
              {t('landing.myRewardsCta')}
            </Link>
          </div>
        </div>

        {/* Right column */}
        <div
          className="relative min-h-[350px] overflow-hidden rounded-xl md:min-h-0 md:rounded-2xl"
          style={reveal.getAnimStyle(3)}
        >
          <img
            src={REWARDS_ART}
            alt="Crystal constellation artwork"
            width={1200}
            height={1600}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-3 left-3 right-3 flex gap-1.5 md:bottom-5 md:left-5 md:right-5 md:gap-2">
            <a
              href={`${REPO_URL}#architecture`}
              target="_blank"
              rel="noreferrer"
              className="flex h-36 flex-1 flex-col justify-between rounded-xl bg-white p-3 transition-transform hover:scale-[1.02] md:h-52 md:rounded-2xl md:p-5"
            >
              <h4 className="text-lg font-bold leading-5 text-ink md:text-2xl md:leading-7">
                {t('landing.overlay1a')}
                <br />
                {t('landing.overlay1b')}
                <br />
                {t('landing.overlay1c')}
              </h4>
              <span className="flex h-9 w-9 items-center justify-center self-end rounded-full border border-ink text-ink md:h-12 md:w-12">
                <ArrowIcon />
              </span>
            </a>
            <a
              href={EXPLORER_DEVNET_URL}
              target="_blank"
              rel="noreferrer"
              className="flex h-36 flex-1 flex-col justify-between rounded-xl bg-white/20 p-3 backdrop-blur-xl transition-transform hover:scale-[1.02] md:h-52 md:rounded-2xl md:p-5"
            >
              <h4 className="text-lg font-bold leading-5 text-white md:text-2xl md:leading-7">
                {t('landing.overlay2a')}
                <br />
                {t('landing.overlay2b')}
                <br />
                {t('landing.overlay2c')}
              </h4>
              <span className="flex h-9 w-9 items-center justify-center self-end rounded-full border border-white text-white md:h-12 md:w-12">
                <ArrowIcon />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
