'use client';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { DropdownProps } from './types';

// Joy UI's <Dropdown> is literally a re-export of @mui/base's headless
// Dropdown context provider — it renders no DOM of its own, just lets a
// <MenuButton> and <Menu> anywhere inside it coordinate open state without
// prop-drilling an anchorEl. Base UI's Menu.Root serves the exact same role.
export function Dropdown({ open, defaultOpen, onOpenChange, children }: DropdownProps) {
  return (
    <BaseMenu.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {children}
    </BaseMenu.Root>
  );
}
