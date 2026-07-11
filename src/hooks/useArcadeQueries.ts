import { useQuery } from '@tanstack/react-query';
import { useArcade } from '@/context/ArcadeContext';

export function useBalance() {
  const { provider, session } = useArcade();
  return useQuery({
    queryKey: ['balance', session?.userId],
    queryFn: () => provider.getBalance(),
    enabled: Boolean(session),
  });
}

export function useRewards() {
  const { provider, session } = useArcade();
  return useQuery({
    queryKey: ['rewards', session?.userId],
    queryFn: () => provider.getRewards(),
    enabled: Boolean(session),
  });
}

export function useWallet() {
  const { provider, session } = useArcade();
  return useQuery({
    queryKey: ['wallet', session?.userId],
    queryFn: () => provider.getWalletAddress(),
    enabled: Boolean(session),
    staleTime: Infinity,
  });
}
