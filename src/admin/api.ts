import type { Announcement } from '../lib/announcement';

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
export class AuthError extends ApiError {}

let csrf = '';
export const setCsrf = (t: string) => { csrf = t; };

export async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET') headers['X-CSRF-Token'] = csrf;
  const r = await fetch(`/api${path}`, {
    method,
    headers,
    credentials: 'same-origin',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (r.status === 204) return undefined as T;
  const data = (await r.json().catch(() => ({}))) as { error?: string };
  if (r.status === 401) throw new AuthError(401, data.error ?? 'Prihláste sa.');
  if (!r.ok) throw new ApiError(r.status, data.error ?? 'Nastala chyba.');
  return data as T;
}

export type Me = { user: { name: string; email: string }; csrf: string };
export type AnnInput = { title: string; body: string; startsOn: string; endsOn: string };

export const api = {
  me: () => request<Me>('GET', '/auth/me'),
  login: (email: string, password: string) => request<Me>('POST', '/auth/login', { email, password }),
  logout: () => request<void>('POST', '/auth/logout'),
  changePassword: (current: string, next: string) => request<{ ok: true; csrf: string }>('POST', '/auth/password', { current, new: next }),
  list: () => request<Announcement[]>('GET', '/admin/announcements'),
  create: (a: AnnInput) => request<Announcement>('POST', '/admin/announcements', a),
  update: (id: number, a: AnnInput) => request<Announcement>('PUT', `/admin/announcements/${id}`, a),
  end: (id: number) => request<{ ok: true }>('POST', `/admin/announcements/${id}/end`),
  remove: (id: number) => request<void>('DELETE', `/admin/announcements/${id}`),
};
