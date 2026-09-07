'use client';
import * as React from 'react';
import { useController, useFormContext } from 'react-hook-form';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { FieldShell, useFieldIds } from '../../internal/form';
import type { FormFieldProps } from './types';

/**
 * The render-prop route for controls the nine bound fields do not cover — a
 * custom picker, a DataGrid cell, a third-party widget. It brings the same
 * FormControl/FormLabel/FormHelperText shell those fields use, so a custom
 * control sits in a form looking like everything around it.
 */
export function FormField<T extends FieldValues, N extends FieldPath<T>>({
  name,
  label,
  helperText,
  error,
  required,
  disabled,
  id: idProp,
  children,
}: FormFieldProps<T, N>): React.ReactElement {
  const { control } = useFormContext<T>();
  const { field, fieldState } = useController<T, N>({ name, control });
  const errorMessage = fieldState.error?.message;
  const shownHelper = errorMessage ?? helperText;
  const { id, helperId } = useFieldIds(idProp, shownHelper != null);

  return (
    <FieldShell
      label={label}
      helperText={shownHelper}
      error={error || errorMessage != null}
      required={required}
      disabled={disabled}
      id={id}
      helperId={helperId}
    >
      {children({ field, fieldState, id, describedBy: helperId })}
    </FieldShell>
  );
}
