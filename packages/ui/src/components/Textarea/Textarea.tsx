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
import { SHADOW_STYLE, useAutosize } from './useAutosize';

// Joy's --Textarea-paddingBlock, minus the 1px border on outlined so the box
// is the same height in every variant (sm 32px, md 36px, lg 51px at one row).
// Measured against @mui/joy's real Textarea.
const PADDING_BLOCK = {
  sm: { outlined: 'py-[calc(0.375rem-1.5px)]', other: 'py-[calc(0.375rem-0.5px)]' },
  md: { outlined: 'py-[calc(0.375rem-1px)]', other: 'py-1.5' },
  lg: { outlined: 'py-[calc(0.75rem-1px)]', other: 'py-3' },
} as const;

const TextareaBase = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function TextareaBase(
  // As in InputBase: TextareaField strips label/helperText before this point,
  // so they are deliberately not destructured here.
  {
    variant = 'outlined',
    color,
    size = 'md',
    className,
    error,
    rows,
    minRows = rows ?? 1,
    maxRows,
    onChange,
    ...props
  },
  ref,
) {
  const formControl = React.useContext(FormControlContext);
  const hasError = error ?? formControl?.error ?? false;
  const effectiveColor = color ?? (hasError ? 'danger' : 'neutral');
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const shadowRef = React.useRef<HTMLTextAreaElement>(null);
  const handleRef = useForkRef(ref, inputRef);
  const syncHeight = useAutosize(inputRef, shadowRef, {
    minRows,
    maxRows,
    placeholder: props.placeholder,
  });
  const classes = cx(
    inputVariants({ variant, color: effectiveColor, size }),
    // Joy's body-sm/-lg use line-height 1.5 like body-md; Tailwind's text-sm
    // and text-lg carry 20px/28px, which a multi-line field multiplies.
    'flex w-full items-start resize-none leading-[1.5]',
    PADDING_BLOCK[size][variant === 'outlined' ? 'outlined' : 'other'],
    className,
  );
  return (
    <>
      <textarea
        ref={handleRef}
        // resize-none matches Joy UI's real Textarea: the browser's native
        // resize handle isn't clipped by border-radius, so leaving resize on
        // shows a square poking out of the rounded corner.
        //
        // `flex w-full` makes it fill its container like Joy's wrapper <div>
        // (P1 of the 2026-09-06 audit). There is deliberately no wrapper here:
        // the <textarea> stays the element `className` and `ref` reach, and
        // inputVariants' `disabled:` utilities keep matching it directly. A
        // textarea is replaced-like, so `flex` alone keeps its intrinsic
        // cols-based width — the `w-full` is what actually fills.
        //
        // Height follows the content between minRows and maxRows (useAutosize),
        // as Joy's does; `rows` is only the pre-hydration fallback.
        className={classes}
        rows={minRows}
        aria-invalid={hasError || undefined}
        onChange={(event) => {
          // Uncontrolled typing never re-renders, so measure here too.
          syncHeight();
          onChange?.(event);
        }}
        {...props}
        disabled={props.disabled ?? formControl?.disabled}
      />
      {/* After the visible one, so `querySelector('textarea')` and
        `firstElementChild` still reach the real field. */}
      <textarea
        aria-hidden
        className={classes}
        readOnly
        ref={shadowRef}
        tabIndex={-1}
        style={{ ...props.style, ...SHADOW_STYLE }}
      />
    </>
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

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(props, ref) {
    const form = useFormContext();
    if (form && props.name) {
      return <BoundTextarea {...props} ref={ref} />;
    }
    return <TextareaField {...props} ref={ref} />;
  },
);
