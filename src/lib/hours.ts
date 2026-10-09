import { SCHEDULE } from '../data/site';

export type OpenStatus = { kind: 'open' | 'today' | 'later'; label: string; time: string; nextDow: number };

const DAY = ['Nedeľa', 'Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok', 'Sobota'];
const hm = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;

export function status(now: Date): OpenStatus {
  const dow = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const t = SCHEDULE[dow];
  if (t && mins >= t[0] && mins < t[1]) return { kind: 'open', label: 'Otvorené', time: `do ${hm(t[1])}`, nextDow: dow };
  if (t && mins < t[0]) return { kind: 'today', label: 'Dnes', time: `od ${hm(t[0])}`, nextDow: dow };
  let n = dow;
  for (let i = 1; i <= 7; i++) {
    n = (dow + i) % 7;
    if (SCHEDULE[n]) break;
  }
  return { kind: 'later', label: n === (dow + 1) % 7 ? 'Zajtra' : DAY[n], time: `od ${hm(SCHEDULE[n][0])}`, nextDow: n };
}
