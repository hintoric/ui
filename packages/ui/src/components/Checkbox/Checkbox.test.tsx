import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders an unchecked checkbox by default', () => {
    render(<Checkbox aria-label="terms" />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('defaults to outlined/neutral when unchecked and no variant/color given', () => {
    render(<Checkbox aria-label="terms" />);
    expect(screen.getByRole('checkbox')).toHaveClass('border-neutral-outlined-border');
  });

  it('defaults to solid/primary when checked and no variant/color given', () => {
    render(<Checkbox aria-label="terms" defaultChecked />);
    expect(screen.getByRole('checkbox')).toHaveClass('bg-primary-solid-bg');
  });

  it('keeps an explicit variant/color for both checked and unchecked', () => {
    const { rerender } = render(<Checkbox aria-label="terms" variant="soft" color="danger" />);
    expect(screen.getByRole('checkbox')).toHaveClass('bg-danger-soft-bg');
    rerender(<Checkbox aria-label="terms" variant="soft" color="danger" defaultChecked />);
    expect(screen.getByRole('checkbox')).toHaveClass('bg-danger-soft-bg');
  });

  it('toggles checked state on click and calls onCheckedChange', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="terms" onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('renders label text and toggles via clicking it', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
    await user.click(screen.getByText('Accept terms'));
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('renders the indeterminate icon distinctly from checked', () => {
    render(<Checkbox aria-label="terms" indeterminate />);
    expect(screen.getByRole('checkbox').querySelector('svg')).toBeInTheDocument();
  });

  it('applies size classes to the box', () => {
    render(<Checkbox aria-label="terms" size="lg" />);
    expect(screen.getByRole('checkbox')).toHaveClass('size-6');
  });

  it('respects disabled', () => {
    render(<Checkbox aria-label="terms" disabled />);
    const box = screen.getByRole('checkbox');
    expect(box).toHaveAttribute('aria-disabled', 'true');
    expect(box).toHaveAttribute('data-disabled');
  });
});
