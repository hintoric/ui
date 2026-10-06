import type { ColorSchemeMode } from '../../theme/ColorSchemeProvider';
import type { JoyColor } from '../../utils/colorVariantClasses';
import type { ColorSchemeLabels } from '../../internal/colorScheme';

export interface ColorSchemeMenuItemsProps {
  /** Partially overrides the English defaults `System` / `Light` / `Dark`. */
  labels?: ColorSchemeLabels;
  color?: JoyColor;
  /** Hides the per-entry icon, leaving text only. */
  icons?: boolean;
  /**
   * Whether choosing an entry closes the enclosing menu. Turn it off when the
   * menu should stay and show the new choice — a settings sub-view, say.
   *
   * @default true
   */
  closeOnClick?: boolean;
  /** Called after an entry has set the mode, with the mode it set. */
  onModeChange?: (mode: ColorSchemeMode) => void;
}
