import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AnnouncementHost } from './AnnouncementHost';

const ann = { id: 1, title: 'Dovolenka', body: 'Ambulancia bude zatvorená.', startsAt: '2026-10-12 00:00:00', endsAt: '2026-10-23 23:59:59', version: 'v1' };
const mockFetch = (status: number, body?: unknown) =>
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status, json: async () => body }));

describe('AnnouncementHost', () => {
  beforeEach(() => { localStorage.clear(); vi.unstubAllGlobals(); });
  afterEach(cleanup);

  it('renders nothing without announcement', async () => {
    mockFetch(204);
    const { container } = render(<AnnouncementHost />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('shows dialog, then bar after closing, reopens from bar', async () => {
    mockFetch(200, ann);
    render(<AnnouncementHost />);
    const dialog = await screen.findByRole('dialog', { name: 'Dovolenka' });
    expect(dialog).toHaveTextContent('12. 10. – 23. 10. 2026');
    await userEvent.click(screen.getByRole('button', { name: 'Rozumiem' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    const bar = screen.getByRole('region', { name: 'Oznam' });
    expect(bar).toHaveTextContent('Dovolenka');
    await userEvent.click(screen.getByRole('button', { name: /zobraziť celý oznam/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('Escape closes dialog', async () => {
    mockFetch(200, ann);
    render(<AnnouncementHost />);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('dismissed version goes straight to bar', async () => {
    localStorage.setItem('leaderm-ann-dismissed', '1:v1');
    mockFetch(200, ann);
    render(<AnnouncementHost />);
    await screen.findByRole('region', { name: 'Oznam' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
