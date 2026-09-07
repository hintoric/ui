'use client';
import * as React from 'react';
import { Button } from '../Button';
import { ToggleButtonGroup } from '../ToggleButtonGroup';
import { useColorScheme } from '../../theme/ColorSchemeProvider';
import type { ColorSchemeMode } from '../../theme/ColorSchemeProvider';
import {
  COLOR_SCHEME_ICONS,
  COLOR_SCHEME_MODES,
  ICON_SIZE_CLASS,
  resolveColorSchemeLabels,
} from '../../internal/colorScheme';
import type { ColorSchemeToggleGroupProps } from './types';

/**
 * All three states side by side, each one click away — the form for a settings
 * page rather than a header corner.
 *
 * `ToggleButtonGroup` deliberately implements only Joy's multi-select array
 * mode (see its own scope note), so this adapts it to single selection: the
 * value is a one-element array, and the handler takes the newly-added entry
 * out of what comes back. Clicking the active segment hands back an empty
 * array, which is ignored — "no colour scheme" is not a state a user can be in.
 *
 * Adding a real exclusive mode to `ToggleButtonGroup` would be the tidier fix
 * and is deliberately out of scope: that component's look is compared against
 * Joy, and changing it belongs in its own piece of work.
 */
export function ColorSchemeToggleGroup({
  variant = 'outlined',
  color = 'neutral',
  size = 'sm',
  labels,
  icons = true,
  ...props
}: ColorSchemeToggleGroupProps) {
  const { mode, setMode } = useColorScheme();
  const resolved = resolveColorSchemeLabels(labels);

  return (
    <ToggleButtonGroup
      variant={variant}
      color={color}
      value={[mode]}
      onChange={(_event, next) => {
        const picked = (next as ColorSchemeMode[]).find((entry) => entry !== mode);
        if (picked) setMode(picked);
      }}
      {...props}
    >
      {/* A flat array, never a fragment: ToggleButtonGroup runs
          React.Children.map and cloneElement over its children, and a fragment
          would receive the clones instead of the segments. */}
      {COLOR_SCHEME_MODES.map((entry) => {
        const Icon = COLOR_SCHEME_ICONS[entry];
        return (
          <Button
            key={entry}
            value={entry}
            variant={variant}
            color={color}
            size={size}
            startDecorator={icons ? <Icon className={`${ICON_SIZE_CLASS.sm} shrink-0`} /> : undefined}
          >
            {resolved[entry]}
          </Button>
        );
      })}
    </ToggleButtonGroup>
  );
}
