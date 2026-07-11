import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Coins, Languages, ShieldCheck, Gem } from 'lucide-react';
import { REPO_URL, HEALTHY_TEC_URL } from '@/lib/links';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const ROTATE_MS = 3500;

const PANEL_CARDS = [
  { key: 'landing.panelCard1', Icon: Coins, circle: 'bg-amber-700' },
  { key: 'landing.panelCard2', Icon: ShieldCheck, circle: 'bg-emerald-800' },
  { key: 'landing.panelCard3', Icon: Languages, circle: 'bg-cyan-800' },
  { key: 'landing.panelCard4', Icon: Gem, circle: 'bg-ink' },
] as const;

export function PanelsFooter() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const timer = setInterval(() => setActive((a) => (a + 1) % PANEL_CARDS.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [reducedMotion]);

  return (
    <footer id="contact">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr]">
        {/* Panel 1 — invitation */}
        <div className="relative overflow-hidden bg-cream-deep p-8 md:p-10">
          <p className="max-w-[350px] text-2xl leading-[1.1] tracking-tight text-ink sm:text-[28px] lg:text-[35px]">
            {t('landing.panel1Text')}
          </p>
          <a
            href={`${REPO_URL}/blob/main/docs/ARCHITECTURE.md`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block text-base text-ink underline underline-offset-4 transition-colors hover:text-teal lg:text-lg"
          >
            {t('landing.panel1Link')}
          </a>
          <svg
            aria-hidden="true"
            viewBox="0 0 100 140"
            className="absolute -bottom-4 -right-2 h-40 w-auto opacity-15"
          >
            <polygon points="50,0 90,45 75,140 25,140 10,45" fill="#0C2F3A" />
            <polygon points="50,0 75,140 25,140" fill="#3EC9C0" opacity="0.6" />
          </svg>
        </div>

        {/* Panel 2 — rotating proof points */}
        <div className="flex flex-col justify-between bg-white p-8 md:p-6 lg:p-8">
          <div className="relative min-h-[120px]">
            {PANEL_CARDS.map((card, i) => (
              <div
                key={card.key}
                aria-hidden={i !== active}
                className={`flex items-start gap-3 transition-all duration-500 ease-out-expo ${
                  i === active ? 'translate-y-0 opacity-100' : 'absolute inset-0 translate-y-4 opacity-0'
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${card.circle}`}
                >
                  <card.Icon size={20} strokeWidth={1.5} className="text-white" />
                </span>
                <p className="text-sm leading-tight text-ink/80 sm:text-base lg:text-lg">{t(card.key)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-1.5" role="tablist" aria-label="Proof points">
            {PANEL_CARDS.map((card, i) => (
              <button
                key={card.key}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Card ${i + 1}`}
                onClick={() => setActive(i)}
                className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                  i === active ? 'bg-ink' : 'bg-ink/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Panel 3 — traction */}
        <div className="flex items-center gap-5 bg-ink p-8 md:p-10">
          <img
            src="/cnft/tier-3.svg"
            alt="Gem Guardian badge"
            width={800}
            height={800}
            loading="lazy"
            className="h-[82px] w-[120px] rounded-xl object-cover sm:h-[110px] sm:w-[160px] lg:h-[142px] lg:w-[208px]"
          />
          <div>
            <p className="text-2xl tracking-tight text-cream sm:text-3xl lg:text-[35px]">
              {t('landing.panel3Stat')}
            </p>
            <p className="mt-1 text-sm leading-tight text-cream/60 sm:text-base lg:text-lg">
              {t('landing.panel3Text')}
            </p>
          </div>
        </div>
      </div>

      {/* Legal / attribution bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cream/10 bg-ink px-6 py-5 text-xs text-cream/60 md:px-10 md:text-sm">
        <span>
          © 2026 {t('footer.company')} ·{' '}
          <a href={HEALTHY_TEC_URL} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
            {t('footer.site')}
          </a>
        </span>
        <span>{t('footer.event')} · Solana Devnet</span>
        <a href={REPO_URL} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
          {t('footer.github')}
        </a>
      </div>
    </footer>
  );
}
