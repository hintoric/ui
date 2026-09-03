import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToggleButtonGroup } from './ToggleButtonGroup';
import { Button } from '../Button';

describe('ToggleButtonGroup', () => {
  it('renders its Button children', () => {
    render(
      <ToggleButtonGroup>
        <Button value="a">A</Button>
        <Button value="b">B</Button>
      </ToggleButtonGroup>,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('marks a clicked button selected and calls onChange with the new value array', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ToggleButtonGroup onChange={onChange}>
        <Button value="a">A</Button>
        <Button value="b">B</Button>
      </ToggleButtonGroup>,
    );
    await user.click(screen.getByText('A'));
    expect(onChange).toHaveBeenCalledWith(expect.anything(), ['a']);
  });

  it('deselects a button on second click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ToggleButtonGroup defaultValue={['a']} onChange={onChange}>
        <Button value="a">A</Button>
      </ToggleButtonGroup>,
    );
    await user.click(screen.getByText('A'));
    expect(onChange).toHaveBeenCalledWith(expect.anything(), []);
  });

  it('respects a controlled value, applying the persistent active background to the selected button', () => {
    render(
      <ToggleButtonGroup value={['a']} variant="outlined" color="neutral">
        <Button value="a">A</Button>
        <Button value="b">B</Button>
      </ToggleButtonGroup>,
    );
    expect(screen.getByText('A')).toHaveClass('bg-neutral-outlined-active-bg');
    expect(screen.getByText('B')).not.toHaveClass('bg-neutral-outlined-active-bg');
  });
});
