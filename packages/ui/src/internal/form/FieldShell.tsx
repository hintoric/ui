'use client';
import * as React from 'react';
import { FormControl } from '../../components/FormControl';
import { FormLabel } from '../../components/FormLabel';
import { FormHelperText } from '../../components/FormHelperText';

export interface FieldShellProps {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  id: string;
  helperId?: string;
  children: React.ReactNode;
}

/**
 * Renders the bare field when there is nothing to wrap it in. That keeps the
 * DOM — and every committed visual baseline — identical for callers who never
 * pass label or helperText.
 */
export function FieldShell({
  label,
  helperText,
  error,
  required,
  disabled,
  id,
  helperId,
  children,
}: FieldShellProps): React.ReactElement {
  if (label == null && helperText == null) {
    return <>{children}</>;
  }
  return (
    <FormControl error={error} required={required} disabled={disabled}>
      {label != null && <FormLabel htmlFor={id}>{label}</FormLabel>}
      {children}
      {helperText != null && <FormHelperText id={helperId}>{helperText}</FormHelperText>}
    </FormControl>
  );
}
