import { useCallback, useSyncExternalStore } from 'react';

export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback((cb: () => void) => {
    const mql = matchMedia(query);
    mql.addEventListener('change', cb);
    return () => mql.removeEventListener('change', cb);
  }, [query]);
  return useSyncExternalStore(subscribe, () => matchMedia(query).matches, () => serverValue);
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const useDesktop = () => useMediaQuery('(min-width: 900px)', true);
