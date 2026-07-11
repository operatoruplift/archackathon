/**
 * One-shot devnet provisioning for the Crystal Z reward layer:
 *   1. creates (or loads) a payer keypair and airdrops devnet SOL
 *   2. creates the Bubblegum Merkle tree that stores the cNFT leaves
 *   3. creates the "Crystal Z Rewards" collection NFT
 *   4. writes solana/addresses.json + prints the env vars to configure
 *
 * Run: npm run solana:setup
 */
import fs from 'node:fs';
import path from 'node:path';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { generateSigner, keypairIdentity, percentAmount, sol } from '@metaplex-foundation/umi';
import { createTree, mplBubblegum } from '@metaplex-foundation/mpl-bubblegum';
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { encodeBase58 } from '../lib/mint';

const RPC_URL = process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';
const BASE_URL = process.env.PUBLIC_BASE_URL ?? 'https://archackathon-operatoruplift.vercel.app';
const KEYS_DIR = path.resolve('solana/.keys');
const PAYER_PATH = path.join(KEYS_DIR, 'payer.json');
const ADDRESSES_PATH = path.resolve('solana/addresses.json');

// Depth 14 / buffer 64 ≈ 16k leaves — plenty for 2,000 users × badges.
const TREE_MAX_DEPTH = 14;
const TREE_MAX_BUFFER = 64;
const MIN_BALANCE_SOL = 1;

async function main(): Promise<void> {
  const umi = createUmi(RPC_URL).use(mplBubblegum()).use(mplTokenMetadata());

  fs.mkdirSync(KEYS_DIR, { recursive: true });
  let secret: Uint8Array;
  if (fs.existsSync(PAYER_PATH)) {
    secret = Uint8Array.from(JSON.parse(fs.readFileSync(PAYER_PATH, 'utf8')) as number[]);
    console.log('• Loaded existing payer keypair');
  } else {
    const fresh = umi.eddsa.generateKeypair();
    secret = fresh.secretKey;
    fs.writeFileSync(PAYER_PATH, JSON.stringify([...secret]));
    console.log('• Generated new payer keypair (solana/.keys/payer.json — gitignored)');
  }
  const payer = umi.eddsa.createKeypairFromSecretKey(secret);
  umi.use(keypairIdentity(payer));
  console.log(`• Payer: ${payer.publicKey.toString()}`);

  const balance = await umi.rpc.getBalance(payer.publicKey);
  const balanceSol = Number(balance.basisPoints) / 1e9;
  console.log(`• Balance: ${balanceSol.toFixed(3)} SOL`);
  if (balanceSol < MIN_BALANCE_SOL) {
    try {
      console.log('• Requesting 2 SOL airdrop…');
      await umi.rpc.airdrop(payer.publicKey, sol(2));
      console.log('  ✓ Airdrop confirmed');
    } catch {
      console.warn('  ! Airdrop rate-limited. Fund manually: https://faucet.solana.com');
      console.warn(`    Address: ${payer.publicKey.toString()}`);
      process.exit(1);
    }
  }

  console.log(`• Creating Merkle tree (depth ${TREE_MAX_DEPTH}, buffer ${TREE_MAX_BUFFER})…`);
  const merkleTree = generateSigner(umi);
  const treeTx = await createTree(umi, {
    merkleTree,
    maxDepth: TREE_MAX_DEPTH,
    maxBufferSize: TREE_MAX_BUFFER,
  });
  await treeTx.sendAndConfirm(umi);
  console.log(`  ✓ Tree: ${merkleTree.publicKey.toString()}`);

  console.log('• Creating "Crystal Z Rewards" collection NFT…');
  const collectionMint = generateSigner(umi);
  await createNft(umi, {
    mint: collectionMint,
    name: 'Crystal Z Rewards',
    symbol: 'CZ',
    uri: `${BASE_URL}/cnft/collection.json`,
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true,
  }).sendAndConfirm(umi);
  console.log(`  ✓ Collection: ${collectionMint.publicKey.toString()}`);

  const addresses = {
    network: 'devnet',
    rpcUrl: RPC_URL,
    payerPublicKey: payer.publicKey.toString(),
    treeAddress: merkleTree.publicKey.toString(),
    collectionMint: collectionMint.publicKey.toString(),
    createdAt: new Date().toISOString(),
  };
  fs.writeFileSync(ADDRESSES_PATH, `${JSON.stringify(addresses, null, 2)}\n`);
  console.log('• Wrote solana/addresses.json');

  const payerBase58 = encodeBase58(secret);
  console.log(`
──────────────────────────────────────────────────────────────
Configure these secrets (Vercel env vars + \`supabase secrets set\`):

SOLANA_RPC_URL=${RPC_URL}
MERKLE_TREE_ADDRESS=${merkleTree.publicKey.toString()}
COLLECTION_MINT_ADDRESS=${collectionMint.publicKey.toString()}
PAYER_SECRET_KEY=${payerBase58}
PUBLIC_BASE_URL=${BASE_URL}

Explorer:
  https://explorer.solana.com/address/${merkleTree.publicKey.toString()}?cluster=devnet
  https://explorer.solana.com/address/${collectionMint.publicKey.toString()}?cluster=devnet
──────────────────────────────────────────────────────────────`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
