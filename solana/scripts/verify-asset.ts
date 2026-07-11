/**
 * Reads a compressed NFT back from chain via the DAS API — the same lookup
 * judges can do on an explorer. Requires a DAS-capable RPC (e.g. Helius
 * devnet); the public devnet RPC does not implement DAS.
 *
 * Run: npm run solana:verify -- <assetId>
 */
const DAS_RPC = process.env.VITE_DAS_RPC_URL ?? process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';

async function main(): Promise<void> {
  const assetId = process.argv[2];
  if (!assetId) {
    console.error('Usage: npm run solana:verify -- <assetId>');
    process.exit(1);
  }

  const res = await fetch(DAS_RPC, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 'cz', method: 'getAsset', params: { id: assetId } }),
  });
  const json = (await res.json()) as {
    result?: {
      content?: { metadata?: { name?: string }; json_uri?: string };
      ownership?: { owner?: string };
      compression?: { compressed?: boolean; tree?: string };
    };
    error?: { message?: string };
  };

  if (!json.result) {
    console.error(`DAS lookup failed: ${json.error?.message ?? 'no result'}`);
    console.error('If you are on the public devnet RPC, set VITE_DAS_RPC_URL to a DAS-capable endpoint.');
    process.exit(1);
  }

  const asset = json.result;
  console.log(`Name:       ${asset.content?.metadata?.name}`);
  console.log(`Owner:      ${asset.ownership?.owner}`);
  console.log(`Compressed: ${asset.compression?.compressed}`);
  console.log(`Tree:       ${asset.compression?.tree}`);
  console.log(`Metadata:   ${asset.content?.json_uri}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
