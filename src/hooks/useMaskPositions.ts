import { useEffect, useState, type RefObject } from 'react';

export interface MaskPosition {
  x: number;
  y: number;
  sw: number;
  sh: number;
}

/**
 * For each card element, computes its top-left offset relative to the
 * section plus the section's size, so every card can render its own
 * "window" into one shared background image.
 */
export function useMaskPositions(
  sectionRef: RefObject<HTMLElement>,
  cardRefs: RefObject<(HTMLElement | null)[]>,
): MaskPosition[] {
  const [positions, setPositions] = useState<MaskPosition[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const compute = () => {
      const sectionRect = section.getBoundingClientRect();
      const next = (cardRefs.current ?? []).map((card) => {
        if (!card) return { x: 0, y: 0, sw: sectionRect.width, sh: sectionRect.height };
        const rect = card.getBoundingClientRect();
        return {
          x: rect.left - sectionRect.left,
          y: rect.top - sectionRect.top,
          sw: sectionRect.width,
          sh: sectionRect.height,
        };
      });
      setPositions(next);
    };

    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(section);
    window.addEventListener('resize', compute);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [sectionRef, cardRefs]);

  return positions;
}

/**
 * Width the background image would render at if scaled to fill the
 * section height, derived from its natural aspect ratio.
 */
export function useImageWidth(src: string, sectionHeight: number): number {
  const [naturalRatio, setNaturalRatio] = useState(0);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalHeight > 0) setNaturalRatio(img.naturalWidth / img.naturalHeight);
    };
    img.src = src;
  }, [src]);

  return naturalRatio * sectionHeight;
}
