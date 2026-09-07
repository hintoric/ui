'use client';
import * as React from 'react';
import { Switch } from '../Switch';
import { useColorScheme } from '../../theme/ColorSchemeProvider';
import { ICON_SIZE_CLASS } from '../../internal/colorScheme';
import { DarkModeIcon } from '../../internal/svg-icons/DarkModeIcon';
import { LightModeIcon } from '../../internal/svg-icons/LightModeIcon';
import type { ColorSchemeSwitchProps } from './types';

/*
 * `text-ink-icon` is not decoration. Switch's wrapper sets no text colour, so
 * without it the decorators inherit the user agent's black and are invisible
 * on a dark background — the scheme-difference assertion in this component's
 * visual test is what caught it. ink-icon is the scheme-aware token for
 * exactly this (Joy's palette.text.icon): neutral-500 in light, neutral-400 in
 * dark.
 */
const DECORATOR_CLASS = `${ICON_SIZE_CLASS.sm} shrink-0 text-ink-icon`;

/**
 * The two-position form, for a settings row reading "Dark mode: [off]".
 *
 * It cannot represent `system`, and that is the shape rather than a gap: a
 * switch has two positions. The behaviour at the third state is decided rather
 * than accidental —
 *
 * - `checked` mirrors `resolvedMode`, so in `system` the switch shows what is
 *   actually on screen.
 * - Toggling writes a fixed mode and leaves `system` for good. The user made a
 *   decision; honouring it and then quietly continuing to follow the OS would
 *   be the more surprising behaviour.
 * - There is no hidden way back (no long press, no double click). Callers who
 *   need `system` reachable use one of the three-state forms.
 */
export function ColorSchemeSwitch({
  color,
  size = 'md',
  icons = true,
  ...props
}: ColorSchemeSwitchProps) {
  const { resolvedMode, setMode } = useColorScheme();
  const isDark = resolvedMode === 'dark';

  return (
    <Switch
      color={color}
      size={size}
      checked={isDark}
      onCheckedChange={(next) => setMode(next ? 'dark' : 'light')}
      startDecorator={icons ? <LightModeIcon className={DECORATOR_CLASS} /> : undefined}
      endDecorator={icons ? <DarkModeIcon className={DECORATOR_CLASS} /> : undefined}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      {...props}
    />
  );
}
