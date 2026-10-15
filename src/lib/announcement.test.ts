import { describe, it, expect, beforeEach } from 'vitest';
import { DISMISS_TTL, dismissKey, isDismissed, markDismissed, formatRange } from './announcement';

const a = { id: 3, title: 'Dovolenka', body: 'x', startsAt: '2026-10-12 00:00:00', endsAt: '2026-10-23 23:59:59', version: 'abc' };

describe('announcement', () => {
  beforeEach(() => localStorage.clear());
  it('key combines id and version', () => expect(dismissKey(a)).toBe('3:abc'));
  it('not dismissed by default', () => expect(isDismissed(a)).toBe(false));
  it('dismiss persists', () => { markDismissed(a); expect(isDismissed(a)).toBe(true); });
  it('dismiss expires after 15 minutes', () => {
    markDismissed(a, 1000);
    expect(isDismissed(a, 1000 + DISMISS_TTL - 1)).toBe(true);
    expect(isDismissed(a, 1000 + DISMISS_TTL)).toBe(false);
  });
  it('legacy plain value counts as not dismissed', () => { localStorage.setItem('leaderm-ann-dismissed', '3:abc'); expect(isDismissed(a)).toBe(false); });
  it('new version shows again', () => { markDismissed(a); expect(isDismissed({ ...a, version: 'def' })).toBe(false); });
  it('storage failure is safe', () => {
    const orig = Storage.prototype.getItem;
    Storage.prototype.getItem = () => { throw new Error('blocked'); };
    expect(isDismissed(a)).toBe(false);
    Storage.prototype.getItem = orig;
  });
  it('formats range', () => expect(formatRange(a)).toBe('12. 10. – 23. 10. 2026'));
  it('formats single day', () => expect(formatRange({ ...a, endsAt: '2026-10-12 23:59:59' })).toBe('12. 10. 2026'));
  it('formats across years', () => expect(formatRange({ startsAt: '2026-12-28 00:00:00', endsAt: '2027-01-02 23:59:59' })).toBe('28. 12. 2026 – 2. 1. 2027'));
});
