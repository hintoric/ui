import * as React from 'react';

/**
 * Selection state a ToggleButtonGroup shares with its buttons. Through context
 * rather than `cloneElement`, as in Joy, so a button wrapped in something (a
 * Tooltip, say) still toggles and still renders pressed.
 */
export interface ToggleButtonGroupContextValue {
  value: readonly unknown[];
  onClick: (event: React.MouseEvent<HTMLButtonElement>, value: unknown) => void;
}

export const ToggleButtonGroupContext = React.createContext<ToggleButtonGroupContextValue | undefined>(undefined);
