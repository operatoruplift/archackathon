import { useCallback, useState } from 'react';
import { SplashScreen } from '@/components/landing/SplashScreen';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { GallerySection } from '@/components/landing/GallerySection';
import { OnChainSection } from '@/components/landing/OnChainSection';
import { StatementStrip } from '@/components/landing/StatementStrip';
import { PanelsFooter } from '@/components/landing/PanelsFooter';

const SPLASH_KEY = 'cz.splash.seen';

function splashAlreadySeen(): boolean {
  try {
    return sessionStorage.getItem(SPLASH_KEY) === '1';
  } catch {
    return true;
  }
}

export default function Landing() {
  const [showSplash, setShowSplash] = useState(() => !splashAlreadySeen());

  const handleSplashComplete = useCallback(() => {
    try {
      sessionStorage.setItem(SPLASH_KEY, '1');
    } catch {
      /* ignore */
    }
    setShowSplash(false);
  }, []);

  return (
    <div className="bg-cream">
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <LandingNavbar />
      <main>
        <HeroSection />
        <GallerySection />
        <OnChainSection />
        <StatementStrip />
      </main>
      <PanelsFooter />
    </div>
  );
}
