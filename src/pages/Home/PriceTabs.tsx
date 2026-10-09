import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { PRICE_A, PRICE_B } from '../../data/site';
import { PriceList } from '../../components/PriceList/PriceList';
import s from './Home.module.less';

const TABS = [
  { label: 'Estetika a laser', rows: PRICE_B, tone: 'blush' as const },
  { label: 'Nehradené výkony', rows: PRICE_A, tone: 'sand' as const },
];

export function PriceTabs() {
  const [tab, setTab] = useState(0);
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (tab + dir + TABS.length) % TABS.length;
    setTab(next);
    refs.current[next]?.focus();
  };

  return (
    <div className={s.tabsWrap}>
      <div role="tablist" aria-label="Cenník" className={s.tabs}>
        <span className={s.tabIndicator} style={{ transform: `translateX(${tab * 100}%)` }} aria-hidden="true" />
        {TABS.map((t, i) => (
          <button
            key={t.label}
            ref={(el) => { refs.current[i] = el; }}
            id={`${base}-tab${i}`}
            type="button"
            role="tab"
            aria-selected={tab === i}
            aria-controls={`${base}-panel${i}`}
            tabIndex={tab === i ? 0 : -1}
            className={`${s.tab} ${tab === i ? s.tabOn : ''}`}
            onClick={() => setTab(i)}
            onKeyDown={onKey}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={s.tabPanels}>
        {TABS.map((t, i) => (
          <div key={t.label} id={`${base}-panel${i}`} role="tabpanel" aria-labelledby={`${base}-tab${i}`} hidden={tab !== i}>
            <PriceList rows={t.rows} tone={t.tone} />
          </div>
        ))}
      </div>
    </div>
  );
}
