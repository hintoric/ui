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

  it('respects a controlled value, marking only the selected button aria-pressed', () => {
    render(
      <ToggleButtonGroup value={['a']} variant="outlined" color="neutral">
        <Button value="a">A</Button>
        <Button value="b">B</Button>
      </ToggleButtonGroup>,
    );
    expect(screen.getByText('A')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('B')).toHaveAttribute('aria-pressed', 'false');
  });

  it("hands its variant/color/size down to buttons that don't set their own, like Joy", () => {
    render(
      <ToggleButtonGroup variant="soft" color="danger" size="sm">
        <Button value="a">A</Button>
        <Button value="b" variant="solid">
          B
        </Button>
      </ToggleButtonGroup>,
    );
    expect(screen.getByText('A')).toHaveClass('bg-danger-soft-bg', 'min-h-8');
    expect(screen.getByText('B')).toHaveClass('bg-danger-solid-bg');
  });
});
