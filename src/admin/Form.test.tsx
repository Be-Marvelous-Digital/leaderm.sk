import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Form } from './Form';
import { api, ApiError } from './api';

vi.mock('./api', async (orig) => {
  const mod = await orig<typeof import('./api')>();
  return { ...mod, api: { ...mod.api, create: vi.fn(), update: vi.fn() } };
});

const setup = () => {
  const onSaved = vi.fn();
  render(<Form onSaved={onSaved} onCancel={() => {}} onAuthLost={() => {}} />);
  return { onSaved };
};
const setDates = (from: string, to: string) => {
  fireEvent.change(screen.getByLabelText('Dátum od'), { target: { value: from } });
  fireEvent.change(screen.getByLabelText('Dátum do'), { target: { value: to } });
};

describe('Form', () => {
  beforeEach(() => { vi.mocked(api.create).mockReset(); });
  afterEach(cleanup);

  it('empty title shows message and does not call create', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Text oznamu'), 'Text');
    setDates('2030-01-10', '2030-01-12');
    await userEvent.click(screen.getByRole('button', { name: 'Uložiť oznam' }));
    expect(screen.getByText(/Nadpis je povinný/)).toBeInTheDocument();
    expect(screen.getByLabelText('Nadpis')).toHaveAttribute('aria-invalid', 'true');
    expect(api.create).not.toHaveBeenCalled();
  });

  it('end before start shows message', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Nadpis'), 'Dovolenka');
    await userEvent.type(screen.getByLabelText('Text oznamu'), 'Text');
    setDates('2030-01-10', '2030-01-05');
    await userEvent.click(screen.getByRole('button', { name: 'Uložiť oznam' }));
    expect(screen.getByText(/musí byť rovnaký alebo neskorší/)).toBeInTheDocument();
    expect(api.create).not.toHaveBeenCalled();
  });

  it('valid input calls api.create', async () => {
    vi.mocked(api.create).mockResolvedValue({ id: 1, title: 'Dovolenka', body: 'Text', startsAt: '', endsAt: '', version: 'x' });
    const { onSaved } = setup();
    await userEvent.type(screen.getByLabelText('Nadpis'), '  Dovolenka ');
    await userEvent.type(screen.getByLabelText('Text oznamu'), 'Ambulancia bude zatvorená.');
    setDates('2030-01-10', '2030-01-12');
    await userEvent.click(screen.getByRole('button', { name: 'Uložiť oznam' }));
    expect(api.create).toHaveBeenCalledWith({ title: 'Dovolenka', body: 'Ambulancia bude zatvorená.', startsOn: '2030-01-10', endsOn: '2030-01-12' });
    expect(onSaved).toHaveBeenCalled();
  });

  it('server error is shown in alert', async () => {
    vi.mocked(api.create).mockRejectedValue(new ApiError(409, 'Prekrýva sa s iným oznamom.'));
    setup();
    await userEvent.type(screen.getByLabelText('Nadpis'), 'Dovolenka');
    await userEvent.type(screen.getByLabelText('Text oznamu'), 'Text');
    setDates('2030-01-10', '2030-01-12');
    await userEvent.click(screen.getByRole('button', { name: 'Uložiť oznam' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Prekrýva sa s iným oznamom.');
  });

  it('live preview reflects title', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Nadpis'), 'Zmena hodín');
    const preview = screen.getByRole('region', { name: 'Náhľad oznamu' });
    expect(preview).toHaveTextContent('Zmena hodín');
  });
});
