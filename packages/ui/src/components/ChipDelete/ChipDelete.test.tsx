import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChipDelete } from './ChipDelete';

describe('ChipDelete', () => {
  it('renders a button with a default cancel icon', () => {
    render(<ChipDelete aria-label="delete" />);
    const button = screen.getByRole('button', { name: 'delete' });
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onDelete on click', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<ChipDelete aria-label="delete" onDelete={onDelete} />);
    await user.click(screen.getByRole('button'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete on Backspace/Delete key', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<ChipDelete aria-label="delete" onDelete={onDelete} />);
    screen.getByRole('button').focus();
    await user.keyboard('{Backspace}');
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('defaults to plain/neutral', () => {
    render(<ChipDelete aria-label="delete" />);
    expect(screen.getByRole('button')).toHaveClass('text-neutral-plain-color');
  });
});
