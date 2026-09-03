import type * as React from 'react';

export interface BreadcrumbsProps extends React.ComponentPropsWithoutRef<'nav'> {
  size?: 'sm' | 'md' | 'lg';
  separator?: React.ReactNode;
}
