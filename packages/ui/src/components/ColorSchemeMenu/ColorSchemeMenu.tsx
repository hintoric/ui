'use client';
import * as React from 'react';
import { Dropdown } from '../Dropdown';
import { Menu } from '../Menu';
import { MenuButton } from '../MenuButton';
import { ColorSchemeMenuItems } from '../ColorSchemeMenuItems';
import { useColorScheme } from '../../theme/ColorSchemeProvider';
import { COLOR_SCHEME_ICONS, ICON_SIZE_CLASS, resolveColorSchemeLabels } from '../../internal/colorScheme';
import type { ColorSchemeMenuProps } from './types';

/**
 * The recommended form for anything that does not have to be extremely
 * compact: a trigger showing the current mode, and three named entries behind
 * it. Named and directly reachable, where `ColorSchemeToggle` makes the user
 * click through unlabelled stops to find what they want.
 *
 * Built from Dropdown/MenuButton/Menu, exactly like LocaleSwitcher — and the
 * trigger carries the icon *and* the label, because a discoverable form that
 * hides its current state behind a glyph gives up the thing it exists for.
 * For an icon-only control, use `ColorSchemeToggle`.
 */
export function ColorSchemeMenu({
  variant = 'outlined',
  color = 'neutral',
  size = 'sm',
  labels,
  ...buttonProps
}: ColorSchemeMenuProps) {
  const [open, setOpen] = React.useState(false);
  const { mode } = useColorScheme();
  const resolved = resolveColorSchemeLabels(labels);
  const Icon = COLOR_SCHEME_ICONS[mode];

  return (
    <Dropdown open={open} onOpenChange={setOpen}>
      <MenuButton variant={variant} color={color} size={size} {...buttonProps}>
        <Icon className={`${ICON_SIZE_CLASS[size]} shrink-0`} />
        {resolved[mode]}
      </MenuButton>
      <Menu variant="outlined" color={color} size={size}>
        <ColorSchemeMenuItems labels={labels} color={color} />
      </Menu>
    </Dropdown>
  );
}
