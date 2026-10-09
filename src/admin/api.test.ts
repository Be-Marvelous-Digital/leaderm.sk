import { describe, it, expect, beforeEach, vi } from 'vitest';
import { request, setCsrf, ApiError, AuthError, api } from './api';

const mockFetch = (status: number, body?: unknown) => {
  const fn = vi.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: async () => (body === undefined ? Promise.reject(new Error('no body')) : body),
  });
  vi.stubGlobal('fetch', fn);
  return fn;
};

describe('admin api', () => {
  beforeEach(() => { vi.unstubAllGlobals(); setCsrf('tok123'); });

  it('GET has no CSRF header and no body', async () => {
    const f = mockFetch(200, { ok: 1 });
    await request('GET', '/auth/me');
    const [url, init] = f.mock.calls[0];
    expect(url).toBe('/api/auth/me');
    expect(init.headers['X-CSRF-Token']).toBeUndefined();
    expect(init.body).toBeUndefined();
    expect(init.credentials).toBe('same-origin');
  });

  it('non-GET sends CSRF token and JSON body', async () => {
    const f = mockFetch(201, { id: 5 });
    await api.create({ title: 'A', body: 'B', startsOn: '2026-10-10', endsOn: '2026-10-11' });
    const [url, init] = f.mock.calls[0];
    expect(url).toBe('/api/admin/announcements');
    expect(init.method).toBe('POST');
    expect(init.headers['X-CSRF-Token']).toBe('tok123');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toEqual({ title: 'A', body: 'B', startsOn: '2026-10-10', endsOn: '2026-10-11' });
  });

  it('DELETE without body still sends CSRF', async () => {
    const f = mockFetch(204);
    await expect(api.remove(3)).resolves.toBeUndefined();
    expect(f.mock.calls[0][1].headers['X-CSRF-Token']).toBe('tok123');
    expect(f.mock.calls[0][0]).toBe('/api/admin/announcements/3');
  });

  it('401 throws AuthError', async () => {
    mockFetch(401, { error: 'Neprihlásený.' });
    const p = request('GET', '/auth/me');
    await expect(p).rejects.toBeInstanceOf(AuthError);
    await expect(p).rejects.toMatchObject({ status: 401, message: 'Neprihlásený.' });
  });

  it('error payload throws ApiError with message', async () => {
    mockFetch(409, { error: 'Prekrýva sa s iným oznamom.' });
    const p = request('POST', '/admin/announcements', {});
    await expect(p).rejects.toBeInstanceOf(ApiError);
    await expect(p).rejects.not.toBeInstanceOf(AuthError);
    await expect(p).rejects.toMatchObject({ status: 409, message: 'Prekrýva sa s iným oznamom.' });
  });

  it('error without JSON falls back to generic message', async () => {
    mockFetch(500);
    await expect(request('GET', '/x')).rejects.toMatchObject({ status: 500, message: 'Nastala chyba.' });
  });
});
