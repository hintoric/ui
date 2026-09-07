import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';
// Defined next to the provider that also needs it: `theme/` does not depend on
// `components/`, the same direction in which `HourCycle` already lives.
import type { LocaleOption } from '../../theme/LocaleProvider';

export type { LocaleOption };

export interface LocaleSwitcherProps
  extends Omit<React.ComponentPropsWithoutRef<'button'>, 'color' | 'onChange' | 'value'> {
  /**
   * The offered languages. Falls back to the `locales` of an enclosing
   * `LocaleProvider`; one of the two must supply them.
   */
  locales?: readonly LocaleOption[];
  /** The current language. Falls back to the `LocaleProvider`'s `locale`. */
  value?: string;
  /** Falls back to the `LocaleProvider`'s `onLocaleChange`. */
  onChange?: (value: string) => void;
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
