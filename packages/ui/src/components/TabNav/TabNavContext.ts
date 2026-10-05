import * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export type TabLook = { variant: JoyVariant; color: JoyColor };

/**
 * Present only inside a `<TabNav>`. A `Tab` that finds it renders as a link
 * marked `aria-current="page"` when its `value` matches, instead of as Base
 * UI's `role="tab"` button — see TabNav.tsx for why.
 *
 * The current Tab also reports its variant/colour, so the indicator — one
 * element under the nav, not part of the tab — can take the tab's colour the
 * way Joy's `::after` takes `currentColor` from it.
 */
export const TabNavContext = React.createContext<{
  value: string | number | null | undefined;
  setCurrentLook: (look: TabLook) => void;
} | null>(null);
