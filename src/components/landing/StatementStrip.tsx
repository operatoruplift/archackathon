import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface WordToken {
  text: string;
  dim: boolean;
}

/** `*dimmed words*` markers become muted; everything else is full ink. */
function parseStatement(statement: string): WordToken[] {
  const tokens: WordToken[] = [];
  statement.split('*').forEach((segment, i) => {
    const dim = i % 2 === 1;
    segment
      .split(/\s+/)
      .filter(Boolean)
      .forEach((word) => tokens.push({ text: word, dim }));
  });
  return tokens;
}

/** Word-by-word blur reveal, fired once when scrolled into view. */
export function StatementStrip() {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const words = parseStatement(t('landing.statement'));

  return (
    <section ref={ref} aria-label="Statement" className="bg-cream px-6 py-24 md:px-10 md:py-40">
      <p className="mx-auto max-w-5xl text-center font-display text-[clamp(2.2rem,6vw,5.5rem)] font-semibold leading-[1.05] tracking-tight">
        {words.map((word, i) => (
          <span key={`${word.text}-${i}`} className="inline-block overflow-hidden align-bottom">
            <span
              className={`inline-block ${word.dim ? 'text-ink/40' : 'text-ink'}`}
              style={
                reducedMotion
                  ? undefined
                  : {
                      animation: visible
                        ? `wordReveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${0.3 + i * 0.09}s both`
                        : 'none',
                      opacity: visible ? undefined : 0,
                    }
              }
            >
              {word.text}
            </span>
            <span className="inline-block">&nbsp;</span>
          </span>
        ))}
      </p>
    </section>
  );
}
