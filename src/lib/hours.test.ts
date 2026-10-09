import { describe, it, expect } from 'vitest';
import { status } from './hours';

const at = (iso: string) => new Date(iso);

describe('status', () => {
  it('open during hours', () => expect(status(at('2026-10-12T09:00:00'))).toMatchObject({ kind: 'open', label: 'Otvorené', time: 'do 14:30' }));
  it('before opening today', () => expect(status(at('2026-10-12T06:00:00'))).toMatchObject({ kind: 'today', label: 'Dnes', time: 'od 7:00' }));
  it('after hours Monday is tomorrow', () => expect(status(at('2026-10-12T15:00:00'))).toMatchObject({ kind: 'later', label: 'Zajtra', time: 'od 7:00' }));
  it('Thursday evening is Pondelok', () => expect(status(at('2026-10-15T18:00:00'))).toMatchObject({ label: 'Pondelok' }));
  it('Sunday is tomorrow', () => expect(status(at('2026-10-11T10:00:00'))).toMatchObject({ label: 'Zajtra' }));
});
