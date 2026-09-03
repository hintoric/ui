import type * as React from 'react';

export interface AccordionGroupProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Hides the divider Joy UI otherwise draws between accordion items. @default false */
  disableDivider?: boolean;
}
