import * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

/**
 * What a group hands down to its Buttons and IconButtons. Mirrors Joy's own
 * `ButtonGroupContext`: Joy's Button.js and IconButton.js resolve each of these
 * as `own prop || group || default`, which is why a Joy `<ToggleButtonGroup>`
 * of bare `<Button>`s renders outlined/neutral rather than Button's own
 * solid/primary default.
 */
export interface ButtonGroupContextValue {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const ButtonGroupContext = React.createContext<ButtonGroupContextValue>({});
