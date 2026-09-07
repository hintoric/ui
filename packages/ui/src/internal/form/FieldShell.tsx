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
  /**
   * Set this for a control that a <label> cannot address — a radiogroup, or a
   * slider whose focusable element is a thumb inside a wrapper. The label then
   * carries this id instead of an htmlFor, and the caller points the control's
   * aria-labelledby at it.
   */
  labelId?: string;
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
  labelId,
  children,
}: FieldShellProps): React.ReactElement {
  if (label == null && helperText == null) {
    return <>{children}</>;
  }
  return (
    <FormControl error={error} required={required} disabled={disabled}>
      {label != null &&
        (labelId != null ? (
          <FormLabel id={labelId}>{label}</FormLabel>
        ) : (
          <FormLabel htmlFor={id}>{label}</FormLabel>
        ))}
      {children}
      {helperText != null && <FormHelperText id={helperId}>{helperText}</FormHelperText>}
    </FormControl>
  );
}
