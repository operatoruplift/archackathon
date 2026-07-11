/**
 * Vercel serverless mint fallback. Lets the deployed demo mint REAL devnet
 * cNFTs with zero Supabase setup: the client posts { owner, tier } and the
 * funded devnet payer mints a badge to that custodial address.
 *
 * Deliberately demo-grade (devnet-only assets, IP rate limit). The
 * production path is the Supabase edge function, which verifies the
 * player's crystal balance server-side before minting.
 *
 * Self-contained on purpose: Vercel bundles npm imports for this entry
 * file but does not emit sibling TS modules from outside /api, so the
 * small mint core is inlined here (scripts use solana/lib/mint.ts).
 */
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity, publicKey } from '@metaplex-foundation/umi';
import { base58 } from '@metaplex-foundation/umi/serializers';
import {
  mplBubblegum,
  mintToCollectionV1,
  parseLeafFromMintToCollectionV1Transaction,
  findLeafAssetIdPda,
} from '@metaplex-foundation/mpl-bubblegum';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';

const TIER_NAMES: Record<number, string> = {
  1: 'First Facet',
  2: 'Crystal Collector',
  3: 'Gem Guardian',
  4: 'Master of Minds',
  99: 'Monthly Champion',
};
const VALID_TIERS = new Set(Object.keys(TIER_NAMES).map(Number));

interface MintRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface MintResponse {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => MintResponse;
  json: (body: unknown) => void;
  end: () => void;
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => t > now - RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

/** Accepts both base58 secrets and solana-keygen JSON arrays. */
function decodeSecretKey(raw: string): Uint8Array {
  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) return Uint8Array.from(JSON.parse(trimmed) as number[]);
  return base58.serialize(trimmed);
}

export default async function handler(req: MintRequest, res: MintResponse): Promise<void> {
  const origin = process.env.MINT_ALLOWED_ORIGIN ?? '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const { SOLANA_RPC_URL, MERKLE_TREE_ADDRESS, COLLECTION_MINT_ADDRESS, PAYER_SECRET_KEY } = process.env;
  if (!SOLANA_RPC_URL || !MERKLE_TREE_ADDRESS || !COLLECTION_MINT_ADDRESS || !PAYER_SECRET_KEY) {
    // Client treats 503 as "demo mode": it simulates the mint locally.
    res.status(503).json({ configured: false, error: 'mint_not_configured' });
    return;
  }

  const forwarded = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(ip)) {
    res.status(429).json({ error: 'rate_limited' });
    return;
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as
    | { owner?: string; tier?: number }
    | undefined;
  const tier = Number(body?.tier);
  if (!body?.owner || !VALID_TIERS.has(tier)) {
    res.status(400).json({ error: 'invalid_request' });
    return;
  }
  try {
    publicKey(body.owner);
  } catch {
    res.status(400).json({ error: 'invalid_owner' });
    return;
  }

  const host = (Array.isArray(req.headers.host) ? req.headers.host[0] : req.headers.host) ?? '';
  const baseUrl =
    process.env.PUBLIC_BASE_URL ?? (host ? `https://${host}` : 'https://archackathon-operatoruplift.vercel.app');

  try {
    const umi = createUmi(SOLANA_RPC_URL).use(mplBubblegum()).use(mplTokenMetadata());
    const payer = umi.eddsa.createKeypairFromSecretKey(decodeSecretKey(PAYER_SECRET_KEY));
    umi.use(keypairIdentity(payer));

    const merkleTree = publicKey(MERKLE_TREE_ADDRESS);
    const collectionMint = publicKey(COLLECTION_MINT_ADDRESS);

    const { signature } = await mintToCollectionV1(umi, {
      leafOwner: publicKey(body.owner),
      merkleTree,
      collectionMint,
      metadata: {
        name: `Crystal Z — ${TIER_NAMES[tier]}`,
        symbol: 'CZ',
        uri: `${baseUrl}/cnft/tier-${tier}.json`,
        sellerFeeBasisPoints: 0,
        collection: { key: collectionMint, verified: false },
        creators: [{ address: umi.identity.publicKey, verified: false, share: 100 }],
      },
    }).sendAndConfirm(umi, { confirm: { commitment: 'confirmed' } });

    const leaf = await parseLeafFromMintToCollectionV1Transaction(umi, signature);
    const [assetId] = findLeafAssetIdPda(umi, { merkleTree, leafIndex: leaf.nonce });

    res.status(200).json({
      signature: base58.deserialize(signature)[0],
      assetId: assetId.toString(),
      network: 'devnet',
    });
  } catch (err) {
    console.error('mint failed', err);
    res.status(502).json({ error: 'mint_failed' });
  }
}
