import { useSyncExternalStore } from 'react';

let y = 0;
const listeners = new Set<() => void>();
let raf = 0;

function onScroll() {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    y = scrollY;
    listeners.forEach((l) => l());
  });
}

function subscribe(cb: () => void) {
  if (!listeners.size) {
    y = scrollY;
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
    if (!listeners.size) {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
    }
  };
}

export const useScrollY = () => useSyncExternalStore(subscribe, () => y, () => 0);
