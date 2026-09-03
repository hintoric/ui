'use client';
import * as React from 'react';
import { Divider } from '../Divider';
import type { DividerProps } from '../Divider';

export type ListDividerProps = DividerProps;

// A thin wrapper — Joy UI's own ListDivider is Divider plus a couple of
// List-context defaults (inset, orientation) this v1 doesn't cascade.
export const ListDivider = React.forwardRef<HTMLElement, ListDividerProps>(function ListDivider(props, ref) {
  return <Divider ref={ref} {...props} />;
});
