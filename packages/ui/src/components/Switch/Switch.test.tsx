import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from './Switch';

describe('Switch', () => {
  it('renders an unchecked switch by default', () => {
    render(<Switch aria-label="notifications" />);
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('toggles on click and calls onCheckedChange', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="notifications" onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('defaults to neutral track color when unchecked', () => {
    render(<Switch aria-label="notifications" />);
    expect(screen.getByRole('switch')).toHaveStyle({ backgroundColor: 'var(--color-neutral-solid-bg)' });
  });

  it('defaults to primary track color when checked', () => {
    render(<Switch aria-label="notifications" defaultChecked />);
    expect(screen.getByRole('switch')).toHaveStyle({ backgroundColor: 'var(--color-primary-solid-bg)' });
  });

  it('keeps an explicit color regardless of checked', () => {
    const { rerender } = render(<Switch aria-label="notifications" color="danger" />);
    expect(screen.getByRole('switch')).toHaveStyle({ backgroundColor: 'var(--color-danger-solid-bg)' });
    rerender(<Switch aria-label="notifications" color="danger" defaultChecked />);
    expect(screen.getByRole('switch')).toHaveStyle({ backgroundColor: 'var(--color-danger-solid-bg)' });
  });

  it('renders decorators', () => {
    render(<Switch startDecorator={<span data-testid="s" />} endDecorator={<span data-testid="e" />} />);
    expect(screen.getByTestId('s')).toBeInTheDocument();
    expect(screen.getByTestId('e')).toBeInTheDocument();
  });

  it('sizes the track per the size prop', () => {
    render(<Switch aria-label="notifications" size="lg" />);
    expect(screen.getByRole('switch')).toHaveStyle({ width: '40px', height: '24px' });
  });
});
