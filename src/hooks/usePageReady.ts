let ready: Promise<void> | null = null;

export function pageReady(): Promise<void> {
  if (ready) return ready;
  ready = new Promise((resolve) => {
    const go = () => (document.fonts ? document.fonts.ready : Promise.resolve())
      .then(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const visible = () => {
      if (document.visibilityState === 'visible') return go();
      document.addEventListener('visibilitychange', function f() {
        if (document.visibilityState === 'visible') {
          document.removeEventListener('visibilitychange', f);
          go();
        }
      });
    };
    if (document.readyState === 'complete') visible();
    else addEventListener('load', visible, { once: true });
  });
  return ready;
}
