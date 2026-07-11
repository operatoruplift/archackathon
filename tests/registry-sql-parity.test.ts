import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { GAME_META, REWARD_TIERS } from '@/lib/constants';

/**
 * The score guard runs twice: in Postgres (authoritative) and in the client
 * (optimistic mirror). This test fails the build if supabase/seed.sql and
 * src/lib/constants.ts ever drift apart.
 */
const seedSql = readFileSync(resolve(__dirname, '../supabase/seed.sql'), 'utf8');

interface SeedGame {
  slug: string;
  category: string;
  maxScore: number;
  minDurationMs: number;
  maxPerMinute: number;
  isNew: boolean;
}

function parseSeedGames(sql: string): SeedGame[] {
  const rows = [...sql.matchAll(/\('([\w-]+)',\s*'(\w+)',\s*(\d+),\s*(\d+),\s*(\d+),\s*(true|false),\s*\d+\)/g)];
  return rows.map((m) => ({
    slug: m[1],
    category: m[2],
    maxScore: Number(m[3]),
    minDurationMs: Number(m[4]),
    maxPerMinute: Number(m[5]),
    isNew: m[6] === 'true',
  }));
}

function parseSeedTiers(sql: string): { tier: number; threshold: number }[] {
  return [...sql.matchAll(/\((\d+),\s+(\d+),\s+'[^']+'\)/g)].map((m) => ({
    tier: Number(m[1]),
    threshold: Number(m[2]),
  }));
}

describe('seed.sql ↔ constants.ts parity', () => {
  const seedGames = parseSeedGames(seedSql);

  test('seed contains all 13 games', () => {
    expect(seedGames).toHaveLength(13);
    expect(GAME_META).toHaveLength(13);
  });

  test('every game matches slug, category, and guard limits exactly', () => {
    for (const meta of GAME_META) {
      const seed = seedGames.find((g) => g.slug === meta.id);
      expect(seed, meta.id).toBeDefined();
      expect(seed).toMatchObject({
        category: meta.category,
        maxScore: meta.maxScore,
        minDurationMs: meta.minDurationMs,
        maxPerMinute: meta.maxPerMinute,
        isNew: Boolean(meta.isNew),
      });
    }
  });

  test('exactly one game is marked NEW — the buildathon 13th', () => {
    expect(seedGames.filter((g) => g.isNew).map((g) => g.slug)).toEqual(['color-sequence']);
  });

  test('reward tier thresholds match', () => {
    const seedTiers = parseSeedTiers(seedSql);
    expect(seedTiers).toEqual(REWARD_TIERS.map(({ tier, threshold }) => ({ tier, threshold })));
  });
});
