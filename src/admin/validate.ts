import type { AnnInput } from './api';

export const TITLE_MAX = 120;
export const BODY_MAX = 1000;

export type FieldErrors = Partial<Record<keyof AnnInput, string>>;

export const charCount = (s: string) => [...s].length;

const pad = (n: number) => String(n).padStart(2, '0');
export const todayIso = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function isValidDate(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const [y, m, d] = v.split('-').map(Number) as [number, number, number];
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function normalize(a: AnnInput): AnnInput {
  return { title: a.title.trim(), body: a.body.replace(/\r\n/g, '\n').trim(), startsOn: a.startsOn, endsOn: a.endsOn };
}

export function validate(raw: AnnInput): FieldErrors {
  const a = normalize(raw);
  const e: FieldErrors = {};
  if (a.title === '' || charCount(a.title) > TITLE_MAX) e.title = `Nadpis je povinný (max ${TITLE_MAX} znakov).`;
  if (a.body === '' || charCount(a.body) > BODY_MAX) e.body = `Text je povinný (max ${BODY_MAX} znakov).`;
  if (!isValidDate(a.startsOn)) e.startsOn = 'Zadajte platný dátum začiatku.';
  if (!isValidDate(a.endsOn)) e.endsOn = 'Zadajte platný dátum konca.';
  else if (!e.startsOn && a.endsOn < a.startsOn) e.endsOn = 'Dátum „do“ musí byť rovnaký alebo neskorší ako „od“.';
  return e;
}
