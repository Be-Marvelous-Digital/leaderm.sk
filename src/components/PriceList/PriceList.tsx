import type { PriceRow } from '../../data/site';
import s from './PriceList.module.less';

export function PriceList({ rows, tone = 'sand' }: { rows: PriceRow[]; tone?: 'sand' | 'blush' | 'surface' }) {
  return (
    <ol className={`${s.list} ${s[tone]}`}>
      {rows.map(([n, v], i) => (
        <li key={n} className={s.row}>
          <span className={s.i}>{String(i + 1).padStart(2, '0')}</span>
          <span className={s.n}>{n}</span>
          <span className={s.v}>{v}</span>
        </li>
      ))}
    </ol>
  );
}
