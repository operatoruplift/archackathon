import { base58Encode } from './base58';

/**
 * Demo-mode stand-in for the custodial wallet service: a random 32-byte
 * public key. In production wallets are generated server-side and their
 * secrets stored AES-GCM-encrypted (see supabase/functions/mint-reward-cnft).
 */
export function generateDemoAddress(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base58Encode(bytes);
}

export function shortAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
