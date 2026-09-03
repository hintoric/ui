'use client';
import * as React from 'react';
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { cx } from '../../utils/cx';
import { CheckIcon } from '../../internal/svg-icons/CheckIcon';
import { HorizontalRuleIcon } from '../../internal/svg-icons/HorizontalRuleIcon';
import { checkboxBoxVariants, checkboxRootVariants } from './checkboxVariants';
import type { CheckboxProps } from './types';

// Joy UI switches the checkbox's default variant/color depending on state:
// unchecked defaults to outlined/neutral, checked (or indeterminate) defaults
// to solid/primary — but only when the caller doesn't pass an explicit
// variant/color, in which case that same value is used for both states.
// Confirmed against @mui/joy's Checkbox.js source (activeVariant/inactiveVariant).
export const Checkbox = React.forwardRef<HTMLElement, CheckboxProps>(function Checkbox(
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
    className,
    onCheckedChange,
    ...rest
  },
  ref,
) {
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked ?? false);
  const isChecked = checked ?? uncontrolledChecked;
  const isActive = isChecked || indeterminate;
  const effectiveVariant = variant ?? (isActive ? 'solid' : 'outlined');
  const effectiveColor = color ?? (isActive ? 'primary' : 'neutral');

  const box = (
    <BaseCheckbox.Root
      ref={ref}
      name={name}
      value={value}
      checked={checked}
      defaultChecked={defaultChecked}
      indeterminate={indeterminate}
      disabled={disabled}
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
