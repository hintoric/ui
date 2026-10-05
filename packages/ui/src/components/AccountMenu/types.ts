import type * as React from 'react';
import type { ColorSchemeLabels } from '../../internal/colorScheme';
import type { LocaleOption } from '../../theme/LocaleProvider';
import type { FloatingBarProps } from '../FloatingBar';

export interface AccountMenuUser {
  /** Shown on the card, and the source of the avatar's letter when there is no `name`. */
  email: string;
  /** Shown above the address when given; its first letter goes on the avatar. */
  name?: string;
  /** A picture for both avatars instead of the letter. */
  avatarSrc?: string;
}

/**
 * English defaults, each one overridable on its own. The component ships no
 * translations and knows no i18n library — the line LocaleSwitcher draws.
 */
export interface AccountMenuLabels {
  /** Accessible name of the bar and of the menu button. @default 'Account' */
  menu?: string;
  /** @default 'Appearance' */
  appearance?: React.ReactNode;
  /** @default 'Language' */
  language?: React.ReactNode;
  /** Accessible name of a sub-view's first row, which leads back. @default 'Back' */
  back?: string;
  /** @default 'Sign out' */
  signOut?: React.ReactNode;
  /** The three appearance entries; `System` / `Light` / `Dark` by default. */
  colorScheme?: ColorSchemeLabels;
}

export interface AccountMenuProps extends Omit<FloatingBarProps, 'children' | 'orientation'> {
  user: AccountMenuUser;
  /** Second line of the card — a workspace, a tenant, a plan. */
  subtitle?: React.ReactNode;
  labels?: AccountMenuLabels;
  /** Adds the sign-out row at the foot of the menu. Without it there is none. */
  onSignOut?: () => void;
  /** Disables the sign-out row, for while a sign-out is under way. */
  signingOut?: boolean;
  /**
   * Your own `MenuItem`s, between the settings and the sign-out row. They
   * close the menu on click like any other item.
   */
  items?: React.ReactNode;
  /**
   * Offers the appearance view, which needs a `ColorSchemeProvider` above.
   *
   * @default true
   */
  appearance?: boolean;
  /**
   * The offered languages. Falls back to an enclosing `LocaleProvider`. The
   * language view appears only when languages, the current one and a change
   * handler are all known.
   */
  locales?: readonly LocaleOption[];
  /** The current language. Falls back to the `LocaleProvider`'s `locale`. */
  locale?: string;
  /** Falls back to the `LocaleProvider`'s `onLocaleChange`. */
  onLocaleChange?: (locale: string) => void;
  /** Show a flag beside each language, as LocaleSwitcher does. @default true */
  flags?: boolean;
}
