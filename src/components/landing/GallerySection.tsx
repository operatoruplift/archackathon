import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MaskedCard } from './MaskedCard';
import { GALLERY_ART } from './crystalArt';
import { useMaskPositions, useImageWidth } from '@/hooks/useMaskPositions';
import { useStaggeredReveal } from '@/hooks/useStaggeredReveal';
import { useIsMobile } from '@/hooks/useIsMobile';
import { mergeRefs } from '@/lib/refs';

const CATEGORIES = [
  { key: 'landing.catMemory', num: '01', active: true },
  { key: 'landing.catReaction', num: '02', active: false },
  { key: 'landing.catLogic', num: '03', active: false },
  { key: 'landing.catMath', num: null, active: false },
] as const;

export function GallerySection() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const positions = useMaskPositions(sectionRef, cardRefs);
  const sectionHeight = positions[0]?.sh ?? 0;
  const imageWidth = useImageWidth(GALLERY_ART, sectionHeight);
  const reveal = useStaggeredReveal();
  const focalX = isMobile ? 0.65 : 0.8;

  const setCard = (i: number) => (el: HTMLDivElement | null) => {
    cardRefs.current[i] = el;
  };

  return (
    <section
      id="games"
      ref={mergeRefs(sectionRef, reveal.containerRef)}
      aria-label={t('landing.galleryTitle')}
      className="flex min-h-screen w-full scroll-mt-20 flex-col gap-1.5 overflow-hidden px-3 pb-1.5 pt-1.5 md:h-screen md:gap-2 md:px-5 md:pb-2 md:pt-2 md:scroll-mt-24"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_auto_auto_auto] gap-1.5 md:grid-cols-2 md:grid-rows-[1fr_1fr_0.8fr] md:gap-2">
        <MaskedCard
          bgImage={GALLERY_ART}
          position={positions[0]}
          imageWidth={imageWidth}
          focalX={focalX}
          cardRef={setCard(0)}
          className="relative min-h-[160px] overflow-hidden rounded-xl md:min-h-0 md:rounded-2xl"
          style={reveal.getAnimStyle(0)}
        >
          <h2 className="absolute left-5 top-4 z-10 text-2xl font-bold text-white md:left-7 md:top-6 md:text-3xl">
            {t('landing.galleryTitle')}
          </h2>
          <p className="absolute bottom-4 left-5 z-10 text-xs font-semibold text-white/90 md:bottom-6 md:left-7 md:text-sm">
            {t('landing.gallerySubtitle')}
          </p>
        </MaskedCard>

        <MaskedCard
          bgImage={GALLERY_ART}
          position={positions[1]}
          imageWidth={imageWidth}
          focalX={focalX}
          cardRef={setCard(1)}
          className="relative min-h-[200px] overflow-hidden rounded-xl md:row-span-2 md:min-h-0 md:rounded-2xl"
          style={reveal.getAnimStyle(1)}
        >
          <p className="absolute bottom-16 left-5 z-10 text-xs font-semibold leading-4 text-white md:bottom-20 md:left-7 md:text-sm md:leading-5">
            {t('landing.galleryTall1')}
            <br />
            {t('landing.galleryTall2')}
          </p>
          <Link
            to="/arcade"
            className="absolute bottom-4 right-4 z-10 rounded-full bg-white px-5 py-3 text-base font-bold text-ink transition-transform hover:scale-105 md:bottom-6 md:right-6 md:px-8 md:py-5 md:text-xl"
          >
            {t('landing.playNow')}
          </Link>
        </MaskedCard>

        <MaskedCard
          bgImage={GALLERY_ART}
          position={positions[2]}
          imageWidth={imageWidth}
          focalX={focalX}
          cardRef={setCard(2)}
          className="relative min-h-[160px] overflow-hidden rounded-xl md:min-h-0 md:rounded-2xl"
          style={reveal.getAnimStyle(2)}
        >
          <h3 className="absolute left-5 top-4 z-10 font-display text-[clamp(3rem,7vw,6rem)] font-bold leading-[0.9] text-white md:left-7 md:top-6">
            {t('landing.galleryBig1')}
            <br />
            {t('landing.galleryBig2')}
          </h3>
        </MaskedCard>

        <MaskedCard
          bgImage={GALLERY_ART}
          position={positions[3]}
          imageWidth={imageWidth}
          focalX={focalX}
          cardRef={setCard(3)}
          className="relative col-span-1 min-h-[200px] overflow-hidden rounded-xl md:col-span-2 md:min-h-0 md:rounded-2xl"
          style={reveal.getAnimStyle(3)}
        >
          <div className="absolute inset-0 z-10 flex flex-wrap gap-1.5 p-2 md:flex-nowrap md:gap-2 md:p-3">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.key}
                className={`flex min-w-[calc(50%-4px)] flex-1 flex-col justify-between rounded-xl p-3 md:min-w-0 md:rounded-2xl md:p-5 ${
                  cat.active ? 'bg-white/90 backdrop-blur-md' : 'bg-white/20 backdrop-blur-xl'
                }`}
              >
                <h4
                  className={`whitespace-pre-line text-xl font-bold leading-[1.05] md:text-4xl ${
                    cat.active ? 'text-ink' : 'text-white'
                  }`}
                >
                  {t(cat.key)}
                </h4>
                {cat.num && (
                  <span
                    className={`flex h-8 w-8 items-center justify-center self-end rounded-full border text-xs font-semibold md:h-12 md:w-12 md:text-sm ${
                      cat.active ? 'border-ink text-ink' : 'border-white text-white'
                    }`}
                  >
                    {cat.num}
                  </span>
                )}
              </div>
            ))}
          </div>
        </MaskedCard>
      </div>
    </section>
  );
}
