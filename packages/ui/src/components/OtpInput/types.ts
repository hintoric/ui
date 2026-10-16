import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface OtpInputProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color' | 'onChange' | 'defaultValue'> {
  /** Number of characters. @default 6 */
  length?: number;
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  value?: string;
  defaultValue?: string;
  /** Fires on every change, with the whole code entered so far. */
  onChange?: (value: string) => void;
  /** Fires once every slot is filled — typed, pasted or autofilled from an SMS. */
  onComplete?: (value: string) => void;
  /** Which characters are accepted. @default 'numeric' */
  validationType?: 'numeric' | 'alpha' | 'alphanumeric' | 'none';
  /** Shows dots instead of the characters. @default false */
  mask?: boolean;
  /** Submits the surrounding form as soon as the code is complete. @default false */
  autoSubmit?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /** Submitted with the form as one string. */
  name?: string;
  /** Accessible name of each slot. @default (index, length) => `Character ${index + 1} of ${length}` */
  slotLabel?: (index: number, length: number) => string;
  /** Renders a FormLabel above the field. Omit it and no wrapper is added. */
  label?: React.ReactNode;
  /** Renders a FormHelperText below the field. A field error replaces it while one is pending. */
  helperText?: React.ReactNode;
  /**
   * Forces the error look. OR-ed with the bound field's own error state, so a
   * server-side error ("code expired") can be shown for a well-formed code.
   */
  error?: boolean;
}
