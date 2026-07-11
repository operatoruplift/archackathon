import { describe, expect, test } from 'vitest';
import { en } from '@/i18n/locales/en';
import { ms } from '@/i18n/locales/ms';
import { zh } from '@/i18n/locales/zh';
import { GAME_META } from '@/lib/constants';

type Tree = Record<string, unknown>;

function flatten(tree: Tree, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') out.set(path, value);
    else flatten(value as Tree, path).forEach((v, k) => out.set(k, v));
  }
  return out;
}

function interpolationVars(value: string): string[] {
  return [...value.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort();
}

const locales = { en, ms, zh } as const;

describe('tri-lingual parity (EN / MS / ZH)', () => {
  const enFlat = flatten(en as unknown as Tree);

  test.each(Object.entries(locales))('%s has the exact same key set as en', (_name, locale) => {
    const flat = flatten(locale as unknown as Tree);
    expect([...flat.keys()].sort()).toEqual([...enFlat.keys()].sort());
  });

  test.each(Object.entries(locales))('%s keeps {{interpolation}} variables aligned', (_name, locale) => {
    const flat = flatten(locale as unknown as Tree);
    for (const [key, enValue] of enFlat) {
      expect(interpolationVars(flat.get(key) ?? ''), key).toEqual(interpolationVars(enValue));
    }
  });

  test('every game in the registry has a name and how-to in every locale', () => {
    for (const meta of GAME_META) {
      for (const [name, locale] of Object.entries(locales)) {
        const entry = (locale.games as Record<string, { name: string; howTo: string }>)[meta.id];
        expect(entry?.name, `${name}:${meta.id}`).toBeTruthy();
        expect(entry?.howTo, `${name}:${meta.id}`).toBeTruthy();
      }
    }
  });

  test('no locale ships an empty string', () => {
    for (const [name, locale] of Object.entries(locales)) {
      for (const [key, value] of flatten(locale as unknown as Tree)) {
        expect(value.length, `${name}:${key}`).toBeGreaterThan(0);
      }
    }
  });
});
