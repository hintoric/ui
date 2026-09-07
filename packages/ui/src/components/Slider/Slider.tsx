'use client';
import * as React from 'react';
import { Slider as BaseSlider } from '@base-ui/react/slider';
import { cx } from '../../utils/cx';
import {
  SLIDER_INDICATOR_CLASSES,
  SLIDER_THUMB_CLASSES,
  SLIDER_TRACK_SIZE_CLASS,
  SLIDER_TRACK_WIDTH_CLASS,
  SLIDER_THUMB_SIZE_CLASS,
} from './sliderVariants';
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
import type { SliderProps } from './types';

const SliderBase = React.forwardRef<HTMLDivElement, SliderProps>(function SliderBase(
  {
    variant = 'solid',
    color = 'primary',
    size = 'md',
    orientation = 'horizontal',
    disabled = false,
    min = 0,
    max = 100,
    step = 1,
    track = true,
    value,
    defaultValue,
    onChange,
    onChangeCommitted,
    name,
    error,
    className,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref,
) {
  const formControl = React.useContext(FormControlContext);
  const hasError = error ?? formControl?.error ?? false;
  // hasError deliberately does NOT recolour the track or thumb. Joy's Slider
  // is the one field component that reads no FormControl context at all
  // (grep formControl in @mui/joy's Slider.js: zero hits), so a Joy slider in
  // an error state looks exactly like a valid one. Inventing a danger slider
  // here would be a divergence, not a fix — the error shows through the
  // helper text and aria-invalid instead.
  const activeValue = value ?? defaultValue;
  const thumbCount = Array.isArray(activeValue) ? activeValue.length : 1;
  const isVertical = orientation === 'vertical';

  return (
    <BaseSlider.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onChange as (value: number | readonly number[]) => void}
      onValueCommitted={onChangeCommitted as (value: number | readonly number[]) => void}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      orientation={orientation}
      name={name}
    >
      <BaseSlider.Control
        ref={ref}
        className={cx(
          'relative box-border inline-flex touch-none select-none items-center',
          isVertical ? 'h-full w-[42px] flex-col justify-center' : 'h-[42px] w-full',
          disabled && 'pointer-events-none opacity-60',
          className,
        )}
        {...props}
      >
        <BaseSlider.Track
          className={cx(
            'rounded-[42px] bg-surface-2',
            isVertical ? cx('h-full', SLIDER_TRACK_WIDTH_CLASS[size]) : cx('w-full', SLIDER_TRACK_SIZE_CLASS[size]),
          )}
        >
          {track && (
            <BaseSlider.Indicator
              className={cx('rounded-[42px]', SLIDER_INDICATOR_CLASSES[variant][color])}
            />
          )}
        </BaseSlider.Track>
        {Array.from({ length: thumbCount }, (_, index) => (
          <BaseSlider.Thumb
            key={index}
            index={index}
            // All three aria attributes live on the thumb, not on the control
            // div around it: Base UI renders the thumb as the element carrying
            // role="slider", so that is what assistive technology announces —
            // the same place aria-invalid and aria-describedby sit on an
            // <input> for every other field here.
            aria-labelledby={ariaLabelledBy}
            aria-invalid={hasError || undefined}
            aria-describedby={ariaDescribedBy}
            className={cx(
              'flex items-center justify-center border-2 outline-none transition-colors focus-visible:ring-4 focus-visible:ring-primary-500/30',
              SLIDER_THUMB_SIZE_CLASS[size],
              SLIDER_THUMB_CLASSES[variant][color],
            )}
          />
        ))}
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
});

const SliderField = React.forwardRef<HTMLDivElement, SliderProps>(function SliderField(
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
      disabled={props.disabled}
      id={id}
      helperId={helperId}
      labelId={labelId}
    >
      <SliderBase
        ref={ref}
        id={id}
        error={error}
        aria-labelledby={label != null ? labelId : undefined}
        aria-describedby={helperId}
        {...props}
      />
    </FieldShell>
  );
});

// react-hook-form's setFocus and its focus-on-first-error jump both need the
// real focusable node, and Slider's ref points at Slider.Control (a div) while
// the focusable element is the thumb inside it. Focus-on-error therefore does
// not reach a Slider — a documented limit rather than a reason to bend Base
// UI's structure, since a slider is rarely the field a validation fails on.
const BoundSlider = React.forwardRef<HTMLDivElement, SliderProps>(function BoundSlider(
  { name, onChange, error, helperText, ...rest },
  ref,
) {
  const { fieldProps, errorMessage } = useBoundField(name!, valueAdapter, { onChange });
  const { ref: fieldRef, ...boundProps } = fieldProps as { ref: React.Ref<HTMLDivElement> };
  const forkedRef = useForkRef(ref, fieldRef);
  return (
    <SliderField
      {...omitProps(rest, VALUE_PROPS)}
      {...(boundProps as SliderProps)}
      ref={forkedRef}
      error={error || errorMessage != null}
      helperText={errorMessage ?? helperText}
    />
  );
});

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(function Slider(props, ref) {
  const form = useFormContext();
  if (form && props.name) {
    return <BoundSlider {...props} ref={ref} />;
  }
  return <SliderField {...props} ref={ref} />;
});
