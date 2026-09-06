'use client';
import * as React from 'react';
import { Dropdown } from '../Dropdown';
import { Menu } from '../Menu';
import { MenuButton } from '../MenuButton';
import { MenuItem } from '../MenuItem';
import type { LocaleSwitcherProps } from './types';

/**
 * Deliberately knows no i18n library. It takes locales, a value and a change
 * handler — nothing else. Knowing i18next would push that dependency onto
 * every application consuming this library, and a presentation library must
 * not decide what its consumers translate with.
 *
 * Built from Dropdown/MenuButton/Menu/MenuItem rather than Select: a select is
 * a form control with a placeholder and form width, and this belongs in a
 * header corner.
 */
export function LocaleSwitcher({
  locales,
  value,
  onChange,
  variant = 'plain',
  color = 'neutral',
  size = 'sm',
  'aria-label': ariaLabel,
}: LocaleSwitcherProps) {
  const [open, setOpen] = React.useState(false);

  // A browser can report a language the application does not offer. Showing
  // the raw value beats rendering an empty button.
  const current = locales.find((locale) => locale.value === value);

  return (
    <Dropdown open={open} onOpenChange={setOpen}>
      <MenuButton variant={variant} color={color} size={size} aria-label={ariaLabel}>
        {current ? current.label : value}
      </MenuButton>
      <Menu variant="outlined" color={color} size={size}>
        {locales.map((locale) => (
          <MenuItem
            key={locale.value}
            color={color}
            selected={locale.value === value}
            onClick={() => onChange(locale.value)}
          >
            {locale.label}
          </MenuItem>
        ))}
      </Menu>
    </Dropdown>
  );
}
