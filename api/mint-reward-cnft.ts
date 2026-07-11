/**
 * Vercel serverless mint fallback. Lets the deployed demo mint REAL devnet
 * cNFTs with zero Supabase setup: the client posts { owner, tier } and the
 * funded devnet payer mints a badge to that custodial address.
 *
 * Deliberately demo-grade (devnet-only assets, IP rate limit). The
 * production path is the Supabase edge function, which verifies the
 * player's crystal balance server-side before minting.
 */
import { publicKey } from '@metaplex-foundation/umi';
import { loadUmi, mintTierTo, VALID_TIERS } from '../solana/lib/mint';

interface MintRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  socket?: { remoteAddress?: string };
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
  const baseUrl = process.env.PUBLIC_BASE_URL ?? (host ? `https://${host}` : 'https://archackathon.vercel.app');

  try {
    const umi = loadUmi({ rpcUrl: SOLANA_RPC_URL, payerSecretKey: PAYER_SECRET_KEY });
    const result = await mintTierTo(
      umi,
      { treeAddress: MERKLE_TREE_ADDRESS, collectionMint: COLLECTION_MINT_ADDRESS, baseUrl },
      body.owner,
      tier,
    );
    res.status(200).json({ signature: result.signature, assetId: result.assetId, network: 'devnet' });
  } catch (err) {
    console.error('mint failed', err);
    res.status(502).json({ error: 'mint_failed' });
  }
}
