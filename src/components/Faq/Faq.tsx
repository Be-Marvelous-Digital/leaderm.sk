import { useId, useState } from 'react';
import type { Faq as FaqItem } from '../../data/site';
import s from './Faq.module.less';

export function Faq({ items, defaultOpen = -1 }: { items: FaqItem[]; defaultOpen?: number }) {
  const [open, setOpen] = useState(defaultOpen);
  const base = useId();
  return (
    <div className={s.list}>
      {items.map(([q, a], i) => {
        const isOpen = open === i;
        const btnId = `${base}-q${i}`;
        const panelId = `${base}-a${i}`;
        return (
          <div key={q} className={s.item}>
            <h3 className={s.heading}>
              <button id={btnId} type="button" className={s.button} aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpen(isOpen ? -1 : i)}>
                <span className={s.num}>{String(i + 1).padStart(2, '0')}</span>
                <span className={s.q}>{q}</span>
                <span className={`${s.icon} ${isOpen ? s.iconOpen : ''}`} aria-hidden="true">+</span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={btnId} className={`${s.panel} ${isOpen ? s.panelOpen : ''}`} inert={!isOpen}>
              <div className={s.panelInner}><p className={s.a}>{a}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
