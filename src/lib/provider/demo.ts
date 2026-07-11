import { crystalsForScore } from '../crystals';
import { validateScore } from '../scoreGuard';
import { crossedTiers } from '../milestones';
import { DEMO_PERSONAS, personaByCard } from '../demoPersonas';
import { generateDemoAddress } from '../wallet';
import { base58Encode } from '../base58';
import type { MintResult, Reward, ScoreSubmission, Session, SubmitResult } from '../types';
import type { DataProvider } from './types';

const KEYS = {
  session: 'cz.session',
  balance: (uid: string) => `cz.balance.${uid}`,
  rewards: (uid: string) => `cz.rewards.${uid}`,
  wallet: (uid: string) => `cz.wallet.${uid}`,
  submissions: (uid: string, game: string) => `cz.subs.${uid}.${game}`,
};

const MINT_SIMULATION_MS = 1800;

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function demoAssetId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base58Encode(bytes);
}

function seedUser(userId: string): void {
  const persona = DEMO_PERSONAS.find((p) => p.userId === userId);
  if (!persona) return;
  if (localStorage.getItem(KEYS.balance(userId)) === null) {
    writeJson(KEYS.balance(userId), persona.startBalance);
  }
  if (localStorage.getItem(KEYS.rewards(userId)) === null) {
    const seeded: Reward[] = persona.preClaimedTiers.map((tier, i) => ({
      id: `seed-${userId}-${tier}`,
      tier,
      cnftAssetId: demoAssetId(),
      signature: null,
      createdAt: new Date(Date.now() - (i + 1) * 86_400_000).toISOString(),
      demo: true,
    }));
    writeJson(KEYS.rewards(userId), seeded);
  }
}

async function tryRealMint(owner: string, tier: number): Promise<MintResult | null> {
  try {
    const res = await fetch('/api/mint-reward-cnft', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ owner, tier }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { assetId?: string; signature?: string; demo?: boolean };
    if (!json.assetId || !json.signature) return null;
    return { tier, cnftAssetId: json.assetId, signature: json.signature, demo: false };
  } catch {
    return null;
  }
}

export function createDemoProvider(): DataProvider {
  const requireSession = (): Session => {
    const s = readJson<Session>(KEYS.session);
    if (!s) throw new Error('Not logged in');
    return s;
  };

  return {
    kind: 'demo',

    getSession: () => readJson<Session>(KEYS.session),

    async loginWithQr(qrCardId: string): Promise<Session> {
      const persona = personaByCard(qrCardId);
      if (!persona) throw new Error('unknown_card');
      seedUser(persona.userId);
      const session: Session = {
        userId: persona.userId,
        displayName: persona.displayName,
        qrCardId: persona.qrCardId,
      };
      writeJson(KEYS.session, session);
      return session;
    },

    async logout(): Promise<void> {
      localStorage.removeItem(KEYS.session);
    },

    async getBalance(): Promise<number> {
      const { userId } = requireSession();
      return readJson<number>(KEYS.balance(userId)) ?? 0;
    },

    async submitScore(sub: ScoreSubmission): Promise<SubmitResult> {
      const { userId } = requireSession();
      const subsKey = KEYS.submissions(userId, sub.gameId);
      const recent = readJson<number[]>(subsKey) ?? [];

      const guard = validateScore(sub, { recentSubmissionsMs: recent });
      if (!guard.ok) {
        return { accepted: false, reason: guard.reason, crystalsAwarded: 0, newBalance: await this.getBalance(), unlockedTiers: [] };
      }

      writeJson(subsKey, [...recent.filter((t) => t > Date.now() - 120_000), Date.now()]);

      const prev = readJson<number>(KEYS.balance(userId)) ?? 0;
      const awarded = crystalsForScore(sub.score);
      const next = prev + awarded;
      writeJson(KEYS.balance(userId), next);

      const claimed = (readJson<Reward[]>(KEYS.rewards(userId)) ?? []).map((r) => r.tier);
      const unlocked = crossedTiers(prev, next)
        .filter((t) => !claimed.includes(t.tier))
        .map((t) => t.tier);

      return { accepted: true, crystalsAwarded: awarded, newBalance: next, unlockedTiers: unlocked };
    },

    async getRewards(): Promise<Reward[]> {
      const { userId } = requireSession();
      return (readJson<Reward[]>(KEYS.rewards(userId)) ?? []).sort((a, b) => a.tier - b.tier);
    },

    async mintTier(tier: number): Promise<MintResult> {
      const { userId } = requireSession();
      const { address } = await this.getWalletAddress();

      // Prefer a real devnet mint via the Vercel function when configured.
      const real = await tryRealMint(address, tier);
      const result: MintResult =
        real ??
        (await new Promise<MintResult>((resolve) =>
          setTimeout(
            () => resolve({ tier, cnftAssetId: demoAssetId(), signature: null, demo: true }),
            MINT_SIMULATION_MS,
          ),
        ));

      const rewards = readJson<Reward[]>(KEYS.rewards(userId)) ?? [];
      if (!rewards.some((r) => r.tier === tier)) {
        rewards.push({
          id: `mint-${userId}-${tier}-${Date.now()}`,
          tier,
          cnftAssetId: result.cnftAssetId,
          signature: result.signature,
          createdAt: new Date().toISOString(),
          demo: result.demo,
        });
        writeJson(KEYS.rewards(userId), rewards);
      }
      return result;
    },

    async getWalletAddress(): Promise<{ address: string; demo: boolean }> {
      const { userId } = requireSession();
      let address = localStorage.getItem(KEYS.wallet(userId));
      if (!address) {
        address = generateDemoAddress();
        localStorage.setItem(KEYS.wallet(userId), address);
      }
      return { address, demo: true };
    },
  };
}
