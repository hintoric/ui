'use client';
import * as React from 'react';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { cx } from '../../utils/cx';
import { buttonVariants } from '../Button/buttonVariants';
import type { MenuButtonProps } from './types';

// Joy UI's MenuButton literally reuses Button's own style formula
// (`getButtonStyles`) — confirmed against @mui/joy's MenuButton.js source —
// so this wrapper reuses the exact same buttonVariants() our own Button
// component uses, defaulting to outlined/neutral/md (Button itself defaults
// to solid/primary/md).
export const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(function MenuButton(
  { variant = 'outlined', color = 'neutral', size = 'md', className, ...props },
  ref,
) {
  return <BaseMenu.Trigger ref={ref} className={cx(buttonVariants({ variant, color, size }), className)} {...props} />;
});
