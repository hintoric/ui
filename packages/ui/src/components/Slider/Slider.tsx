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
import type { SliderProps } from './types';

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(function Slider(
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
    className,
    ...props
  },
  ref,
) {
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
