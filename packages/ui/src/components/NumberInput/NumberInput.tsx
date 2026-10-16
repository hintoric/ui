'use client';
import * as React from 'react';
import { NumberField } from '@base-ui/react/number-field';
import { useFormContext } from 'react-hook-form';
import { cx } from '../../utils/cx';
import { inputVariants } from '../Input/inputVariants';
import { INPUT_WRAPPER_DISABLED_CLASSES } from '../../utils/colorVariantClasses';
import { FormControlContext } from '../FormControl/FormControlContext';
import { AddIcon } from '../../internal/svg-icons/AddIcon';
import { HorizontalRuleIcon } from '../../internal/svg-icons/HorizontalRuleIcon';
import {
  FieldShell,
  omitProps,
  useBoundField,
  useFieldIds,
  useForkRef,
  valueAdapter,
  VALUE_PROPS,
} from '../../internal/form';
import type { NumberInputProps } from './types';

// One step below the pill's own min-height per size (32/36/44px), so the
// buttons sit inside the pill's border with an even 4px gap above and below.
const STEPPER_SIZE_CLASS = { sm: 'size-6 text-base', md: 'size-7 text-lg', lg: 'size-9 text-xl' } as const;

// There is no @mui/joy number input to copy these from. A plain IconButton
// would fall apart on a solid pill (a primary-coloured glyph on a primary
// background), so the buttons tint with currentColor instead: they pick up
// whatever the pill's variant/colour already chose for its text, and every
// variant × colour stays legible without a second class map.
const STEPPER_CLASSES =
  'inline-flex shrink-0 items-center justify-center rounded-xs cursor-pointer transition-colors ' +
  'hover:bg-[color-mix(in_srgb,currentColor_12%,transparent)] active:bg-[color-mix(in_srgb,currentColor_20%,transparent)] ' +
  'disabled:cursor-default disabled:bg-transparent disabled:opacity-50';

/** The unconnected field: the pill, the input and the − / + buttons. */
const NumberInputBase = React.forwardRef<HTMLInputElement, NumberInputProps>(function NumberInputBase(
  {
    variant = 'outlined',
    color,
    size = 'md',
    startDecorator,
    endDecorator,
    value,
    defaultValue,
    onChange,
    onChangeCommitted,
    min,
    max,
    step,
    smallStep,
    largeStep,
    format,
    locale,
    stepper = true,
    incrementLabel = 'Increase',
    decrementLabel = 'Decrease',
    error,
    id,
    name,
    required,
    readOnly,
    disabled: disabledProp,
    className,
    ...props
  },
  ref,
) {
  const formControl = React.useContext(FormControlContext);
  const hasError = error ?? formControl?.error ?? false;
  // Same rule as Input: an explicit colour from the caller wins over the error colour.
  const effectiveColor = color ?? (hasError ? 'danger' : 'neutral');
  const disabled = disabledProp ?? formControl?.disabled;

  return (
    <NumberField.Root
      id={id}
      name={name}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onChange ? (next) => onChange(next) : undefined}
      onValueCommitted={onChangeCommitted ? (next) => onChangeCommitted(next) : undefined}
      min={min}
      max={max}
      step={step}
      smallStep={smallStep}
      largeStep={largeStep}
      format={format}
      locale={locale}
      required={required}
      readOnly={readOnly}
      disabled={disabled}
      // flex, not Input's inline-flex: Joy's input root fills its container,
      // and Input's not doing so is the still-open P1 of the 2026-09-06 audit.
      className={cx(
        inputVariants({ variant, color: effectiveColor, size }),
        'flex data-[disabled]:cursor-default',
        INPUT_WRAPPER_DISABLED_CLASSES[variant][effectiveColor],
        className,
      )}
    >
      {startDecorator && <span className="inline-flex items-center text-ink-icon">{startDecorator}</span>}
      <NumberField.Input
        ref={ref}
        className="w-full min-w-0 border-none bg-transparent p-0 tabular-nums outline-none"
        aria-invalid={hasError || undefined}
        {...props}
      />
      {endDecorator && <span className="inline-flex items-center text-ink-icon">{endDecorator}</span>}
      {stepper && (
        // -me pulls the pair towards the pill's edge by the same 4px it keeps
        // from the top and bottom, rather than the full inline padding.
        <span
          className={cx(
            'inline-flex items-center gap-0.5',
            size === 'sm' ? '-me-1' : size === 'md' ? '-me-2' : '-me-3',
            variant !== 'solid' && 'text-ink-icon',
          )}
        >
          {/* tabIndex -1: the field itself already steps with ↑/↓, so the
              buttons would only add two dead tab stops per field — the same
              choice the browser's own number spinner makes. */}
          <NumberField.Decrement aria-label={decrementLabel} tabIndex={-1} className={cx(STEPPER_CLASSES, STEPPER_SIZE_CLASS[size])}>
            <HorizontalRuleIcon />
          </NumberField.Decrement>
          <NumberField.Increment aria-label={incrementLabel} tabIndex={-1} className={cx(STEPPER_CLASSES, STEPPER_SIZE_CLASS[size])}>
            <AddIcon />
          </NumberField.Increment>
        </span>
      )}
    </NumberField.Root>
  );
});

/** NumberInputBase plus its optional FormControl/FormLabel/FormHelperText shell. */
const NumberInputField = React.forwardRef<HTMLInputElement, NumberInputProps>(function NumberInputField(
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
      <NumberInputBase
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

/** The react-hook-form-connected form of NumberInputField. */
const BoundNumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(function BoundNumberInput(
  { name, onChange, onBlur, error, helperText, ...rest },
  ref,
) {
  const { fieldProps, errorMessage } = useBoundField(name!, valueAdapter, { onChange, onBlur });
  const { ref: fieldRef, value, ...boundProps } = fieldProps as {
    ref: React.Ref<HTMLInputElement>;
    value: number | null | undefined;
  };
  const forkedRef = useForkRef(ref, fieldRef);
  return (
    <NumberInputField
      {...omitProps(rest, VALUE_PROPS)}
      {...(boundProps as NumberInputProps)}
      // An unset form value is undefined, which Base UI reads as "uncontrolled"
      // — it would then ignore every later value the form sets. null keeps the
      // field controlled and empty.
      value={value ?? null}
      ref={forkedRef}
      error={error || errorMessage != null}
      helperText={errorMessage ?? helperText}
    />
  );
});

/**
 * A number field with − / + buttons, in Input's look. Built on Base UI's
 * NumberField: typing is parsed and formatted with Intl (so "1.234,5" works
 * in German), ↑/↓ step, Shift/Alt step large/small, and the value is a
 * `number | null` rather than a string. There is no @mui/joy counterpart.
 */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(props, ref) {
  const form = useFormContext();
  if (form && props.name) {
    return <BoundNumberInput {...props} ref={ref} />;
  }
  return <NumberInputField {...props} ref={ref} />;
});
