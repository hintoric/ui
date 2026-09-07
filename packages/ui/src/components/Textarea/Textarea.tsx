'use client';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { cx } from '../../utils/cx';
import { inputVariants } from '../Input/inputVariants';
import { FormControlContext } from '../FormControl/FormControlContext';
import {
  FieldShell,
  omitProps,
  textAdapter,
  useBoundField,
  useFieldIds,
  useForkRef,
  VALUE_PROPS,
} from '../../internal/form';
import type { TextareaProps } from './types';

const TextareaBase = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function TextareaBase(
  // As in InputBase: TextareaField strips label/helperText before this point,
  // so they are deliberately not destructured here.
  { variant = 'outlined', color, size = 'md', className, error, ...props },
  ref,
) {
  const formControl = React.useContext(FormControlContext);
  const hasError = error ?? formControl?.error ?? false;
  const effectiveColor = color ?? (hasError ? 'danger' : 'neutral');
  return (
    <textarea
      ref={ref}
      // resize-none matches Joy UI's real Textarea: the browser's native
      // resize handle isn't clipped by border-radius, so leaving resize on
      // shows a square poking out of the rounded corner.
      className={cx(
        inputVariants({ variant, color: effectiveColor, size }),
        'items-start py-1.5 resize-none',
        className,
      )}
      aria-invalid={hasError || undefined}
      {...props}
      disabled={props.disabled ?? formControl?.disabled}
    />
  );
});

const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function TextareaField(
  { label, helperText, error, required, id: idProp, ...props },
  ref,
) {
  const { id, helperId } = useFieldIds(idProp, helperText != null);
  return (
    <FieldShell
      label={label}
      helperText={helperText}
      error={error}
      required={required}
      disabled={props.disabled}
      id={id}
      helperId={helperId}
    >
      <TextareaBase
        ref={ref}
        id={id}
        required={required}
        error={error}
        aria-describedby={helperId}
        {...props}
      />
    </FieldShell>
  );
});

const BoundTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function BoundTextarea(
  { name, onChange, onBlur, error, helperText, ...rest },
  ref,
) {
  const { fieldProps, errorMessage } = useBoundField(name!, textAdapter, { onChange, onBlur });
  const { ref: fieldRef, ...boundProps } = fieldProps as { ref: React.Ref<HTMLTextAreaElement> };
  const forkedRef = useForkRef(ref, fieldRef);
  return (
    <TextareaField
      {...omitProps(rest, VALUE_PROPS)}
      {...(boundProps as TextareaProps)}
      ref={forkedRef}
      error={error || errorMessage != null}
      helperText={errorMessage ?? helperText}
    />
  );
});

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  props,
  ref,
) {
  const form = useFormContext();
  if (form && props.name) {
    return <BoundTextarea {...props} ref={ref} />;
  }
  return <TextareaField {...props} ref={ref} />;
});
