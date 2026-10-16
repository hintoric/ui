import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface NumberInputProps
  extends Omit<
    React.ComponentPropsWithoutRef<'input'>,
    'color' | 'size' | 'onChange' | 'value' | 'defaultValue' | 'min' | 'max' | 'step' | 'type'
  > {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  startDecorator?: React.ReactNode;
  /** Sits between the field and the stepper buttons — a unit such as "kg" or "€". */
  endDecorator?: React.ReactNode;
  /** The number, or `null` while the field is empty. */
  value?: number | null;
  defaultValue?: number;
  /** Fires on every change: typing, the stepper buttons, arrow keys. `null` when cleared. */
  onChange?: (value: number | null) => void;
  /** Fires once the change is done: on blur after typing, on release after a button press. */
  onChangeCommitted?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** What the buttons and ↑/↓ add or remove. @default 1 */
  step?: number;
  /** The step while Alt is held. @default 0.1 */
  smallStep?: number;
  /** The step while Shift is held, and for Page Up/Down. @default 10 */
  largeStep?: number;
  /** How the value is displayed, e.g. `{ style: 'currency', currency: 'EUR' }`. */
  format?: Intl.NumberFormatOptions;
  /** The locale for formatting and parsing. Defaults to the runtime locale. */
  locale?: Intl.LocalesArgument;
  /** Shows the − / + buttons. @default true */
  stepper?: boolean;
  /** Accessible name of the + button. @default 'Increase' */
  incrementLabel?: string;
  /** Accessible name of the − button. @default 'Decrease' */
  decrementLabel?: string;
  /** Renders a FormLabel above the field. Omit it and no wrapper is added. */
  label?: React.ReactNode;
  /** Renders a FormHelperText below the field. A field error replaces it while one is pending. */
  helperText?: React.ReactNode;
  /**
   * Forces the error look. OR-ed with the bound field's own error state, so a
   * server-side error can be shown for a field the schema considers valid.
   */
  error?: boolean;
}
