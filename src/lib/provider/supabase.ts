import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { crystalsForScore } from '../crystals';
import { crossedTiers } from '../milestones';
import type { MintResult, Reward, ScoreSubmission, Session, SubmitResult } from '../types';
import type { DataProvider } from './types';

interface RewardRow {
  id: string;
  milestone_tier: number;
  cnft_asset_id: string | null;
  mint_signature: string | null;
  created_at: string;
}

/**
 * Production provider. Postgres stays the source of truth: the score guard
 * trigger validates inserts, `award_crystals_for_score()` mints Crystals,
 * and the `mint-reward-cnft` edge function verifies milestones server-side
 * before touching devnet.
 */
export function createSupabaseProvider(): DataProvider {
  const client: SupabaseClient = createClient(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  );

  let session: Session | null = null;

  const requireSession = (): Session => {
    if (!session) throw new Error('Not logged in');
    return session;
  };

  const fetchBalance = async (userId: string): Promise<number> => {
    const { data, error } = await client
      .from('user_crystals')
      .select('amount')
      .eq('user_id', userId);
    if (error) throw error;
    return (data ?? []).reduce((sum, row) => sum + (row.amount as number), 0);
  };

  return {
    kind: 'supabase',

    getSession: () => session,

    async loginWithQr(qrCardId: string): Promise<Session> {
      // Mirrors the production `qr-auth-validate` edge function: the card id
      // is exchanged for a one-time token hash, then verified client-side.
      const { data, error } = await client.functions.invoke('qr-auth-validate', {
        body: { card_id: qrCardId },
      });
      if (error || !data?.token_hash) throw new Error('unknown_card');

      const { data: verified, error: verifyError } = await client.auth.verifyOtp({
        type: 'email',
        token_hash: data.token_hash as string,
      });
      if (verifyError || !verified.user) throw new Error('unknown_card');

      session = {
        userId: verified.user.id,
        displayName: (data.display_name as string) ?? 'Player',
        qrCardId,
      };
      return session;
    },

    async logout(): Promise<void> {
      await client.auth.signOut();
      session = null;
    },

    async getBalance(): Promise<number> {
      const { userId } = requireSession();
      return fetchBalance(userId);
    },

    async submitScore(sub: ScoreSubmission): Promise<SubmitResult> {
      const { userId } = requireSession();
      const prev = await fetchBalance(userId);

      // The BEFORE INSERT guard trigger rejects impossible scores; the AFTER
      // INSERT trigger awards Crystals. RLS restricts inserts to the user.
      const { error } = await client.from('scores').insert({
        user_id: userId,
        game_slug: sub.gameId,
        score: sub.score,
        duration_ms: sub.durationMs,
      });
      if (error) {
        return {
          accepted: false,
          reason: error.message,
          crystalsAwarded: 0,
          newBalance: prev,
          unlockedTiers: [],
        };
      }

      const next = prev + crystalsForScore(sub.score);
      const { data: claimedRows } = await client
        .from('milestone_rewards')
        .select('milestone_tier')
        .eq('user_id', userId);
      const claimed = (claimedRows ?? []).map((r) => r.milestone_tier as number);
      const unlocked = crossedTiers(prev, next)
        .filter((t) => !claimed.includes(t.tier))
        .map((t) => t.tier);

      return { accepted: true, crystalsAwarded: crystalsForScore(sub.score), newBalance: next, unlockedTiers: unlocked };
    },

    async getRewards(): Promise<Reward[]> {
      const { userId } = requireSession();
      const { data, error } = await client
        .from('milestone_rewards')
        .select('id, milestone_tier, cnft_asset_id, mint_signature, created_at')
        .eq('user_id', userId)
        .order('milestone_tier', { ascending: true });
      if (error) throw error;
      return ((data ?? []) as RewardRow[]).map((row) => ({
        id: row.id,
        tier: row.milestone_tier,
        cnftAssetId: row.cnft_asset_id,
        signature: row.mint_signature,
        createdAt: row.created_at,
        demo: false,
      }));
    },

    async mintTier(tier: number): Promise<MintResult> {
      // The edge function re-verifies the balance server-side; the tier here
      // is only a hint, so a spoofed call cannot mint an unearned reward.
      const { data, error } = await client.functions.invoke('mint-reward-cnft', {
        body: { tier },
      });
      if (error) throw error;
      return {
        tier,
        cnftAssetId: (data?.assetId as string) ?? null,
        signature: (data?.signature as string) ?? null,
        demo: false,
      };
    },

    async getWalletAddress(): Promise<{ address: string; demo: boolean }> {
      const { userId } = requireSession();
      const { data } = await client
        .from('profiles')
        .select('solana_wallet')
        .eq('id', userId)
        .maybeSingle();
      if (data?.solana_wallet) return { address: data.solana_wallet as string, demo: false };

      // Wallet is generated lazily by the edge function on first contact.
      const { data: minted } = await client.functions.invoke('mint-reward-cnft', {
        body: { ensureWalletOnly: true },
      });
      return { address: (minted?.wallet as string) ?? 'pending', demo: false };
    },
  };
}
