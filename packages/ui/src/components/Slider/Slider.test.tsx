import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Slider } from './Slider';

import { z } from 'zod';
import { runFieldMatrix } from '../../test/fieldMatrix';

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

describe('Slider field matrix', () => {
  runFieldMatrix({
    name: 'menge',
    render: (props) => <Slider {...props} />,
    schema: z.object({ menge: z.number().min(30, 'zu klein') }),
    message: 'zu klein',
    validDefaults: { menge: 20 },
    invalidDefaults: { menge: 5 },
    expectInitialValue: () => {
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '20');
    },
    edit: async () => {
      screen.getByRole('slider').focus();
      await userEvent.keyboard('{ArrowRight}');
    },
    expectedAfterEdit: { menge: 21 },
    // role="slider" is Base UI's hidden range input, which focuses and carries
    // aria-describedby. aria-invalid stays on the thumb wrapper around it,
    // because Base UI only forwards some aria props inward.
    control: () => screen.getByRole('slider'),
    invalidTarget: () => screen.getByRole('slider').parentElement!,
    standaloneRootTag: 'DIV',
    renderStandalone: () => <Slider name="menge" aria-label="menge" />,
  });
});
