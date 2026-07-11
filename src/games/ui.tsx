import type { ReactNode } from 'react';

/** Frosted stat chip used across every game HUD. */
export function StatChip({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-cream/60">{label}</span>
      <span className="text-lg font-bold tabular-nums text-cream md:text-xl">{value}</span>
    </div>
  );
}

/** Centered flexible play area shared by all games. */
export function GameFrame({ children, hud }: { children: ReactNode; hud?: ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col items-center">
      {hud && <div className="flex flex-wrap items-center justify-center gap-2 pb-4 md:gap-3">{hud}</div>}
      <div className="flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6">{children}</div>
    </div>
  );
}
