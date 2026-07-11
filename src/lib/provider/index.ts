import type { DataProvider } from './types';
import { hasSupabaseEnv } from './types';

let cached: Promise<DataProvider> | null = null;

/**
 * Lazily choose the backend. Supabase code (and its bundle weight) only
 * loads when the project env vars are configured.
 */
export function getProvider(): Promise<DataProvider> {
  if (!cached) {
    cached = hasSupabaseEnv()
      ? import('./supabase').then((m) => m.createSupabaseProvider())
      : import('./demo').then((m) => m.createDemoProvider());
  }
  return cached;
}
