'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { STATIC_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import { TABLE_SIZE_CLASS, TABLE_HEAD_CLASS, TABLE_BORDER_AXIS_CLASS } from './tableVariants';
import type { TableProps } from './types';

export const Table = React.forwardRef<HTMLTableElement, TableProps>(function Table(
  {
    variant = 'plain',
    color = 'neutral',
    size = 'md',
    borderAxis = 'xBetween',
    hoverRow = false,
    noWrap = false,
    stickyHeader = false,
    className,
    ...props
  },
  ref,
) {
  return (
    <table
      ref={ref}
      className={cx(
        'w-full table-fixed rounded-md font-body [border-collapse:separate] [border-spacing:0]',
        TABLE_SIZE_CLASS[size],
        TABLE_HEAD_CLASS,
        TABLE_BORDER_AXIS_CLASS[borderAxis],
        STATIC_COLOR_CLASSES[variant][color],
        noWrap && '[&_td]:overflow-hidden [&_td]:text-ellipsis [&_td]:whitespace-nowrap',
        hoverRow && '[&_tbody_tr:hover]:bg-surface-3',
        stickyHeader && '[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10',
        className,
      )}
      {...props}
    />
  );
});
