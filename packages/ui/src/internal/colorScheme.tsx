import type * as React from 'react';
import type { ColorSchemeMode } from '../theme/ColorSchemeProvider';
import { DarkModeIcon } from './svg-icons/DarkModeIcon';
import { LightModeIcon } from './svg-icons/LightModeIcon';
import { SettingsBrightnessIcon } from './svg-icons/SettingsBrightnessIcon';

/*
 * One place decides the order of the three modes. Six components render them —
 * as a cycle, as a menu, as segments, as options — and a disagreement between
 * any two of them would look like a bug to the user, not like variety.
 *
 * `system` comes first because it is the default: the list reads "follow the
 * system, or override it one way or the other".
 */
export const COLOR_SCHEME_MODES = ['system', 'light', 'dark'] as const;

/** Wraps at the end, so a cycling control always has a next state. */
export function nextColorSchemeMode(mode: ColorSchemeMode): ColorSchemeMode {
  const index = COLOR_SCHEME_MODES.indexOf(mode as (typeof COLOR_SCHEME_MODES)[number]);
  return COLOR_SCHEME_MODES[(index + 1) % COLOR_SCHEME_MODES.length];
}

export interface ColorSchemeLabels {
  system?: React.ReactNode;
  light?: React.ReactNode;
  dark?: React.ReactNode;
}

const DEFAULT_LABELS: Record<ColorSchemeMode, React.ReactNode> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

/*
 * English defaults, partially overridable. The library ships no translations
 * and knows no i18n library — the same line LocaleSwitcher draws. A caller who
 * translates one label should not have to restate the other two.
 */
export function resolveColorSchemeLabels(
  labels?: ColorSchemeLabels,
): Record<ColorSchemeMode, React.ReactNode> {
  return {
    system: labels?.system ?? DEFAULT_LABELS.system,
    light: labels?.light ?? DEFAULT_LABELS.light,
    dark: labels?.dark ?? DEFAULT_LABELS.dark,
  };
}

export const COLOR_SCHEME_ICONS: Record<
  ColorSchemeMode,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  system: SettingsBrightnessIcon,
  light: LightModeIcon,
  dark: DarkModeIcon,
};

/*
 * The icons are `1em`-based, so without an explicit size they inherit the
 * surrounding font size and come out visibly small inside a control. Locked
 * with `size-*` so width and height cannot drift apart.
 */
export const ICON_SIZE_CLASS = {
  sm: 'size-5',
  md: 'size-6',
  lg: 'size-7',
} as const;
