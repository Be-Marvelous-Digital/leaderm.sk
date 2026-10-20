export type Announcement = { id: number; title: string; body: string; startsAt: string; endsAt: string; showsFrom?: string; version: string };

const KEY = 'leaderm-ann-dismissed';
export const DISMISS_TTL = 15 * 60 * 1000;

export const dismissKey = (a: Pick<Announcement, 'id' | 'version'>) => `${a.id}:${a.version}`;

export function isDismissed(a: Pick<Announcement, 'id' | 'version'>, now = Date.now()): boolean {
  try {
    const { key, at } = JSON.parse(localStorage.getItem(KEY) ?? 'null') ?? {};
    return key === dismissKey(a) && typeof at === 'number' && now - at < DISMISS_TTL;
  } catch {
    return false;
  }
}

export function markDismissed(a: Pick<Announcement, 'id' | 'version'>, now = Date.now()): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ key: dismissKey(a), at: now }));
  } catch {
    // storage unavailable (private mode)
  }
}

const parts = (s: string) => s.slice(0, 10).split('-').map(Number) as [number, number, number];

export function formatRange(a: Pick<Announcement, 'startsAt' | 'endsAt'>): string {
  const [y1, m1, d1] = parts(a.startsAt);
  const [y2, m2, d2] = parts(a.endsAt);
  if (y1 === y2 && m1 === m2 && d1 === d2) return `${d1}. ${m1}. ${y1}`;
  return y1 === y2 ? `${d1}. ${m1}. – ${d2}. ${m2}. ${y2}` : `${d1}. ${m1}. ${y1} – ${d2}. ${m2}. ${y2}`;
}

export async function fetchActive(signal?: AbortSignal): Promise<Announcement | null> {
  const r = await fetch('/api/announcement', { signal, headers: { Accept: 'application/json' } });
  if (r.status !== 200) return null;
  return (await r.json()) as Announcement;
}
