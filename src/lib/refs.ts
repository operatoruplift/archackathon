import type { MutableRefObject, RefCallback, RefObject } from 'react';

type AnyRef<T> = RefObject<T | null> | RefCallback<T | null>;

/** Assign one element to several refs (object or callback). */
export function mergeRefs<T>(...refs: AnyRef<T>[]): RefCallback<T | null> {
  return (el) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(el);
      else (ref as MutableRefObject<T | null>).current = el;
    }
  };
}
