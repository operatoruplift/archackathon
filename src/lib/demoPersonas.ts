export interface DemoPersona {
  userId: string;
  displayName: string;
  qrCardId: string;
  /** Crystal balance carried over from "previous sessions" for the demo. */
  startBalance: number;
  /** Tiers pre-claimed in earlier demo sessions. */
  preClaimedTiers: number[];
  defaultLocale: 'en' | 'ms' | 'zh';
}

/**
 * Three seeded QR-card seniors, staged at interesting distances from the
 * next milestone so a live demo crosses a threshold within one game.
 */
export const DEMO_PERSONAS: DemoPersona[] = [
  {
    userId: 'demo-tan',
    displayName: 'Mdm. Tan Mei Li',
    qrCardId: 'CZ-QR-0231',
    startBalance: 38,
    preClaimedTiers: [1],
    defaultLocale: 'zh',
  },
  {
    userId: 'demo-kumar',
    displayName: 'Mr. Kumar Rajan',
    qrCardId: 'CZ-QR-0412',
    startBalance: 8,
    preClaimedTiers: [],
    defaultLocale: 'en',
  },
  {
    userId: 'demo-aisyah',
    displayName: 'Cik Aisyah Rahman',
    qrCardId: 'CZ-QR-0567',
    startBalance: 132,
    preClaimedTiers: [1, 2],
    defaultLocale: 'ms',
  },
];

export function personaByCard(qrCardId: string): DemoPersona | undefined {
  return DEMO_PERSONAS.find((p) => p.qrCardId === qrCardId);
}
