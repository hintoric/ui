'use client';
import * as React from 'react';
import { Select } from '../Select';
import { Option } from '../Option';
import { useColorScheme } from '../../theme/ColorSchemeProvider';
import type { ColorSchemeMode } from '../../theme/ColorSchemeProvider';
import { COLOR_SCHEME_MODES, resolveColorSchemeLabels } from '../../internal/colorScheme';
import type { ColorSchemeSelectProps } from './types';

/**
 * The form-control form, for a settings page that already has select fields
 * beside it and where a segmented control would look out of place.
 *
 * No icons in the options: Select renders its chosen option's content into the
 * trigger, and a glyph there duplicates what the label already says. The
 * three-state forms that do show icons are the ones without a value display.
 */
export function ColorSchemeSelect({
  variant = 'outlined',
  color = 'neutral',
  size = 'md',
  labels,
  ...props
}: ColorSchemeSelectProps) {
  const { mode, setMode } = useColorScheme();
  const resolved = resolveColorSchemeLabels(labels);

  return (
    <Select
      variant={variant}
      color={color}
      size={size}
      value={mode}
      onChange={(value) => {
        // Select types its value as nullable; there is no "no colour scheme",
        // so a null clear is ignored rather than crashing the provider.
        if (value) setMode(value as ColorSchemeMode);
      }}
      {...props}
    >
      {COLOR_SCHEME_MODES.map((entry) => (
        <Option key={entry} value={entry}>
          {resolved[entry]}
        </Option>
      ))}
    </Select>
  );
}
