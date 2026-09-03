import type * as React from 'react';

export interface SkeletonProps extends React.ComponentPropsWithoutRef<'span'> {
  variant?: 'text' | 'circular' | 'rectangular' | 'overlay';
  animation?: 'pulse' | 'wave' | false;
  width?: number | string;
  height?: number | string;
}
