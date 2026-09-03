import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface SelectProps<Value = string>
  extends Omit<React.ComponentPropsWithoutRef<'button'>, 'color' | 'value' | 'defaultValue' | 'onChange' | 'children'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  placeholder?: React.ReactNode;
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
  indicator?: React.ReactNode;
  /**
   * Simplified from Joy UI's overloaded `Value | Value[]` (single vs
   * `multiple`) typing — this wrapper always types value/onChange as a single
   * `Value`. Pass `multiple` through if needed; Base UI's own Select.Root
   * still handles the array value correctly at runtime, just not reflected
   * in this prop's TS type.
   */
  value?: Value | null;
  defaultValue?: Value | null;
  onChange?: (value: Value | null) => void;
  multiple?: boolean;
  required?: boolean;
  /** Whether the listbox popup is initially open. Matches Joy UI's `defaultListboxOpen`. */
  defaultListboxOpen?: boolean;
  /** Whether the listbox popup is open (controlled). Matches Joy UI's `listboxOpen`. */
  listboxOpen?: boolean;
  onListboxOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}
