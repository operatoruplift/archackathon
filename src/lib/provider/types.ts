import type { MintResult, Reward, ScoreSubmission, Session, SubmitResult } from '../types';

/**
 * Repository boundary between the arcade UI and its backend. Two
 * implementations:
 *  - `demo`     — zero-config local state so the deployed site always works
 *  - `supabase` — the production path (Postgres triggers, RLS, edge functions)
 */
export interface DataProvider {
  kind: 'demo' | 'supabase';
  getSession(): Session | null;
  loginWithQr(qrCardId: string): Promise<Session>;
  logout(): Promise<void>;
  getBalance(): Promise<number>;
  submitScore(sub: ScoreSubmission): Promise<SubmitResult>;
  getRewards(): Promise<Reward[]>;
  /** Server-verified milestone claim → cNFT mint (real or simulated). */
  mintTier(tier: number): Promise<MintResult>;
  getWalletAddress(): Promise<{ address: string; demo: boolean }>;
}

export function hasSupabaseEnv(): boolean {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}
