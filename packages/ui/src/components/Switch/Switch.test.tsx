import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { Switch } from './Switch';
import { runFieldMatrix, MATRIX_LABEL } from '../../test/fieldMatrix';

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

describe('Switch field matrix', () => {
  runFieldMatrix({
    name: 'push',
    render: (props) => <Switch {...props} />,
    schema: z.object({ push: z.literal(true, { message: 'muss an sein' }) }),
    message: 'muss an sein',
    validDefaults: { push: true },
    invalidDefaults: { push: false },
    expectInitialValue: () => {
      expect(screen.getByRole('switch', { name: MATRIX_LABEL })).toBeChecked();
    },
    edit: async () => {
      await userEvent.click(screen.getByRole('switch', { name: MATRIX_LABEL }));
    },
    expectedAfterEdit: { push: false },
    control: () => screen.getByRole('switch', { name: MATRIX_LABEL }),
    // Switch wraps itself in a decorator span, so that span is the root when
    // there is no label and no helper text.
    standaloneRootTag: 'SPAN',
    renderStandalone: () => <Switch name="push" aria-label="push" />,
  });
});
