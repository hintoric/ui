import * as React from 'react';

/**
 * Present only inside a `<TabNav>`. A `Tab` that finds it renders as a link
 * marked `aria-current="page"` when its `value` matches, instead of as Base
 * UI's `role="tab"` button — see TabNav.tsx for why. The indicator colour
 * travels through `TabIndicatorContext`, as it does for `TabList`.
 */
export const TabNavContext = React.createContext<{
  value: string | number | null | undefined;
} | null>(null);
