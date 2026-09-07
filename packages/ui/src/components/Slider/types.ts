import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface SliderProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color' | 'defaultValue' | 'onChange'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  /** `false` hides the filled indicator entirely; the default (`true`) shows it. */
  track?: boolean;
  value?: number | readonly number[];
  defaultValue?: number | readonly number[];
  onChange?: (value: number | number[]) => void;
  onChangeCommitted?: (value: number | number[]) => void;
  name?: string;
  /**
   * Renders a FormLabel for the slider, associated by aria-labelledby — a
   * <label> cannot name the control div, and the focusable element is a thumb
   * inside it.
   */
  label?: React.ReactNode;
  /** Renders a FormHelperText below the slider. A field error replaces it while one is pending. */
  helperText?: React.ReactNode;
  /** Forces the error look. OR-ed with the bound field's own error state. */
  error?: boolean;
  required?: boolean;
}
