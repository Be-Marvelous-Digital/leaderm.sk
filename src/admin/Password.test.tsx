import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Password } from './Password';
import { api } from './api';

const fill = async (cur: string, next: string, rep: string) => {
  if (cur) await userEvent.type(screen.getByLabelText('Súčasné heslo'), cur);
  if (next) await userEvent.type(screen.getByLabelText('Nové heslo'), next);
  if (rep) await userEvent.type(screen.getByLabelText('Nové heslo znova'), rep);
  await userEvent.click(screen.getByRole('button', { name: 'Zmeniť heslo' }));
};

describe('Password', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('rejects mismatch without calling api', async () => {
    const spy = vi.spyOn(api, 'changePassword');
    render(<Password onDone={vi.fn()} onCancel={vi.fn()} onAuthLost={vi.fn()} />);
    await fill('stareheslo1234', 'noveheslo12345', 'ineheslo123456');
    expect(screen.getByRole('alert')).toHaveTextContent('nezhodujú');
    expect(spy).not.toHaveBeenCalled();
  });

  it('rejects short password', async () => {
    render(<Password onDone={vi.fn()} onCancel={vi.fn()} onAuthLost={vi.fn()} />);
    await fill('stareheslo1234', 'kratke', 'kratke');
    expect(screen.getByRole('alert')).toHaveTextContent('aspoň 12');
  });

  it('submits valid change', async () => {
    const spy = vi.spyOn(api, 'changePassword').mockResolvedValue({ ok: true, csrf: 'x' });
    const onDone = vi.fn();
    render(<Password onDone={onDone} onCancel={vi.fn()} onAuthLost={vi.fn()} />);
    await fill('stareheslo1234', 'noveheslo12345', 'noveheslo12345');
    expect(spy).toHaveBeenCalledWith('stareheslo1234', 'noveheslo12345');
    expect(onDone).toHaveBeenCalledWith('Heslo bolo zmenené.');
  });
});
