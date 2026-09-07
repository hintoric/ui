import type { JoyColor } from '../../utils/colorVariantClasses';
import type { ColorSchemeLabels } from '../../internal/colorScheme';

export interface ColorSchemeMenuItemsProps {
  /** Partially overrides the English defaults `System` / `Light` / `Dark`. */
  labels?: ColorSchemeLabels;
  color?: JoyColor;
  /** Hides the per-entry icon, leaving text only. */
  icons?: boolean;
}
