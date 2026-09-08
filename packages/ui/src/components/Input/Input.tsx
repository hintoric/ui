'use client';
import * as React from 'react';
import { Input as BaseInput } from '@base-ui/react/input';
import { useFormContext } from 'react-hook-form';
import { cx } from '../../utils/cx';
import { inputVariants } from './inputVariants';
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
import type { InputProps } from './types';

/** The unconnected input: variant/colour/decorators and nothing else. */
const InputBase = React.forwardRef<HTMLInputElement, InputProps>(function InputBase(
  // label/helperText are stripped by InputField above, so they never reach
  // here and are deliberately not destructured — an unused binding would trip
  // no-unused-vars.
  { variant = 'outlined', color, size = 'md', startDecorator, endDecorator, className, error, ...props },
  ref,
) {
  const formControl = React.useContext(FormControlContext);
  const hasError = error ?? formControl?.error ?? false;
  // Joy resolves `color = error ? 'danger' : color` — an explicit colour from
  // the caller always wins, the same "only when not explicit" rule Checkbox
  // and Switch already use for their state colours.
  const effectiveColor = color ?? (hasError ? 'danger' : 'neutral');
  const disabled = props.disabled ?? formControl?.disabled;

  return (
    <span className={cx(inputVariants({ variant, color: effectiveColor, size }), className)}>
      {startDecorator && (
        <span className="inline-flex items-center text-ink-icon">{startDecorator}</span>
      )}
      {/* onChange rides along in `props`: Base UI's Input forwards unknown
          props to the real <input>, so callers get the genuine ChangeEvent
          rather than the hand-built stand-in that used to live here. That
          stand-in carried only target.value, which left react-hook-form's
          register() with no target.name to resolve the field by — it recorded
          nothing at all, silently. Verified against @base-ui/react's Input
          before removing it. */}
      <BaseInput
        ref={ref}
        className={cx(
          'w-full min-w-0 border-none bg-transparent p-0 outline-none',
          // Browser autofill paints its own opaque background directly on
          // this <input>, ignoring the transparent bg above — left alone it
          // shows as a hard-edged rectangle sitting inside the rounded,
          // padded pill. Bleeding the input to the pill's edge (and
          // rounding whichever corners aren't already owned by a decorator)
          // makes the autofill highlight fill the whole pill instead,
          // matching @mui/joy's StyledInputHtml `:-webkit-autofill` rule.
          '[&:-webkit-autofill]:[padding-inline:var(--input-padding-inline)]',
          !startDecorator &&
            '[&:-webkit-autofill]:[margin-inline-start:calc(-1*var(--input-padding-inline))] [&:-webkit-autofill]:[border-start-start-radius:var(--radius-sm)] [&:-webkit-autofill]:[border-end-start-radius:var(--radius-sm)]',
          !endDecorator &&
            '[&:-webkit-autofill]:[margin-inline-end:calc(-1*var(--input-padding-inline))] [&:-webkit-autofill]:[border-start-end-radius:var(--radius-sm)] [&:-webkit-autofill]:[border-end-end-radius:var(--radius-sm)]',
        )}
        aria-invalid={hasError || undefined}
        {...props}
        disabled={disabled}
      />
      {endDecorator && (
        <span className="inline-flex items-center text-ink-icon">{endDecorator}</span>
      )}
    </span>
  );
});

/** InputBase plus its optional FormControl/FormLabel/FormHelperText shell. */
const InputField = React.forwardRef<HTMLInputElement, InputProps>(function InputField(
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
      <InputBase
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

/** The react-hook-form-connected form of InputField. */
const BoundInput = React.forwardRef<HTMLInputElement, InputProps>(function BoundInput(
  { name, onChange, onBlur, error, helperText, ...rest },
  ref,
) {
  const { fieldProps, errorMessage } = useBoundField(name!, textAdapter, { onChange, onBlur });
  const { ref: fieldRef, ...boundProps } = fieldProps as { ref: React.Ref<HTMLInputElement> };
  const forkedRef = useForkRef(ref, fieldRef);
  return (
    <InputField
      {...omitProps(rest, VALUE_PROPS)}
      {...(boundProps as InputProps)}
      ref={forkedRef}
      error={error || errorMessage != null}
      helperText={errorMessage ?? helperText}
    />
  );
});

// The branch is stable per call site — a field inside a form either has a
// name for its whole life or never does — so the component type does not
// change at runtime and nothing remounts. `name` alone changes nothing:
// outside a <Form> there is no context to read.
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const form = useFormContext();
  if (form && props.name) {
    return <BoundInput {...props} ref={ref} />;
  }
  return <InputField {...props} ref={ref} />;
});
