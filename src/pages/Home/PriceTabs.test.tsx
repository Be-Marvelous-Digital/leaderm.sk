import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect } from 'vitest';
import { PriceTabs } from './PriceTabs';

it('switches tabs with arrow keys and keeps roving tabIndex', async () => {
  render(<PriceTabs />);
  const [a, b] = screen.getAllByRole('tab');
  expect(a).toHaveAttribute('aria-selected', 'true');
  expect(b).toHaveAttribute('tabindex', '-1');
  expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', a.id);

  a.focus();
  await userEvent.keyboard('{ArrowRight}');
  expect(b).toHaveAttribute('aria-selected', 'true');
  expect(b).toHaveFocus();
  expect(b).toHaveAttribute('tabindex', '0');
  expect(a).toHaveAttribute('tabindex', '-1');
  expect(screen.getByRole('tabpanel')).toHaveAttribute('id', b.getAttribute('aria-controls'));

  await userEvent.keyboard('{ArrowLeft}');
  expect(a).toHaveAttribute('aria-selected', 'true');
  expect(a).toHaveFocus();

  await userEvent.keyboard('{ArrowLeft}');
  expect(b).toHaveAttribute('aria-selected', 'true');
});
