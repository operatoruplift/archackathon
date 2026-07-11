/**
 * Proves the mint path end-to-end before wiring the app:
 * mints one tier-1 badge to the payer (or --owner <pubkey>).
 *
 * Run: npm run solana:mint-test [-- --owner <pubkey> --tier <n>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadUmi, mintTierTo, TIER_NAMES } from '../lib/mint';

const ADDRESSES_PATH = path.resolve('solana/addresses.json');
const PAYER_PATH = path.resolve('solana/.keys/payer.json');
const BASE_URL = process.env.PUBLIC_BASE_URL ?? 'https://archackathon-operatoruplift.vercel.app';

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
  if (!fs.existsSync(ADDRESSES_PATH) || !fs.existsSync(PAYER_PATH)) {
    console.error('Run `npm run solana:setup` first.');
    process.exit(1);
  }
  const addresses = JSON.parse(fs.readFileSync(ADDRESSES_PATH, 'utf8')) as {
    rpcUrl: string;
    treeAddress: string;
    collectionMint: string;
    payerPublicKey: string;
  };
  const payerSecretKey = fs.readFileSync(PAYER_PATH, 'utf8');

  const umi = loadUmi({ rpcUrl: addresses.rpcUrl, payerSecretKey });
  const owner = argValue('--owner') ?? addresses.payerPublicKey;
  const tier = Number(argValue('--tier') ?? 1);

  console.log(`• Minting "${TIER_NAMES[tier]}" (tier ${tier}) to ${owner}…`);
  const result = await mintTierTo(
    umi,
    { treeAddress: addresses.treeAddress, collectionMint: addresses.collectionMint, baseUrl: BASE_URL },
    owner,
    tier,
  );

  console.log(`  ✓ Signature: ${result.signature}`);
  console.log(`  ✓ Asset ID:  ${result.assetId}`);
  console.log(`
Verify:
  https://explorer.solana.com/tx/${result.signature}?cluster=devnet
  https://explorer.solana.com/address/${result.assetId}?cluster=devnet`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
