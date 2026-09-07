import type * as React from 'react';
import type {
  ControllerRenderProps,
  ControllerFieldState,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

export interface FormFieldRenderArgs<T extends FieldValues, N extends FieldPath<T>> {
  field: ControllerRenderProps<T, N>;
  fieldState: ControllerFieldState;
  /** Put this on the control so the rendered FormLabel actually labels it. */
  id: string;
  /**
   * Put this on the control so a screen reader reads the helper text or the
   * validation message with it. Undefined when there is nothing to describe.
   */
  describedBy?: string;
}

export interface FormFieldProps<T extends FieldValues, N extends FieldPath<T>> {
  name: N;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  /** Forces the error look. OR-ed with the field's own error state. */
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  children: (args: FormFieldRenderArgs<T, N>) => React.ReactNode;
}
