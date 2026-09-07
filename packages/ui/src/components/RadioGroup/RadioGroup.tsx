'use client';
import * as React from 'react';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import { cx } from '../../utils/cx';
import { RadioGroupContext } from './RadioGroupContext';
import { useFormContext } from 'react-hook-form';
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
import type { RadioGroupProps } from './types';

// Base UI's own <RadioGroup> actually drives each Radio.Root's checked state
// (by comparing its `value` against the group's committed value) — there's
// no standalone controlled-checked prop on Radio.Root itself. We wrap it
// rather than replace it, and mirror the same controlled/uncontrolled value
// into our OWN context so Radio can compute its effective color (Joy UI
// switches neutral/primary on checked) without needing Base UI's internal
// context.
const RadioGroupBase = React.forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroupBase(
  { name, value, defaultValue, onChange, orientation = 'vertical', className, error, ...props },
  ref,
) {
  const formControl = React.useContext(FormControlContext);
  const hasError = error ?? formControl?.error ?? false;
  const [uncontrolledValue, setUncontrolledValue] = React.useState<unknown>(defaultValue);
  const currentValue = value !== undefined ? value : uncontrolledValue;

  const handleChange = React.useCallback(
    (next: unknown) => {
      setUncontrolledValue(next);
      onChange?.(next);
    },
    [onChange],
  );

  const contextValue = React.useMemo(
    () => ({ name, value: currentValue, onChange: handleChange }),
    [name, currentValue, handleChange],
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <BaseRadioGroup
        ref={ref}
        name={name}
        value={currentValue}
        onValueChange={handleChange}
        aria-invalid={hasError || undefined}
        className={cx('flex gap-2', orientation === 'horizontal' ? 'flex-row' : 'flex-col', className)}
        {...props}
      />
    </RadioGroupContext.Provider>
  );
});

const RadioGroupField = React.forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroupField(
  { label, helperText, error, required, id: idProp, ...props },
  ref,
) {
  const { id, helperId } = useFieldIds(idProp, helperText != null);
  const labelId = `${id}-label`;
  return (
    <FieldShell
      label={label}
      helperText={helperText}
      error={error}
      required={required}
      id={id}
      helperId={helperId}
      labelId={labelId}
    >
      <RadioGroupBase
        ref={ref}
        id={id}
        error={error}
        // aria-labelledby, not htmlFor: a <label> cannot name a radiogroup.
        aria-labelledby={label != null ? labelId : undefined}
        aria-describedby={helperId}
        {...props}
      />
    </FieldShell>
  );
});

const BoundRadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(function BoundRadioGroup(
  { name, onChange, error, helperText, ...rest },
  ref,
) {
  const { fieldProps, errorMessage } = useBoundField(name!, valueAdapter, { onChange });
  const { ref: fieldRef, ...boundProps } = fieldProps as { ref: React.Ref<HTMLDivElement> };
  const forkedRef = useForkRef(ref, fieldRef);
  return (
    <RadioGroupField
      {...omitProps(rest, VALUE_PROPS)}
      {...(boundProps as RadioGroupProps)}
      ref={forkedRef}
      error={error || errorMessage != null}
      helperText={errorMessage ?? helperText}
    />
  );
});

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  props,
  ref,
) {
  const form = useFormContext();
  if (form && props.name) {
    return <BoundRadioGroup {...props} ref={ref} />;
  }
  return <RadioGroupField {...props} ref={ref} />;
});
