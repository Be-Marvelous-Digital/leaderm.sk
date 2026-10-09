import { WEEK_HOURS } from '../../data/site';
import { useMounted } from '../../hooks/useMounted';
import s from './Home.module.less';

const ROWS = [...WEEK_HOURS, { day: 'Piatok', dow: 5, time: 'zatvorené' }];

export function HoursList() {
  const mounted = useMounted();
  const today = mounted ? new Date().getDay() : -1;
  return (
    <ul className={s.hours}>
      {ROWS.map((h) => (
        <li key={h.dow} className={`${s.hoursRow} ${h.dow === today ? s.hoursToday : ''}`}>
          <span>{h.day}{h.dow === today ? ' · dnes' : ''}</span><span>{h.time}</span>
        </li>
      ))}
    </ul>
  );
}
