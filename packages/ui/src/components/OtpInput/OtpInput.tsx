'use client';
import * as React from 'react';
import { OTPField } from '@base-ui/react/otp-field';
import { useFormContext } from 'react-hook-form';
import { cx } from '../../utils/cx';
import { inputVariants } from '../Input/inputVariants';
import { FormControlContext } from '../FormControl/FormControlContext';
import {
  FieldShell,
  omitProps,
  useBoundField,
  useFieldIds,
  useForkRef,
  valueAdapter,
  VALUE_PROPS,
} from '../../internal/form';
import type { OtpInputProps } from './types';

// Each slot is an Input pill squared off: the width matches the pill's own
// min-height per size (32/36/44px), and the inline padding goes so a single
// centred character has the whole box.
const SLOT_SIZE_CLASS = { sm: 'w-8 px-0', md: 'w-9 px-0', lg: 'w-11 px-0' } as const;

const defaultSlotLabel = (index: number, length: number) => `Character ${index + 1} of ${length}`;

// Base UI's own filters, as regexes of what to drop. Only used when the field
// is bound to a <Form> — see `nativeValidation` below.
const REJECT: Record<NonNullable<OtpInputProps['validationType']>, RegExp | null> = {
  numeric: /[^0-9]/g,
  alpha: /[^a-zA-Z]/g,
  alphanumeric: /[^a-zA-Z0-9]/g,
  none: null,
};

type OtpInputBaseProps = OtpInputProps & {
  /**
   * Off when bound to a <Form>. Base UI puts a `pattern` on its hidden input,
   * so a half-typed code fails the browser's own constraint check and the
   * submit never reaches the zod schema: the user sees a native bubble instead
   * of the form's message. Unbound, that bubble is the only validation there
   * is, so it stays.
   */
  nativeValidation?: boolean;
};

/** The unconnected field: one Input-styled slot per character. */
const OtpInputBase = React.forwardRef<HTMLDivElement, OtpInputBaseProps>(function OtpInputBase(
  {
    length = 6,
    variant = 'outlined',
    color,
    size = 'md',
    value,
    defaultValue,
    onChange,
    onComplete,
    validationType = 'numeric',
    mask,
    autoSubmit,
    disabled: disabledProp,
    readOnly,
    required,
    name,
    id,
    slotLabel = defaultSlotLabel,
    error,
    nativeValidation = true,
    className,
    'aria-labelledby': ariaLabelledBy,
    ...props
  },
  ref,
) {
  const generatedId = React.useId();
  const groupId = `${id ?? generatedId}-group`;
  const reject = REJECT[validationType];
  const formControl = React.useContext(FormControlContext);
  const hasError = error ?? formControl?.error ?? false;
  // Same rule as Input: an explicit colour from the caller wins over the error colour.
  const effectiveColor = color ?? (hasError ? 'danger' : 'neutral');
  const disabled = disabledProp ?? formControl?.disabled;

  return (
    <OTPField.Root
      ref={ref}
      id={id}
      length={length}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onChange ? (next) => onChange(next) : undefined}
      onValueComplete={onComplete ? (next) => onComplete(next) : undefined}
      // Unbound: Base UI filters and sets the native pattern. Bound: the same
      // filtering by hand, without the pattern (see nativeValidation).
      validationType={nativeValidation ? validationType : 'none'}
      normalizeValue={nativeValidation || !reject ? undefined : (raw) => raw.replace(reject, '')}
      inputMode={nativeValidation ? undefined : validationType === 'numeric' ? 'numeric' : 'text'}
      mask={mask}
      autoSubmit={autoSubmit}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
      // On the group, not the slots: it is the group that carries the field's
      // name and description, so that is where a screen reader looks.
      aria-invalid={hasError || undefined}
      aria-labelledby={ariaLabelledBy}
      className={cx('inline-flex gap-2', className)}
      // Base UI spends the `id` prop on the first slot, so the group needs its
      // own — the first slot points at it when the field is named by
      // aria-label alone (see below).
      render={(rootProps) => <div {...rootProps} id={groupId} />}
      {...props}
    >
      {Array.from({ length }, (_, index) => (
        <OTPField.Input
          key={index}
          // Base UI drops aria-label on the first slot by design: that slot
          // takes the field's own name (its <label>, or aria-labelledby), and
          // only the later ones are "Character n of m". A field named by
          // aria-label alone would leave the first slot nameless, so it is
          // pointed at the group, which carries that aria-label.
          aria-label={slotLabel(index, length)}
          aria-labelledby={index === 0 && ariaLabelledBy == null && props['aria-label'] != null ? groupId : undefined}
          className={cx(
            inputVariants({ variant, color: effectiveColor, size }),
            // The pill classes were written for a wrapper around an <input>;
            // here the slot IS the <input>, and :focus-within matches the
            // focused element itself, so Input's focus ring carries over as is.
            'text-center tabular-nums outline-none disabled:cursor-default',
            SLOT_SIZE_CLASS[size],
          )}
        />
      ))}
    </OTPField.Root>
  );
});

/** OtpInputBase plus its optional FormControl/FormLabel/FormHelperText shell. */
const OtpInputField = React.forwardRef<HTMLDivElement, OtpInputBaseProps>(function OtpInputField(
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
      <OtpInputBase
        ref={ref}
        id={id}
        required={required}
        error={error}
        // The <label> points at the first slot (Base UI hands it the `id`),
        // and Base UI then names the group after that same label.
        aria-describedby={helperId}
        {...props}
      />
    </FieldShell>
  );
});

/** The react-hook-form-connected form of OtpInputField. */
const BoundOtpInput = React.forwardRef<HTMLDivElement, OtpInputProps>(function BoundOtpInput(
  { name, onChange, onBlur, error, helperText, ...rest },
  ref,
) {
  const { fieldProps, errorMessage } = useBoundField(name!, valueAdapter, { onChange, onBlur });
  const { ref: fieldRef, value, ...boundProps } = fieldProps as {
    ref: React.Ref<HTMLDivElement>;
    value: string | undefined;
  };
  const forkedRef = useForkRef(ref, fieldRef);
  return (
    <OtpInputField
      {...omitProps(rest, VALUE_PROPS)}
      {...(boundProps as OtpInputProps)}
      // An unset form value is undefined, which Base UI reads as "uncontrolled".
      value={value ?? ''}
      nativeValidation={false}
      ref={forkedRef}
      error={error || errorMessage != null}
      helperText={errorMessage ?? helperText}
    />
  );
});

/**
 * A one-time-code field: one slot per character, in Input's look. Built on
 * Base UI's OTPField, so focus moves along while typing, Backspace walks
 * back, a pasted or SMS-autofilled code spreads across the slots, and the
 * form receives a single string. There is no @mui/joy counterpart.
 */
export const OtpInput = React.forwardRef<HTMLDivElement, OtpInputProps>(function OtpInput(props, ref) {
  const form = useFormContext();
  if (form && props.name) {
    return <BoundOtpInput {...props} ref={ref} />;
  }
  return <OtpInputField {...props} ref={ref} />;
});
