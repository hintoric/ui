'use client';
import * as React from 'react';
import { IconButton } from '../IconButton';
import { useColorScheme } from '../../theme/ColorSchemeProvider';
import { COLOR_SCHEME_ICONS, ICON_SIZE_CLASS, nextColorSchemeMode } from '../../internal/colorScheme';
import type { ColorSchemeToggleProps } from './types';

/**
 * The most compact of the six forms: one square button that cycles
 * `system → light → dark`. The icon shows the **chosen** mode, not the
 * resolved one — a sun while following a light OS would be indistinguishable
 * from a sun while pinned to light.
 *
 * The cost is discoverability: three unlabelled stops have to be clicked
 * through to be found. Where that matters, use `ColorSchemeMenu`, whose stops
 * are named.
 *
 * Defaults to `outlined`/`md` rather than IconButton's own `plain`: a control
 * that renders as a bare glyph does not read as a control — the same
 * correction LocaleSwitcher made after shipping `plain`.
 */
export const ColorSchemeToggle = React.forwardRef<HTMLButtonElement, ColorSchemeToggleProps>(
  function ColorSchemeToggle(
    { variant = 'outlined', color = 'neutral', size = 'md', onClick, ...props },
    ref,
  ) {
    const { mode, setMode } = useColorScheme();
    const next = nextColorSchemeMode(mode);
    const Icon = COLOR_SCHEME_ICONS[mode];

    return (
      <IconButton
        ref={ref}
        variant={variant}
        color={color}
        size={size}
        aria-label={`Switch to ${next} mode`}
        {...props}
        onClick={(event) => {
          // The caller's handler runs too rather than replacing ours —
          // spreading `props` over `onClick` would silently break the toggle.
          onClick?.(event);
          setMode(next);
        }}
      >
        <Icon className={ICON_SIZE_CLASS[size]} />
      </IconButton>
    );
  },
);
