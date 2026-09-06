import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface LocaleOption {
  /** The value handed back to `onChange`. A BCP 47 tag in practice, but not enforced. */
  value: string;
  /** What the user reads. The caller decides whether that is "Deutsch", "German" or "DE". */
  label: React.ReactNode;
}

export interface LocaleSwitcherProps {
  locales: readonly LocaleOption[];
  value: string;
  onChange: (value: string) => void;
  /** Defaults to `plain`: the usual home for this control is a header corner. */
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  'aria-label'?: string;
}
