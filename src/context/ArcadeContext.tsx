import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getProvider } from '@/lib/provider';
import type { DataProvider } from '@/lib/provider/types';
import type { Session } from '@/lib/types';

interface ArcadeContextValue {
  provider: DataProvider;
  session: Session | null;
  login: (qrCardId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const ArcadeContext = createContext<ArcadeContextValue | null>(null);

export function ArcadeProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<DataProvider | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    void getProvider().then((p) => {
      if (cancelled) return;
      setProvider(p);
      setSession(p.getSession());
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<ArcadeContextValue | null>(() => {
    if (!provider) return null;
    return {
      provider,
      session,
      login: async (qrCardId: string) => {
        const s = await provider.loginWithQr(qrCardId);
        setSession(s);
        await queryClient.invalidateQueries();
      },
      logout: async () => {
        await provider.logout();
        setSession(null);
        queryClient.clear();
      },
    };
  }, [provider, session, queryClient]);

  if (!value) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <span className="animate-crystal-pulse text-5xl" role="status" aria-label="Loading">
          💎
        </span>
      </div>
    );
  }

  return <ArcadeContext.Provider value={value}>{children}</ArcadeContext.Provider>;
}

export function useArcade(): ArcadeContextValue {
  const ctx = useContext(ArcadeContext);
  if (!ctx) throw new Error('useArcade must be used inside <ArcadeProvider>');
  return ctx;
}
