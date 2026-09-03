import type * as React from 'react';

export interface AspectRatioProps extends React.ComponentPropsWithoutRef<'div'> {
  ratio?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  objectFit?: React.CSSProperties['objectFit'];
}
