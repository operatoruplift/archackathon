/**
 * mint-reward-cnft — the production mint path (Arc NS Buildathon).
 *
 * Flow (all server-side, so a spoofed client cannot mint unearned tiers):
 *   1. authenticate the caller's JWT
 *   2. lazily create their custodial wallet (AES-GCM-encrypted secret)
 *   3. recompute their Crystal balance from the append-only ledger
 *   4. mint a Bubblegum cNFT for every earned-but-unclaimed tier
 *   5. record rows in milestone_rewards and return signatures + asset IDs
 *
 * Secrets (supabase secrets set):
 *   SOLANA_RPC_URL, MERKLE_TREE_ADDRESS, COLLECTION_MINT_ADDRESS,
 *   PAYER_SECRET_KEY (base58, devnet), WALLET_ENC_KEY (base64 32 bytes),
 *   PUBLIC_BASE_URL (metadata host)
 */
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import { createUmi } from 'npm:@metaplex-foundation/umi-bundle-defaults@0.9.2';
import { keypairIdentity, publicKey } from 'npm:@metaplex-foundation/umi@0.9.2';
import { base58 } from 'npm:@metaplex-foundation/umi@0.9.2/serializers';
import {
  mplBubblegum,
  mintToCollectionV1,
  parseLeafFromMintToCollectionV1Transaction,
  findLeafAssetIdPda,
} from 'npm:@metaplex-foundation/mpl-bubblegum@4.2.1';
import { mplTokenMetadata } from 'npm:@metaplex-foundation/mpl-token-metadata@3.2.1';
import { corsHeaders, json } from '../_shared/cors.ts';

const TIER_NAMES: Record<number, string> = {
  1: 'First Facet',
  2: 'Crystal Collector',
  3: 'Gem Guardian',
  4: 'Master of Minds',
  99: 'Monthly Champion',
};

// ── Custodial wallet secret encryption (AES-GCM via WebCrypto) ──
async function importAesKey(base64Key: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function encryptSecret(secret: Uint8Array, base64Key: string): Promise<string> {
  const key = await importAesKey(base64Key);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, secret));
  const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
  return `${b64(iv)}.${b64(cipher)}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 1 ── Authenticate the caller
    const jwt = req.headers.get('Authorization')?.replace('Bearer ', '') ?? '';
    const {
      data: { user },
    } = await admin.auth.getUser(jwt);
    if (!user) return json({ error: 'unauthorized' }, 401);

    const body = (await req.json().catch(() => ({}))) as {
      tier?: number;
      ensureWalletOnly?: boolean;
    };

    // 2 ── Ensure a custodial wallet exists for this user
    const encKey = Deno.env.get('WALLET_ENC_KEY');
    if (!encKey) return json({ error: 'wallet_enc_key_missing' }, 500);

    const { data: existingWallet } = await admin
      .from('wallets')
      .select('public_key')
      .eq('user_id', user.id)
      .maybeSingle();

    let walletAddress = existingWallet?.public_key as string | undefined;
    const umiBase = createUmi(Deno.env.get('SOLANA_RPC_URL') ?? 'https://api.devnet.solana.com')
      .use(mplBubblegum())
      .use(mplTokenMetadata());

    if (!walletAddress) {
      const fresh = umiBase.eddsa.generateKeypair();
      const encrypted = await encryptSecret(fresh.secretKey, encKey);
      const { error: walletError } = await admin.from('wallets').insert({
        user_id: user.id,
        public_key: fresh.publicKey.toString(),
        encrypted_secret: encrypted,
      });
      if (walletError) return json({ error: 'wallet_create_failed' }, 500);
      await admin.from('profiles').update({ solana_wallet: fresh.publicKey.toString() }).eq('id', user.id);
      walletAddress = fresh.publicKey.toString();
    }

    if (body.ensureWalletOnly) return json({ wallet: walletAddress });

    // 3 ── Recompute balance from the ledger (source of truth)
    const { data: ledger } = await admin.from('user_crystals').select('amount').eq('user_id', user.id);
    const balance = (ledger ?? []).reduce((sum, row) => sum + (row.amount as number), 0);

    const { data: tiersData } = await admin
      .from('reward_tiers')
      .select('tier, threshold')
      .not('threshold', 'is', null)
      .order('tier');
    const { data: claimedData } = await admin
      .from('milestone_rewards')
      .select('milestone_tier')
      .eq('user_id', user.id);
    const claimed = new Set((claimedData ?? []).map((r) => r.milestone_tier as number));

    let eligible = (tiersData ?? [])
      .filter((t) => (t.threshold as number) <= balance && !claimed.has(t.tier as number))
      .map((t) => t.tier as number);
    if (typeof body.tier === 'number') {
      eligible = eligible.filter((t) => t === body.tier);
      if (eligible.length === 0) return json({ error: 'tier_not_earned' }, 403);
    }
    if (eligible.length === 0) return json({ results: [], wallet: walletAddress });

    // 4 ── Mint each earned tier as a compressed NFT
    const payerSecret = Deno.env.get('PAYER_SECRET_KEY');
    const treeAddress = Deno.env.get('MERKLE_TREE_ADDRESS');
    const collectionMint = Deno.env.get('COLLECTION_MINT_ADDRESS');
    if (!payerSecret || !treeAddress || !collectionMint) {
      return json({ error: 'mint_not_configured' }, 503);
    }
    const baseUrl = Deno.env.get('PUBLIC_BASE_URL') ?? 'https://archackathon.vercel.app';

    const payer = umiBase.eddsa.createKeypairFromSecretKey(base58.serialize(payerSecret));
    const umi = umiBase.use(keypairIdentity(payer));
    const merkleTree = publicKey(treeAddress);
    const collection = publicKey(collectionMint);

    const results: { tier: number; assetId: string; signature: string }[] = [];
    for (const tier of eligible) {
      const { signature } = await mintToCollectionV1(umi, {
        leafOwner: publicKey(walletAddress),
        merkleTree,
        collectionMint: collection,
        metadata: {
          name: `Crystal Z — ${TIER_NAMES[tier] ?? `Tier ${tier}`}`,
          symbol: 'CZ',
          uri: `${baseUrl}/cnft/tier-${tier}.json`,
          sellerFeeBasisPoints: 0,
          collection: { key: collection, verified: false },
          creators: [{ address: umi.identity.publicKey, verified: false, share: 100 }],
        },
      }).sendAndConfirm(umi, { confirm: { commitment: 'confirmed' } });

      const leaf = await parseLeafFromMintToCollectionV1Transaction(umi, signature);
      const [assetId] = findLeafAssetIdPda(umi, { merkleTree, leafIndex: leaf.nonce });
      const sig = base58.deserialize(signature)[0];

      // 5 ── Record the reward (unique user+tier keeps this idempotent)
      const { error: insertError } = await admin.from('milestone_rewards').insert({
        user_id: user.id,
        cnft_asset_id: assetId.toString(),
        milestone_tier: tier,
        mint_signature: sig,
      });
      if (insertError && !insertError.message.includes('duplicate')) {
        console.error('milestone_rewards insert failed', insertError);
      }
      results.push({ tier, assetId: assetId.toString(), signature: sig });
    }

    const first = results[0];
    return json({
      results,
      wallet: walletAddress,
      assetId: first?.assetId,
      signature: first?.signature,
    });
  } catch (err) {
    console.error('mint-reward-cnft failed', err);
    return json({ error: 'internal_error' }, 500);
  }
});
