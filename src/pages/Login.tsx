import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useArcade } from '@/context/ArcadeContext';
import { DEMO_PERSONAS } from '@/lib/demoPersonas';
import { setLocale } from '@/i18n';
import { LangSwitcher } from '@/components/ui/LangSwitcher';

/** Deterministic little QR-ish pattern so each demo card looks distinct. */
function QrGlyph({ seed }: { seed: string }) {
  let hash = 7;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const cells: boolean[] = Array.from({ length: 49 }, (_, i) => {
    hash = (hash * 1103515245 + 12345) >>> 0;
    return i % 8 === 0 || hash % 3 === 0;
  });
  return (
    <svg viewBox="0 0 7 7" className="h-16 w-16 rounded bg-white p-1" aria-hidden="true">
      {cells.map((on, i) =>
        on ? <rect key={i} x={i % 7} y={Math.floor(i / 7)} width="0.92" height="0.92" fill="#0C2F3A" /> : null,
      )}
    </svg>
  );
}

export default function Login() {
  const { t } = useTranslation();
  const { session, login, provider } = useArcade();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState(false);

  if (session) return <Navigate to="/arcade" replace />;

  const tap = async (qrCardId: string, locale: 'en' | 'ms' | 'zh') => {
    setBusy(qrCardId);
    setError(false);
    try {
      await login(qrCardId);
      setLocale(locale);
      navigate('/arcade');
    } catch {
      setError(true);
      setBusy(null);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-ink/50">Crystal Z</p>
        <h1 className="font-display text-5xl font-bold text-ink md:text-6xl">{t('login.title')}</h1>
        <p className="mt-3 text-lg text-ink/70">{t('login.subtitle')}</p>

        <div className="mt-6 flex justify-center">
          <LangSwitcher />
        </div>

        <p className="mt-10 text-xs font-bold uppercase tracking-widest text-ink/50">
          {t('login.pickPersona')}
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {DEMO_PERSONAS.map((p) => (
            <button
              key={p.userId}
              type="button"
              disabled={busy !== null}
              onClick={() => void tap(p.qrCardId, p.defaultLocale)}
              className={`flex items-center gap-4 rounded-2xl border border-ink/10 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 ${
                busy === p.qrCardId ? 'ring-2 ring-gold' : ''
              }`}
            >
              <QrGlyph seed={p.qrCardId} />
              <span className="flex-1">
                <span className="block text-lg font-bold text-ink">{p.displayName}</span>
                <span className="block font-mono text-xs text-ink/50">{p.qrCardId}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-cream px-3 py-1 text-sm font-bold text-ink">
                💎 {p.startBalance}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm font-semibold text-red-600">
            {t('shell.rejected_generic')}
          </p>
        )}

        <p className="mt-8 text-sm leading-relaxed text-ink/60">{t('login.hint')}</p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-1.5 text-xs font-semibold text-ink/70">
          <span
            className={`h-2 w-2 rounded-full ${provider.kind === 'supabase' ? 'bg-emerald-500' : 'bg-amber-500'}`}
          />
          {provider.kind === 'supabase' ? t('login.liveMode') : `${t('login.demoMode')} — ${t('login.demoModeDesc')}`}
        </p>
      </div>
    </main>
  );
}
