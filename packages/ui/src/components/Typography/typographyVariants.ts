import { cva } from 'class-variance-authority';
import type * as React from 'react';
import type { TypographyLevel } from './types';

export const typographyVariants = cva('font-body', {
  variants: {
    level: {
      h1: 'text-4xl font-bold leading-[1.33334] tracking-tight text-ink-primary',
      h2: 'text-3xl font-bold leading-[1.33334] tracking-tight text-ink-primary',
      h3: 'text-2xl font-semibold leading-[1.33334] tracking-tight text-ink-primary',
      h4: 'text-xl font-semibold leading-normal tracking-tight text-ink-primary',
      'title-lg': 'text-lg font-semibold leading-[1.33334] text-ink-primary',
      'title-md': 'text-base font-medium leading-normal text-ink-primary',
      'title-sm': 'text-sm font-medium leading-[1.42858] text-ink-primary',
      'body-lg': 'text-lg leading-normal text-ink-secondary',
      'body-md': 'text-base leading-normal text-ink-secondary',
      'body-sm': 'text-sm leading-normal text-ink-tertiary',
      'body-xs': 'text-xs font-medium leading-normal text-ink-tertiary',
    },
  },
  defaultVariants: { level: 'body-md' },
});

export const TYPOGRAPHY_DEFAULT_TAG: Record<TypographyLevel, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  'title-lg': 'p',
  'title-md': 'p',
  'title-sm': 'p',
  'body-lg': 'p',
  'body-md': 'p',
  'body-sm': 'p',
  'body-xs': 'span',
};
