import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion';

interface StaggeredReveal {
  containerRef: RefObject<HTMLElement>;
  getAnimStyle: (index: number) => CSSProperties;
}

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const STEP_MS = 120;

/**
 * Fires once when the container crosses the IntersectionObserver threshold,
 * then staggers children in with a translate + fade.
 */
export function useStaggeredReveal(threshold = 0.15): StaggeredReveal {
  const containerRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const getAnimStyle = (index: number): CSSProperties => {
    if (reducedMotion) return {};
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ${EASE} ${index * STEP_MS}ms, transform 0.6s ${EASE} ${index * STEP_MS}ms`,
    };
  };

  return { containerRef, getAnimStyle };
}
