'use client';
import * as React from 'react';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import { cx } from '../../utils/cx';
import { RadioGroupContext } from '../RadioGroup/RadioGroupContext';
import { radioBoxVariants, radioRootVariants } from './radioVariants';
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
const RadioBase = React.forwardRef<HTMLElement, RadioProps>(function RadioBase(
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
    error,
    className,
    onCheckedChange,
    ...props
  },
  ref,
) {
  const formControl = React.useContext(FormControlContext);
  const group = React.useContext(RadioGroupContext);
  const isGrouped = group !== undefined;

  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked ?? false);
  const standaloneChecked = checked ?? uncontrolledChecked;

  const ownValue = isGrouped ? value : STANDALONE_VALUE;
  const isChecked = isGrouped ? group.value === ownValue : standaloneChecked;
  // An explicit colour beats the error state, as in Checkbox and Switch.
  //
  // Worth recording because the source misleads: @mui/joy's minified Radio.js
  // reads `activeColor = formControl.error ? 'danger' : (inProps.color ?? …)`,
  // which says the opposite. Measuring the real package says otherwise — a
  // Joy Radio with color="primary" inside <FormControl error> renders
  // rgb(11, 107, 203), not danger. The rendered package wins over a reading
  // of its build output; see Radio.visual.test.tsx, whose non-danger cells
  // fail the moment this is inverted.
  const hasError = error ?? formControl?.error ?? false;
  const effectiveColor = color ?? (hasError ? 'danger' : isChecked ? 'primary' : 'neutral');

  const box = (
    <BaseRadio.Root
      ref={ref}
      value={ownValue}
      disabled={disabled ?? formControl?.disabled}
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

/**
 * RadioBase plus its optional FormHelperText. Like Checkbox, Radio renders its
 * own inline <label>, so only the helper goes through the shell.
 */
const RadioField = React.forwardRef<HTMLElement, RadioProps>(function RadioField(
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
      <RadioBase
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

const BoundRadio = React.forwardRef<HTMLElement, RadioProps>(function BoundRadio(
  { name, onCheckedChange, error, helperText, ...rest },
  ref,
) {
  const { fieldProps, errorMessage } = useBoundField(name!, checkedAdapter, { onCheckedChange });
  const { ref: fieldRef, ...boundProps } = fieldProps as { ref: React.Ref<HTMLElement> };
  const forkedRef = useForkRef(ref, fieldRef);
  return (
    <RadioField
      {...omitProps(rest, CHECKED_PROPS)}
      {...(boundProps as RadioProps)}
      ref={forkedRef}
      error={error || errorMessage != null}
      helperText={errorMessage ?? helperText}
    />
  );
});

export const Radio = React.forwardRef<HTMLElement, RadioProps>(function Radio(props, ref) {
  const form = useFormContext();
  const group = React.useContext(RadioGroupContext);
  // Inside a group the GROUP is the field and this Radio is only an option in
  // it. Binding both would put two writers on one form path, and which value
  // survived would depend on handler order.
  //
  // Honest caveat: this guard is currently unobservable. RadioBase wires no
  // onCheckedChange at all on its grouped path — Base UI's RadioGroup drives
  // the selection — so a grouped Radio cannot write the path even without
  // this check, and a mutation test that removes the `group === undefined`
  // clause fails nothing. It stays because it states which component owns the
  // path, and it becomes load-bearing the moment that grouped path gains a
  // change callback.
  if (form && props.name && group === undefined) {
    return <BoundRadio {...props} ref={ref} />;
  }
  return <RadioField {...props} ref={ref} />;
});
