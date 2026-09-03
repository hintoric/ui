import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface AccordionProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color' | 'onChange'> {
  variant?: JoyVariant;
  color?: JoyColor;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onChange?: (event: React.SyntheticEvent | undefined, expanded: boolean) => void;
  disabled?: boolean;
}
