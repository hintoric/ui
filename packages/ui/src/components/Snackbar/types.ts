import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface SnackbarAnchorOrigin {
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
}

export interface SnackbarProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  open: boolean;
  onClose?: () => void;
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  anchorOrigin?: SnackbarAnchorOrigin;
  autoHideDuration?: number | null;
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
}
