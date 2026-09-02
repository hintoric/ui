import type * as React from 'react';

export type TypographyLevel =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'title-lg'
  | 'title-md'
  | 'title-sm'
  | 'body-lg'
  | 'body-md'
  | 'body-sm'
  | 'body-xs';

export interface TypographyProps extends Omit<React.ComponentPropsWithoutRef<'p'>, 'color'> {
  component?: React.ElementType;
  level?: TypographyLevel;
}
