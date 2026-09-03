'use client';
import * as React from 'react';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import { cx } from '../../utils/cx';
import { RadioGroupContext } from './RadioGroupContext';
import type { RadioGroupProps } from './types';

// Base UI's own <RadioGroup> actually drives each Radio.Root's checked state
// (by comparing its `value` against the group's committed value) — there's
// no standalone controlled-checked prop on Radio.Root itself. We wrap it
// rather than replace it, and mirror the same controlled/uncontrolled value
// into our OWN context so Radio can compute its effective color (Joy UI
// switches neutral/primary on checked) without needing Base UI's internal
// context.
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { name, value, defaultValue, onChange, orientation = 'vertical', className, ...props },
  ref,
) {
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
        className={cx('flex gap-2', orientation === 'horizontal' ? 'flex-row' : 'flex-col', className)}
        {...props}
      />
    </RadioGroupContext.Provider>
  );
});
