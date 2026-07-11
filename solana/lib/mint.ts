import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity, publicKey, type Umi } from '@metaplex-foundation/umi';
import { base58 } from '@metaplex-foundation/umi/serializers';
import {
  mplBubblegum,
  mintToCollectionV1,
  parseLeafFromMintToCollectionV1Transaction,
  findLeafAssetIdPda,
} from '@metaplex-foundation/mpl-bubblegum';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';

export const TIER_NAMES: Record<number, string> = {
  1: 'First Facet',
  2: 'Crystal Collector',
  3: 'Gem Guardian',
  4: 'Master of Minds',
  99: 'Monthly Champion',
};

export const VALID_TIERS = new Set(Object.keys(TIER_NAMES).map(Number));

export interface MintConfig {
  rpcUrl: string;
  treeAddress: string;
  collectionMint: string;
  /** base58 string or JSON byte-array of the funded devnet payer secret. */
  payerSecretKey: string;
  /** Origin hosting /cnft/tier-N.json metadata. */
  baseUrl: string;
}

/** Accepts both base58 secrets and solana-keygen JSON arrays. */
export function decodeSecretKey(raw: string): Uint8Array {
  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) return Uint8Array.from(JSON.parse(trimmed) as number[]);
  return base58.serialize(trimmed);
}

export function encodeBase58(bytes: Uint8Array): string {
  return base58.deserialize(bytes)[0];
}

export function loadUmi(cfg: Pick<MintConfig, 'rpcUrl' | 'payerSecretKey'>): Umi {
  const umi = createUmi(cfg.rpcUrl).use(mplBubblegum()).use(mplTokenMetadata());
  const keypair = umi.eddsa.createKeypairFromSecretKey(decodeSecretKey(cfg.payerSecretKey));
  umi.use(keypairIdentity(keypair));
  return umi;
}

export interface MintOutcome {
  signature: string;
  assetId: string;
}

/**
 * Mint one Crystal Z milestone badge as a compressed NFT into the
 * collection, addressed to the (custodial) owner. The payer covers the
 * sub-cent fee; the senior never sees gas.
 */
export async function mintTierTo(
  umi: Umi,
  cfg: Omit<MintConfig, 'rpcUrl' | 'payerSecretKey'>,
  owner: string,
  tier: number,
): Promise<MintOutcome> {
  if (!VALID_TIERS.has(tier)) throw new Error(`Unknown tier: ${tier}`);
  const merkleTree = publicKey(cfg.treeAddress);
  const collectionMint = publicKey(cfg.collectionMint);

  const { signature } = await mintToCollectionV1(umi, {
    leafOwner: publicKey(owner),
    merkleTree,
    collectionMint,
    metadata: {
      name: `Crystal Z — ${TIER_NAMES[tier]}`,
      symbol: 'CZ',
      uri: `${cfg.baseUrl}/cnft/tier-${tier}.json`,
      sellerFeeBasisPoints: 0,
      collection: { key: collectionMint, verified: false },
      creators: [{ address: umi.identity.publicKey, verified: false, share: 100 }],
    },
  }).sendAndConfirm(umi, { confirm: { commitment: 'confirmed' } });

  const leaf = await parseLeafFromMintToCollectionV1Transaction(umi, signature);
  const [assetId] = findLeafAssetIdPda(umi, { merkleTree, leafIndex: leaf.nonce });

  return { signature: encodeBase58(signature), assetId: assetId.toString() };
}
