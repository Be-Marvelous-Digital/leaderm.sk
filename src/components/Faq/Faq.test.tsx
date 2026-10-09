import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect } from 'vitest';
import { Faq } from './Faq';

it('toggles aria-expanded', async () => {
  render(<Faq items={[['Otázka 1', 'Odpoveď 1'], ['Otázka 2', 'Odpoveď 2']]} />);
  const b = screen.getByRole('button', { name: /Otázka 1/ });
  expect(b).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(b);
  expect(b).toHaveAttribute('aria-expanded', 'true');
  await userEvent.click(screen.getByRole('button', { name: /Otázka 2/ }));
  expect(b).toHaveAttribute('aria-expanded', 'false');
});
