import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LangSwitcher } from '@/components/ui/LangSwitcher';

const EASE = 'ease-[cubic-bezier(0.76,0,0.24,1)]';

interface NavLink {
  key: string;
  href: string;
  route?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { key: 'nav.home', href: '/#home' },
  { key: 'nav.games', href: '/#games' },
  { key: 'nav.onchain', href: '/#onchain' },
  { key: 'nav.rewards', href: '/rewards', route: true },
  { key: 'nav.contact', href: '/#contact' },
];

export function LandingNavbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-cream/80 px-4 py-2 backdrop-blur-md md:px-6 md:py-3">
        <Link to="/" className="flex flex-col" aria-label="Crystal Z home">
          <span className="text-xl font-extrabold uppercase leading-none tracking-tight text-ink md:text-2xl">
            Crystal
          </span>
          <span className="-mt-1.5 text-xl font-extrabold uppercase leading-none tracking-tight text-gold md:-mt-2 md:text-2xl">
            Z
          </span>
          <span className="mt-1.5 text-[8px] font-medium uppercase leading-none tracking-[0.2em] text-ink/70 md:mt-2 md:text-[9px]">
            {t('common.tagline')}
          </span>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <LangSwitcher />
          <span className="hidden text-sm font-semibold text-ink lg:block">{t('nav.buildathonTag')}</span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full border border-ink bg-cream px-6 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-ink hover:text-cream"
          >
            {t('nav.menu')}
          </button>
          <Link
            to="/arcade"
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-colors duration-200 hover:bg-teal"
          >
            {t('nav.launchArcade')}
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="relative flex h-10 w-10 items-center justify-center md:hidden"
        >
          <span
            className={`absolute h-0.5 w-6 rounded-full bg-ink transition-all duration-300 ${EASE} ${
              open ? 'translate-y-0 rotate-45' : '-translate-y-2'
            }`}
          />
          <span
            className={`absolute h-0.5 w-6 rounded-full bg-ink transition-all duration-300 ${EASE} ${
              open ? 'scale-x-0 opacity-0' : 'scale-x-100 opacity-100'
            }`}
          />
          <span
            className={`absolute h-0.5 w-6 rounded-full bg-ink transition-all duration-300 ${EASE} ${
              open ? 'translate-y-0 -rotate-45' : 'translate-y-2'
            }`}
          />
        </button>
      </header>

      {/* Slide-in menu (mobile + desktop "Menu" button) */}
      <div className={`fixed inset-0 z-40 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-ink/20 backdrop-blur-sm transition-opacity duration-500 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <nav
          aria-label="Main navigation"
          className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-cream shadow-2xl transition-transform duration-500 ${EASE} ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex h-full flex-col justify-center gap-1 px-8">
            {NAV_LINKS.map((link, i) => {
              const cls = `text-4xl font-bold text-ink transition-all duration-500 ${EASE} hover:text-teal ${
                open ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
              }`;
              const style = { transitionDelay: open ? `${100 + i * 60}ms` : '0ms' };
              return link.route ? (
                <Link key={link.key} to={link.href} className={cls} style={style} onClick={() => setOpen(false)}>
                  {t(link.key)}
                </Link>
              ) : (
                <a key={link.key} href={link.href} className={cls} style={style} onClick={() => setOpen(false)}>
                  {t(link.key)}
                </a>
              );
            })}

            <div
              className={`mt-8 border-t border-ink/15 pt-8 transition-all duration-500 ${EASE} ${
                open ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
              }`}
              style={{ transitionDelay: open ? '450ms' : '0ms' }}
            >
              <p className="mb-4 text-sm font-semibold text-ink">{t('nav.buildathonTag')}</p>
              <div className="mb-4">
                <LangSwitcher />
              </div>
              <Link
                to="/arcade"
                onClick={() => setOpen(false)}
                className="block w-full rounded-full bg-ink px-6 py-4 text-center text-sm font-semibold text-cream transition-colors duration-200 hover:bg-teal"
              >
                {t('nav.launchArcade')}
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
