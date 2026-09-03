'use client';
import * as React from 'react';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import { cx } from '../../utils/cx';
import { RadioGroupContext } from '../RadioGroup/RadioGroupContext';
import { radioBoxVariants, radioRootVariants } from './radioVariants';
import type { RadioProps } from './types';

const STANDALONE_VALUE = 'checked';

// Radio's variant stays FIXED at the caller's choice (default outlined) —
// only `color` toggles between neutral (unchecked) and primary (checked),
// unlike Checkbox which switches both. Confirmed against @mui/joy's Radio.js
// source (`activeColor`/`inactiveColor`, but a single fixed `variant`).
//
// Base UI's Radio.Root has no standalone controlled-checked prop at all — it
// only knows whether it's checked by comparing its `value` against an
// ancestor RadioGroup's committed value. When this Radio isn't inside our
// RadioGroup, we wrap it in a throwaway single-item Base UI RadioGroup so
// `checked`/`defaultChecked`/`onCheckedChange` still work standalone —
// mirroring Checkbox's controlled/uncontrolled mirror-state pattern so the
// displayed color/dot stay correct for uncontrolled usage too.
export const Radio = React.forwardRef<HTMLElement, RadioProps>(function Radio(
  {
    variant = 'outlined',
    color,
    size = 'md',
    value,
    checked,
    defaultChecked,
    disabled,
    readOnly,
    required,
    disableIcon = false,
    label,
    name,
    className,
    onCheckedChange,
    ...props
  },
  ref,
) {
  const group = React.useContext(RadioGroupContext);
  const isGrouped = group !== undefined;

  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked ?? false);
  const standaloneChecked = checked ?? uncontrolledChecked;

  const ownValue = isGrouped ? value : STANDALONE_VALUE;
  const isChecked = isGrouped ? group.value === ownValue : standaloneChecked;
  const effectiveColor = color ?? (isChecked ? 'primary' : 'neutral');

  const box = (
    <BaseRadio.Root
      ref={ref}
      value={ownValue}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      className={cx(radioBoxVariants({ variant, color: effectiveColor, size }), className)}
      {...props}
    >
      {!disableIcon && (
        <span
          className={cx('rounded-[50%] bg-current transition-transform', isChecked ? 'scale-100' : 'scale-0')}
          style={{ width: '50%', height: '50%' }}
        />
      )}
    </BaseRadio.Root>
  );

  const content = label ? (
    <label className={radioRootVariants({ size })}>
      {box}
      <span className="min-w-0 flex-1">{label}</span>
    </label>
  ) : (
    box
  );

  if (isGrouped) {
    return content;
  }

  return (
    <BaseRadioGroup
      name={name}
      value={standaloneChecked ? STANDALONE_VALUE : undefined}
      onValueChange={() => {
        setUncontrolledChecked(true);
        onCheckedChange?.(true);
      }}
    >
      {content}
    </BaseRadioGroup>
  );
});
