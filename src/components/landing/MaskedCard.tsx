import type { CSSProperties, ReactNode } from 'react';
import type { MaskPosition } from '@/hooks/useMaskPositions';

interface MaskedCardProps {
  bgImage: string;
  position?: MaskPosition;
  imageWidth: number;
  /** 0–1: which horizontal slice of the overflowing image to focus. */
  focalX: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  cardRef?: (el: HTMLDivElement | null) => void;
}

/**
 * One "window" into a background image shared by every card in a section —
 * the cards form a cohesive mosaic of a single artwork.
 */
export function MaskedCard({
  bgImage,
  position,
  imageWidth,
  focalX,
  className,
  style,
  children,
  cardRef,
}: MaskedCardProps) {
  let bgStyle: CSSProperties;
  if (position && position.sh > 0) {
    const overflow = imageWidth > position.sw ? imageWidth - position.sw : 0;
    const focalOffset = overflow * focalX;
    bgStyle = {
      backgroundImage: `url("${bgImage}")`,
      backgroundSize: `auto ${position.sh}px`,
      backgroundPosition: `${-(position.x + focalOffset)}px ${-position.y}px`,
      backgroundRepeat: 'no-repeat',
    };
  } else {
    bgStyle = {
      backgroundImage: `url("${bgImage}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  }

  return (
    <div ref={cardRef} className={className} style={{ ...bgStyle, ...style }}>
      {children}
    </div>
  );
}
