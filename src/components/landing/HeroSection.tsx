import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MaskedCard } from './MaskedCard';
import { HERO_ART } from './crystalArt';
import { useMaskPositions, useImageWidth } from '@/hooks/useMaskPositions';
import { useStaggeredReveal } from '@/hooks/useStaggeredReveal';
import { useIsMobile } from '@/hooks/useIsMobile';
import { mergeRefs } from '@/lib/refs';

export function HeroSection() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const positions = useMaskPositions(sectionRef, cardRefs);
  const sectionHeight = positions[0]?.sh ?? 0;
  const imageWidth = useImageWidth(HERO_ART, sectionHeight);
  const reveal = useStaggeredReveal();
  const focalX = isMobile ? 0.7 : 0.8;

  const setCard = (i: number) => (el: HTMLDivElement | null) => {
    cardRefs.current[i] = el;
  };

  const bars = [t('landing.bar1'), t('landing.bar2'), t('landing.bar3')];

  return (
    <section
      id="home"
      ref={mergeRefs(sectionRef, reveal.containerRef)}
      aria-labelledby="hero-heading"
      className="flex h-screen w-full flex-col gap-1.5 overflow-hidden px-3 pb-1.5 pt-24 md:gap-2 md:px-5 md:pb-2"
    >
      {bars.map((label, i) => (
        <MaskedCard
          key={label}
          bgImage={HERO_ART}
          position={positions[i]}
          imageWidth={imageWidth}
          focalX={focalX}
          cardRef={setCard(i)}
          className="relative h-14 w-full shrink-0 overflow-hidden rounded-xl md:h-20 md:rounded-2xl"
          style={reveal.getAnimStyle(i)}
        >
          <span className="relative z-10 flex h-full items-center justify-center text-center text-lg font-bold text-ink md:text-3xl">
            {label}
          </span>
        </MaskedCard>
      ))}

      <MaskedCard
        bgImage={HERO_ART}
        position={positions[3]}
        imageWidth={imageWidth}
        focalX={focalX}
        cardRef={setCard(3)}
        className="relative min-h-0 w-full flex-1 overflow-hidden rounded-xl md:rounded-2xl"
        style={reveal.getAnimStyle(3)}
      >
        <p className="absolute left-4 top-4 z-10 max-w-[220px] text-xs font-semibold leading-4 text-ink md:left-7 md:top-7 md:max-w-[340px] md:text-sm md:leading-5">
          {t('landing.heroTop1')}
          <br />
          {t('landing.heroTop2')}
        </p>

        <div className="absolute bottom-5 left-3 z-10 md:bottom-8 md:left-4">
          <span className="mb-1 block text-xs font-semibold text-cream/90 md:mb-2 md:text-sm">
            {t('landing.heroLabel')}
          </span>
          <h1
            id="hero-heading"
            className="font-display text-[clamp(3rem,11vw,11rem)] font-bold leading-[0.85] tracking-tight text-cream"
          >
            {t('landing.heroTitle1')}
            <br />
            {t('landing.heroTitle2')}
          </h1>
        </div>

        <span className="absolute bottom-6 right-4 z-10 inline-flex items-center gap-2 text-xs font-semibold text-white md:bottom-10 md:right-8 md:text-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-crystal-cyan opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-crystal-cyan" />
          </span>
          {t('landing.heroCorner')}
        </span>
      </MaskedCard>
    </section>
  );
}
