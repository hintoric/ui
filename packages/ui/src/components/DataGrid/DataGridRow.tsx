'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import type { DataGridRowProps } from './types';

export const DataGridRow = React.forwardRef<HTMLTableRowElement, DataGridRowProps>(function DataGridRow(
  { className, ...props },
  ref,
) {
  return <tr ref={ref} className={cx(className)} {...props} />;
});
