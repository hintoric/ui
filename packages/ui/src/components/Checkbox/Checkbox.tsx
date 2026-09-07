'use client';
import * as React from 'react';
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { cx } from '../../utils/cx';
import { CheckIcon } from '../../internal/svg-icons/CheckIcon';
import { HorizontalRuleIcon } from '../../internal/svg-icons/HorizontalRuleIcon';
import { checkboxBoxVariants, checkboxRootVariants } from './checkboxVariants';
import { useFormContext } from 'react-hook-form';
import { FormControlContext } from '../FormControl/FormControlContext';
import {
  CHECKED_PROPS,
  FieldShell,
  checkedAdapter,
  omitProps,
  useBoundField,
  useFieldIds,
  useForkRef,
} from '../../internal/form';
import type { CheckboxProps } from './types';

// Joy UI switches the checkbox's default variant/color depending on state:
// unchecked defaults to outlined/neutral, checked (or indeterminate) defaults
// to solid/primary — but only when the caller doesn't pass an explicit
// variant/color, in which case that same value is used for both states.
// Confirmed against @mui/joy's Checkbox.js source (activeVariant/inactiveVariant).
const CheckboxBase = React.forwardRef<HTMLElement, CheckboxProps>(function CheckboxBase(
  {
    variant,
    color,
    size = 'md',
    checked,
    defaultChecked,
    indeterminate = false,
    disabled,
    readOnly,
    required,
    disableIcon = false,
    label,
    name,
    value,
    error,
    className,
    onCheckedChange,
    ...rest
  },
  ref,
) {
  const formControl = React.useContext(FormControlContext);
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked ?? false);
  const isChecked = checked ?? uncontrolledChecked;
  const isActive = isChecked || indeterminate;
  const effectiveVariant = variant ?? (isActive ? 'solid' : 'outlined');
  // Joy: `color = inProps.color || (formControl.error ? 'danger' : ...)` — an
  // explicit colour beats the error state, and error leaves the VARIANT alone
  // (only the colour moves). Confirmed against @mui/joy's Checkbox.js.
  const hasError = error ?? formControl?.error ?? false;
  const effectiveColor = color ?? (hasError ? 'danger' : isActive ? 'primary' : 'neutral');

  const box = (
    <BaseCheckbox.Root
      ref={ref}
      name={name}
      value={value}
      checked={checked}
      defaultChecked={defaultChecked}
      indeterminate={indeterminate}
      disabled={disabled ?? formControl?.disabled}
      readOnly={readOnly}
      required={required}
      onCheckedChange={(next) => {
        setUncontrolledChecked(next);
        onCheckedChange?.(next);
      }}
      className={cx(checkboxBoxVariants({ variant: effectiveVariant, color: effectiveColor, size }), className)}
      {...rest}
    >
      {!disableIcon && (indeterminate ? <HorizontalRuleIcon /> : isChecked ? <CheckIcon /> : null)}
    </BaseCheckbox.Root>
  );

  if (!label) {
    return box;
  }

  return (
    <label className={checkboxRootVariants({ size })}>
      {box}
      <span className="min-w-0 flex-1">{label}</span>
    </label>
  );
});

/**
 * CheckboxBase plus its optional FormHelperText. Only the helper goes through
 * the shell: Checkbox already renders its own inline <label> next to the box,
 * and handing `label` to FieldShell as well would render it twice.
 */
const CheckboxField = React.forwardRef<HTMLElement, CheckboxProps>(function CheckboxField(
  { helperText, error, required, id: idProp, ...props },
  ref,
) {
  const { id, helperId } = useFieldIds(idProp, helperText != null);
  return (
    <FieldShell
      helperText={helperText}
      error={error}
      required={required}
      disabled={props.disabled}
      id={id}
      helperId={helperId}
    >
      <CheckboxBase
        ref={ref}
        id={id}
        required={required}
        // Passed explicitly, not just via FieldShell's FormControl: with no
        // label and no helper text there IS no FormControl, so the context
        // would never carry it.
        error={error}
        aria-describedby={helperId}
        aria-invalid={error || undefined}
        {...props}
      />
    </FieldShell>
  );
});

const BoundCheckbox = React.forwardRef<HTMLElement, CheckboxProps>(function BoundCheckbox(
  { name, onCheckedChange, error, helperText, ...rest },
  ref,
) {
  const { fieldProps, errorMessage } = useBoundField(name!, checkedAdapter, { onCheckedChange });
  const { ref: fieldRef, ...boundProps } = fieldProps as { ref: React.Ref<HTMLElement> };
  const forkedRef = useForkRef(ref, fieldRef);
  return (
    <CheckboxField
      {...omitProps(rest, CHECKED_PROPS)}
      {...(boundProps as CheckboxProps)}
      ref={forkedRef}
      error={error || errorMessage != null}
      helperText={errorMessage ?? helperText}
    />
  );
});

export const Checkbox = React.forwardRef<HTMLElement, CheckboxProps>(function Checkbox(props, ref) {
  const form = useFormContext();
  if (form && props.name) {
    return <BoundCheckbox {...props} ref={ref} />;
  }
  return <CheckboxField {...props} ref={ref} />;
});
