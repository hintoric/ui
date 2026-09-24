'use client';
import * as React from 'react';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { cx } from '../../utils/cx';
import { buttonVariants } from '../Button/buttonVariants';
import { ButtonBody, buttonLoadingClasses } from '../Button/ButtonBody';
import type { MenuButtonProps } from './types';

// Joy UI's MenuButton literally reuses Button's own style formula
// (`getButtonStyles`) — confirmed against @mui/joy's MenuButton.js source —
// so this wrapper reuses the exact same buttonVariants() our own Button
// component uses, defaulting to outlined/neutral/md (Button itself defaults
// to solid/primary/md). It reuses Button's slots too: Joy's MenuButton takes
// `startDecorator`, `endDecorator` and `loading` exactly as Button does, and
// `ButtonBody` is the one place both render them from.
export const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(function MenuButton(
  {
    variant = 'outlined',
    color = 'neutral',
    size = 'md',
    pill = false,
    loading = false,
    disabled,
    startDecorator,
    endDecorator,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <BaseMenu.Trigger
      ref={ref}
      disabled={disabled || loading}
      className={cx(
        buttonVariants({ variant, color, size }),
        pill && 'rounded-full',
        buttonLoadingClasses(loading),
        className,
      )}
      {...props}
    >
      <ButtonBody
        variant={variant}
        color={color}
        loading={loading}
        startDecorator={startDecorator}
        endDecorator={endDecorator}
      >
        {children}
      </ButtonBody>
    </BaseMenu.Trigger>
  );
});
