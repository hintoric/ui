'use client';
import * as React from 'react';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { cx } from '../../utils/cx';
import { SWITCH_SOLID_VARS, SWITCH_SIZE } from './switchColors';
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
import type { SwitchProps } from './types';

// Switch's variant is always "solid" — only `color` toggles between neutral
// (unchecked) and primary (checked), unless the caller passes an explicit
// color, matching Joy UI's own `color: checked ? color || 'primary' : color
// || 'neutral'`. Confirmed against @mui/joy's Switch.js source.
const SwitchBase = React.forwardRef<HTMLElement, SwitchProps>(function SwitchBase(
  {
    color,
    size = 'md',
    checked,
    defaultChecked,
    disabled,
    readOnly,
    required,
    name,
    error,
    startDecorator,
    endDecorator,
    className,
    onCheckedChange,
    ...props
  },
  ref,
) {
  const formControl = React.useContext(FormControlContext);
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked ?? false);
  const isChecked = checked ?? uncontrolledChecked;
  // Joy: `color = inProps.color ?? (formControl.error ? 'danger' : ...)` — an
  // explicit colour beats the error state. Confirmed against @mui/joy's
  // Switch.js.
  const hasError = error ?? formControl?.error ?? false;
  const effectiveColor = color ?? (hasError ? 'danger' : isChecked ? 'primary' : 'neutral');
  const { track, thumb } = SWITCH_SOLID_VARS[effectiveColor];
  const { trackWidth, trackHeight, thumbSize } = SWITCH_SIZE[size];
  const padding = (trackHeight - thumbSize) / 2;

  return (
    <span className="inline-flex items-center gap-2">
      {startDecorator}
      <BaseSwitch.Root
        ref={ref}
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled ?? formControl?.disabled}
        readOnly={readOnly}
        required={required}
        onCheckedChange={(next) => {
          setUncontrolledChecked(next);
          onCheckedChange?.(next);
        }}
        className={cx(
          // Literal 16px (theme.vars.radius.xl) rather than Tailwind's
          // `rounded-full` (a huge computed px number) — same lesson as
          // Avatar/Chip/Badge/ChipDelete/Skeleton. Confirmed against
          // @mui/joy's Switch.js source.
          'relative inline-flex shrink-0 items-center rounded-[16px] transition-colors cursor-pointer data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
          className,
        )}
        style={{ width: trackWidth, height: trackHeight, backgroundColor: track, padding }}
        {...props}
      >
        <BaseSwitch.Thumb
          className="rounded-[50%] shadow-sm transition-transform"
          style={{
            width: thumbSize,
            height: thumbSize,
            backgroundColor: thumb,
            transform: isChecked ? `translateX(${trackWidth - trackHeight}px)` : 'translateX(0)',
          }}
        />
      </BaseSwitch.Root>
      {endDecorator}
    </span>
  );
});

const SwitchField = React.forwardRef<HTMLElement, SwitchProps>(function SwitchField(
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
      <SwitchBase
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

const BoundSwitch = React.forwardRef<HTMLElement, SwitchProps>(function BoundSwitch(
  { name, onCheckedChange, error, helperText, ...rest },
  ref,
) {
  const { fieldProps, errorMessage } = useBoundField(name!, checkedAdapter, { onCheckedChange });
  const { ref: fieldRef, ...boundProps } = fieldProps as { ref: React.Ref<HTMLElement> };
  const forkedRef = useForkRef(ref, fieldRef);
  return (
    <SwitchField
      {...omitProps(rest, CHECKED_PROPS)}
      {...(boundProps as SwitchProps)}
      ref={forkedRef}
      error={error || errorMessage != null}
      helperText={errorMessage ?? helperText}
    />
  );
});

export const Switch = React.forwardRef<HTMLElement, SwitchProps>(function Switch(props, ref) {
  const form = useFormContext();
  if (form && props.name) {
    return <BoundSwitch {...props} ref={ref} />;
  }
  return <SwitchField {...props} ref={ref} />;
});
