import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface LocaleOption {
  /** The value handed back to `onChange`. A BCP 47 tag in practice, but not enforced. */
  value: string;
  /** What the user reads. The caller decides whether that is "Deutsch", "German" or "DE". */
  label: React.ReactNode;
  /**
   * ISO 3166-1 alpha-2 country code for the flag, e.g. `AT`. Only needed when
   * the flag should not follow the tag's own region subtag — `de-DE` already
   * resolves to `DE` on its own, but a region-less `de` has nothing to derive
   * from, and `en` deliberately belongs to no single country.
   */
  region?: string;
}

export interface LocaleSwitcherProps
  extends Omit<React.ComponentPropsWithoutRef<'button'>, 'color' | 'onChange' | 'value'> {
  locales: readonly LocaleOption[];
  value: string;
  onChange: (value: string) => void;
  /** Defaults to `outlined`, so the control reads as a control without being asked twice. */
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  /**
   * Show a country flag beside each label. A locale only gets one when a
   * country can be determined — from `region`, or from the tag's own region
   * subtag. `false` turns them off everywhere.
   *
   * @default true
   */
  flags?: boolean;
}
