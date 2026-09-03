import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Radio } from './Radio';
import { RadioGroup } from '../RadioGroup';

describe('Radio', () => {
  it('renders an unchecked radio standalone', () => {
    render(<Radio aria-label="option" />);
    expect(screen.getByRole('radio')).not.toBeChecked();
  });

  it('defaults to outlined/neutral when unchecked', () => {
    render(<Radio aria-label="option" />);
    expect(screen.getByRole('radio')).toHaveClass('border-neutral-outlined-border');
  });

  it('defaults to outlined/primary when checked (variant stays fixed)', () => {
    render(<Radio aria-label="option" defaultChecked />);
    const radio = screen.getByRole('radio');
    expect(radio).toHaveClass('border-primary-outlined-border');
  });

  it('toggles on click standalone and calls onCheckedChange', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Radio aria-label="option" onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole('radio'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('radio')).toBeChecked();
  });

  it('keeps an explicit variant/color for both checked and unchecked', () => {
    const { rerender } = render(<Radio aria-label="option" variant="soft" color="danger" />);
    expect(screen.getByRole('radio')).toHaveClass('bg-danger-soft-bg');
    rerender(<Radio aria-label="option" variant="soft" color="danger" defaultChecked />);
    expect(screen.getByRole('radio')).toHaveClass('bg-danger-soft-bg');
  });

  it('renders label text', () => {
    render(<Radio label="Option A" />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  it('works within a RadioGroup, making options mutually exclusive', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup defaultValue="a">
        <Radio aria-label="a" value="a" />
        <Radio aria-label="b" value="b" />
      </RadioGroup>,
    );
    const [a, b] = screen.getAllByRole('radio');
    expect(a).toBeChecked();
    expect(b).not.toBeChecked();
    await user.click(b);
    expect(a).not.toBeChecked();
    expect(b).toBeChecked();
  });
});
