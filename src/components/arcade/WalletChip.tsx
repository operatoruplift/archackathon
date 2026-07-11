import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Copy, ExternalLink, Wallet } from 'lucide-react';
import { useWallet } from '@/hooks/useArcadeQueries';
import { shortAddress } from '@/lib/wallet';
import { explorerAddressUrl } from '@/lib/solana';

/** Custodial wallet address with copy + explorer actions. */
export function WalletChip() {
  const { t } = useTranslation();
  const { data: wallet } = useWallet();
  const [copied, setCopied] = useState(false);

  if (!wallet) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      toast.success(t('toasts.copied'));
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-3 py-1.5">
      <Wallet size={14} strokeWidth={2} className="text-teal" aria-hidden="true" />
      <span className="font-mono text-xs font-semibold text-ink" title={wallet.address}>
        {shortAddress(wallet.address)}
      </span>
      {wallet.demo && (
        <span className="rounded-full bg-cream-deep px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ink/60">
          {t('arcade.walletDemo')}
        </span>
      )}
      <button
        type="button"
        onClick={() => void copy()}
        aria-label={t('arcade.walletCopy')}
        className="rounded-full p-1 text-ink/60 transition-colors hover:bg-cream hover:text-ink"
      >
        <Copy size={13} strokeWidth={2} className={copied ? 'text-emerald-600' : undefined} />
      </button>
      {!wallet.demo && (
        <a
          href={explorerAddressUrl(wallet.address)}
          target="_blank"
          rel="noreferrer"
          aria-label={t('arcade.walletView')}
          className="rounded-full p-1 text-ink/60 transition-colors hover:bg-cream hover:text-ink"
        >
          <ExternalLink size={13} strokeWidth={2} />
        </a>
      )}
    </div>
  );
}
