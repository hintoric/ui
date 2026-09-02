import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stack } from './Stack';

describe('Stack', () => {
  it('renders a div with column direction and no gap by default', () => {
    render(<Stack data-testid="stack">content</Stack>);
    const el = screen.getByTestId('stack');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveClass('flex', 'flex-col', 'gap-0');
  });

  it('applies row direction', () => {
    render(<Stack direction="row" data-testid="stack" />);
    expect(screen.getByTestId('stack')).toHaveClass('flex-row');
  });

  it('maps spacing to the matching gap utility (spacing unit = 8px)', () => {
    render(<Stack spacing={2} data-testid="stack" />);
    expect(screen.getByTestId('stack')).toHaveClass('gap-4');
  });

  it('renders the element passed via the component prop', () => {
    render(<Stack component="section" data-testid="stack" />);
    expect(screen.getByTestId('stack').tagName).toBe('SECTION');
  });
});
