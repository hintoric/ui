import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface TextareaProps
  extends Omit<React.ComponentPropsWithoutRef<'textarea'>, 'color' | 'size'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  /** Renders a FormLabel above the field. Omit it and no wrapper is added. */
  label?: React.ReactNode;
  /** Renders a FormHelperText below the field. A field error replaces it while one is pending. */
  helperText?: React.ReactNode;
  /** Forces the error look. OR-ed with the bound field's own error state. */
  error?: boolean;
  /** Smallest height, in rows. The field grows with its content from here, as Joy's does. Defaults to `rows`, else 1. */
  minRows?: number;
  /** Largest height, in rows. Past it the content scrolls. Unbounded when omitted. */
  maxRows?: number;
  /** Read as `minRows` when that is unset: the field no longer stays at a fixed number of rows. */
  rows?: number;
}
