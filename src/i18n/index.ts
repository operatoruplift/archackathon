import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { ms } from './locales/ms';
import { zh } from './locales/zh';

export const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'ms', label: 'Melayu' },
  { code: 'zh', label: '中文' },
] as const;

export type LocaleCode = (typeof LOCALES)[number]['code'];

const STORAGE_KEY = 'cz.lang';

function initialLocale(): LocaleCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'ms' || stored === 'zh') return stored;
  } catch {
    /* SSR / privacy mode */
  }
  return 'en';
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ms: { translation: ms },
    zh: { translation: zh },
  },
  lng: initialLocale(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function setLocale(code: LocaleCode): void {
  void i18n.changeLanguage(code);
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* ignore */
  }
}

export default i18n;
