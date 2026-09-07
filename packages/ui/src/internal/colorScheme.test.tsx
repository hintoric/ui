import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import {
  COLOR_SCHEME_ICONS,
  COLOR_SCHEME_MODES,
  nextColorSchemeMode,
  resolveColorSchemeLabels,
} from './colorScheme';

describe('colorScheme shared core', () => {
  it('orders the modes system, light, dark', () => {
    expect(COLOR_SCHEME_MODES).toEqual(['system', 'light', 'dark']);
  });

  it('cycles through every mode and wraps around', () => {
    expect(nextColorSchemeMode('system')).toBe('light');
    expect(nextColorSchemeMode('light')).toBe('dark');
    expect(nextColorSchemeMode('dark')).toBe('system');
  });

  it('defaults every label in English', () => {
    expect(resolveColorSchemeLabels()).toEqual({ system: 'System', light: 'Light', dark: 'Dark' });
  });

  it('overrides only the labels it is given', () => {
    expect(resolveColorSchemeLabels({ dark: 'Dunkel' })).toEqual({
      system: 'System',
      light: 'Light',
      dark: 'Dunkel',
    });
  });

  it('has one icon per mode, and each renders a path', () => {
    for (const mode of COLOR_SCHEME_MODES) {
      const Icon = COLOR_SCHEME_ICONS[mode];
      const { container, unmount } = render(<Icon />);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      // aria-hidden because the control around it carries the accessible name.
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg?.querySelector('path')?.getAttribute('d')).toBeTruthy();
      unmount();
    }
  });

  it('gives each mode a distinct icon', () => {
    const icons = new Set(COLOR_SCHEME_MODES.map((mode) => COLOR_SCHEME_ICONS[mode]));
    expect(icons.size).toBe(3);
  });
});
