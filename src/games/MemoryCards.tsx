import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatChip, GameFrame } from './ui';
import type { GameProps } from './types';

const EMOJI = ['🍊', '🌺', '🐟', '🦜', '🏮', '🥟', '🌙', '⭐'];

interface Card {
  id: number;
  emoji: string;
  matched: boolean;
}

function buildDeck(pairs: number): Card[] {
  const chosen = EMOJI.slice(0, pairs);
  const deck = [...chosen, ...chosen].map((emoji, id) => ({ id, emoji, matched: false }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function makeMemoryGame(pairs: number, baseScore: number, cols: string) {
  return function MemoryGame({ onGameOver }: GameProps) {
    const { t } = useTranslation();
    const [deck, setDeck] = useState<Card[]>(() => buildDeck(pairs));
    const [flipped, setFlipped] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [lock, setLock] = useState(false);
    const endedRef = useRef(false);

    useEffect(() => {
      if (endedRef.current) return;
      if (deck.length > 0 && deck.every((c) => c.matched)) {
        endedRef.current = true;
        const score = Math.max(0, baseScore - Math.max(0, moves - pairs) * 10);
        // brief pause so the final pair is visible before the summary
        setTimeout(() => onGameOver(score), 600);
      }
    }, [deck, moves, onGameOver]);

    const flip = (index: number) => {
      if (lock || deck[index].matched || flipped.includes(index)) return;
      const next = [...flipped, index];
      setFlipped(next);
      if (next.length === 2) {
        setMoves((m) => m + 1);
        const [a, b] = next;
        if (deck[a].emoji === deck[b].emoji) {
          setDeck((d) => d.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)));
          setFlipped([]);
        } else {
          setLock(true);
          setTimeout(() => {
            setFlipped([]);
            setLock(false);
          }, 800);
        }
      }
    };

    return (
      <GameFrame hud={<StatChip label={t('shell.moves')} value={moves} />}>
        <div className={`grid w-full max-w-lg gap-2 md:gap-3 ${cols}`}>
          {deck.map((card, i) => {
            const faceUp = card.matched || flipped.includes(i);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => flip(i)}
                aria-label={faceUp ? card.emoji : 'Hidden card'}
                className={`aspect-square rounded-xl border text-3xl transition-all duration-300 md:rounded-2xl md:text-5xl ${
                  faceUp
                    ? card.matched
                      ? 'border-crystal-cyan/60 bg-crystal-cyan/20'
                      : 'border-white/40 bg-white/20'
                    : 'border-white/15 bg-white/5 hover:bg-white/10'
                }`}
              >
                {faceUp ? card.emoji : '💠'}
              </button>
            );
          })}
        </div>
      </GameFrame>
    );
  };
}

export const MemoryCardsEasy = makeMemoryGame(6, 240, 'grid-cols-4');
export const MemoryCardsHard = makeMemoryGame(8, 320, 'grid-cols-4');
