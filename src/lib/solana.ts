const DEVNET_QUERY = 'cluster=devnet';

export function explorerTxUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?${DEVNET_QUERY}`;
}

export function explorerAddressUrl(address: string): string {
  return `https://explorer.solana.com/address/${address}?${DEVNET_QUERY}`;
}

interface DasAsset {
  id: string;
  content?: { metadata?: { name?: string }; links?: { image?: string } };
}

/**
 * Fetch compressed NFTs for an owner via the DAS API (requires a
 * DAS-capable RPC such as Helius devnet; the public devnet RPC does not
 * implement DAS). Optional enrichment — the app renders from Supabase rows
 * when this is not configured.
 */
export async function fetchAssetsByOwner(dasRpcUrl: string, owner: string): Promise<DasAsset[]> {
  const res = await fetch(dasRpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'crystal-z',
      method: 'getAssetsByOwner',
      params: { ownerAddress: owner, page: 1, limit: 50 },
    }),
  });
  if (!res.ok) throw new Error(`DAS request failed: ${res.status}`);
  const json = (await res.json()) as { result?: { items?: DasAsset[] } };
  return json.result?.items ?? [];
}
