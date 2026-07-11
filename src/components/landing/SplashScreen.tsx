import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SplashScreenProps {
  onComplete: () => void;
}

const STEP_MS = 20;
const HOLD_AFTER_100_MS = 200;
const REMOVE_AFTER_100_MS = 900;

/** Full-screen loader: counts 0→100 in the bottom-left, then fades away. */
export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [count, setCount] = useState(0);
  const [exiting, setExiting] = useState(false);
  const reducedMotion = useReducedMotion();
  const done = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      setCount(100);
      const t = setTimeout(onComplete, 150);
      return () => clearTimeout(t);
    }
    const interval = setInterval(() => {
      setCount((c) => {
        if (c >= 100) return c;
        return c + 1;
      });
    }, STEP_MS);
    return () => clearInterval(interval);
  }, [reducedMotion, onComplete]);

  useEffect(() => {
    if (count < 100 || done.current || reducedMotion) return;
    done.current = true;
    const exitTimer = setTimeout(() => setExiting(true), HOLD_AFTER_100_MS);
    const removeTimer = setTimeout(onComplete, REMOVE_AFTER_100_MS);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [count, reducedMotion, onComplete]);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex items-end justify-start bg-cream transition-opacity duration-700 ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <span className="p-6 text-7xl font-bold leading-none tabular-nums text-ink md:p-10 md:text-9xl">
        {count}
      </span>
    </div>
  );
}
