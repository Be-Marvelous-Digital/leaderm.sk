import { useEffect } from 'react';
import { pageReady } from './usePageReady';

export function useReveal(): void {
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
    els.forEach((el) => {
      const d = el.getAttribute('data-d');
      if (d) el.style.setProperty('--d', `${d}ms`);
    });
    const show = (el: Element) => el.classList.add('is-in');
    let active = false;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting && active) {
        show(e.target);
        io.unobserve(e.target);
      }
    }), { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    let dead = false;
    pageReady().then(() => {
      if (dead) return;
      active = true;
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) {
          io.unobserve(el);
          show(el);
        }
      });
    });
    return () => {
      dead = true;
      io.disconnect();
    };
  }, []);
}
