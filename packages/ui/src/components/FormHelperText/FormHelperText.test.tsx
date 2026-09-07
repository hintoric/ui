import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormHelperText } from './FormHelperText';
import { FormControl } from '../FormControl';

describe('FormHelperText', () => {
  it('renders its children with tertiary text color', () => {
    render(<FormHelperText>We never share your email.</FormHelperText>);
    expect(screen.getByText('We never share your email.')).toHaveClass('text-ink-tertiary');
  });

  it('uses the danger colour inside a FormControl in error state', () => {
    // Joy sets --FormHelperText-color to palette.danger[500] when its
    // FormControl is in error state. Confirmed against @mui/joy's
    // FormControl.js source.
    render(
      <FormControl error>
        <FormHelperText>kaputt</FormHelperText>
      </FormControl>,
    );
    expect(screen.getByText('kaputt')).toHaveClass('text-danger-500');
  });

  it('keeps the tertiary colour when there is no error', () => {
    render(
      <FormControl>
        <FormHelperText>hinweis</FormHelperText>
      </FormControl>,
    );
    expect(screen.getByText('hinweis')).toHaveClass('text-ink-tertiary');
  });

  it('is muted inside a disabled FormControl', () => {
    // Joy uses theme.variants.plainDisabled[neutral].color, which resolves to
    // palette-neutral-400 — the same value as our
    // --color-neutral-plain-disabled-color.
    render(
      <FormControl disabled>
        <FormHelperText>gesperrt</FormHelperText>
      </FormControl>,
    );
    expect(screen.getByText('gesperrt')).toHaveClass('text-neutral-plain-disabled-color');
  });
});
