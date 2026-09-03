import type * as React from 'react';

export interface AvatarGroupProps extends React.ComponentPropsWithoutRef<'div'> {
  size?: 'sm' | 'md' | 'lg';
}
