import { useTranslation } from 'react-i18next';
import { LOCALES, setLocale, type LocaleCode } from '@/i18n';

interface LangSwitcherProps {
  variant?: 'light' | 'dark';
  className?: string;
}

/** EN / Melayu / 中文 segmented switcher, persisted to localStorage. */
export function LangSwitcher({ variant = 'light', className = '' }: LangSwitcherProps) {
  const { i18n } = useTranslation();
  const active = (i18n.language?.slice(0, 2) ?? 'en') as LocaleCode;

  const base =
    variant === 'light'
      ? { on: 'bg-ink text-cream', off: 'text-ink hover:bg-ink/10', ring: 'border-ink/20' }
      : { on: 'bg-cream text-ink', off: 'text-cream hover:bg-cream/10', ring: 'border-cream/25' };

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex items-center gap-0.5 rounded-full border p-0.5 ${base.ring} ${className}`}
    >
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLocale(l.code)}
          aria-pressed={active === l.code}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-200 md:px-3 ${
            active === l.code ? base.on : base.off
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
