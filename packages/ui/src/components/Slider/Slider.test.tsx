import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Slider } from './Slider';

describe('Slider', () => {
  it('renders a single thumb by default', () => {
    render(<Slider defaultValue={30} />);
    expect(screen.getAllByRole('slider')).toHaveLength(1);
  });

  it('renders one thumb per value for a range slider', () => {
    render(<Slider defaultValue={[20, 60]} />);
    expect(screen.getAllByRole('slider')).toHaveLength(2);
  });

  it('reflects the value on the thumb', () => {
    render(<Slider defaultValue={40} min={0} max={100} />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '40');
  });

  it('increases the value with ArrowRight and calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider defaultValue={40} step={1} onChange={onChange} />);
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith(41, expect.anything());
  });

  it('is disabled when disabled prop is set', () => {
    render(<Slider defaultValue={40} disabled />);
    expect(screen.getByRole('slider')).toBeDisabled();
  });

  it('defaults to solid/primary/md', () => {
    render(<Slider defaultValue={40} data-testid="control" />);
    expect(screen.getByTestId('control')).toHaveClass('h-[42px]');
  });
});
