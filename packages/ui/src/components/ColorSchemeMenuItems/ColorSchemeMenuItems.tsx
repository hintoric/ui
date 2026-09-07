'use client';
import { MenuItem } from '../MenuItem';
import { useColorScheme } from '../../theme/ColorSchemeProvider';
import {
  COLOR_SCHEME_ICONS,
  COLOR_SCHEME_MODES,
  ICON_SIZE_CLASS,
  resolveColorSchemeLabels,
} from '../../internal/colorScheme';
import type { ColorSchemeMenuItemsProps } from './types';

/**
 * The three entries without a trigger or a popup, for applications that
 * already have a user menu or a drawer and do not want a second button beside
 * it. The enclosing `Menu` belongs to the caller.
 *
 * A fragment is safe here, and that is checked rather than assumed: `Menu`
 * hands `children` straight to `BaseMenu.Popup` without `React.Children.map`
 * or `cloneElement`. A host that clones its children — `ToggleButtonGroup`
 * does — would apply those clones to the fragment instead of the entries.
 */
export function ColorSchemeMenuItems({
  labels,
  color = 'neutral',
  icons = true,
}: ColorSchemeMenuItemsProps) {
  const { mode, setMode } = useColorScheme();
  const resolved = resolveColorSchemeLabels(labels);

  return (
    <>
      {COLOR_SCHEME_MODES.map((entry) => {
        const Icon = COLOR_SCHEME_ICONS[entry];
        return (
          <MenuItem
            key={entry}
            color={color}
            // `mode`, not `resolvedMode`: the tick belongs beside what the
            // user chose, so "System" stays ticked while it resolves to dark.
            selected={entry === mode}
            onClick={() => setMode(entry)}
          >
            {icons && <Icon className={`${ICON_SIZE_CLASS.sm} shrink-0`} />}
            {resolved[entry]}
          </MenuItem>
        );
      })}
    </>
  );
}
