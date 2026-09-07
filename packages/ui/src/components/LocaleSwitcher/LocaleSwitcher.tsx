'use client';
import * as React from 'react';
import * as Flags from 'country-flag-icons/react/1x1';
import { Dropdown } from '../Dropdown';
import { Menu } from '../Menu';
import { MenuButton } from '../MenuButton';
import { MenuItem } from '../MenuItem';
import { useLocaleContext } from '../../theme/LocaleProvider';
import type { LocaleOption, LocaleSwitcherProps } from './types';

type FlagComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FLAGS = Flags as unknown as Record<string, FlagComponent | undefined>;

// The 1x1 set, not 3x2: a square flag takes a circular mask cleanly, where a
// 3:2 one would need cropping to avoid an ellipse. Sized with `size-*` so
// width and height stay locked together — a round flag that is off-square
// reads as a mistake rather than a style.
const FLAG_SIZE_CLASS = {
  sm: 'size-4',
  md: 'size-[18px]',
  lg: 'size-5',
} as const;

/**
 * `de-DE` carries its own country; a bare `de` does not, and `en` belongs to
 * no single one. Only an explicit two-letter region subtag counts — a script
 * subtag like `zh-Hant` is four letters and must not be mistaken for one.
 */
function regionOf(locale: LocaleOption): string | undefined {
  if (locale.region) return locale.region.toUpperCase();
  const subtag = locale.value.split(/[-_]/).find((part) => /^[A-Za-z]{2}$/.test(part) && part === part.toUpperCase());
  return subtag?.toUpperCase();
}

function Flag({ locale, size }: { locale: LocaleOption; size: 'sm' | 'md' | 'lg' }) {
  const region = regionOf(locale);
  const Component = region ? FLAGS[region] : undefined;
  if (!Component) return null;
  // Decorative: the label beside it already names the language, so a second
  // announcement would just repeat it.
  return <Component aria-hidden="true" focusable="false" className={`${FLAG_SIZE_CLASS[size]} shrink-0 rounded-full`} />;
}

/**
 * Deliberately knows no i18n library. It takes locales, a value and a change
 * handler — nothing else. Knowing i18next would push that dependency onto
 * every application consuming this library, and a presentation library must
 * not decide what its consumers translate with.
 *
 * Built from Dropdown/MenuButton/Menu/MenuItem rather than Select: a select is
 * a form control with a placeholder and form width, and this belongs in a
 * header corner.
 */
export function LocaleSwitcher({
  locales: localesProp,
  value: valueProp,
  onChange: onChangeProp,
  variant = 'outlined',
  color = 'neutral',
  size = 'sm',
  flags = true,
  ...buttonProps
}: LocaleSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const context = useLocaleContext();

  // Props win over the context, so the switcher stays usable standalone --
  // the docs page puts several independent ones on the same screen.
  const locales = localesProp ?? context?.locales;
  const value = valueProp ?? context?.locale;
  const onChange = onChangeProp ?? context?.setLocale;

  // An empty button over an empty menu is the silent wrong answer; name the
  // missing piece instead.
  if (!locales) {
    throw new Error(
      'LocaleSwitcher: no `locales` given and no LocaleProvider supplies them. ' +
        'Pass a `locales` prop, or set `locales` on LocaleProvider.',
    );
  }
  if (value === undefined) {
    throw new Error(
      'LocaleSwitcher: no `value` given and no LocaleProvider to read the current locale from. ' +
        'Pass a `value` prop, or wrap this in a LocaleProvider.',
    );
  }
  if (!onChange) {
    throw new Error(
      'LocaleSwitcher: no `onChange` given and no LocaleProvider supplies `onLocaleChange`. ' +
        'Pass an `onChange` prop, or set `onLocaleChange` on LocaleProvider.',
    );
  }

  // A browser can report a language the application does not offer. Showing
  // the raw value beats rendering an empty button.
  const current = locales.find((locale) => locale.value === value);

  return (
    <Dropdown open={open} onOpenChange={setOpen}>
      <MenuButton variant={variant} color={color} size={size} {...buttonProps}>
        {flags && current && <Flag locale={current} size={size} />}
        {current ? current.label : value}
      </MenuButton>
      <Menu variant="outlined" color={color} size={size}>
        {locales.map((locale) => (
          <MenuItem
            key={locale.value}
            color={color}
            selected={locale.value === value}
            onClick={() => onChange(locale.value)}
          >
            {flags && <Flag locale={locale} size={size} />}
            {locale.label}
          </MenuItem>
        ))}
      </Menu>
    </Dropdown>
  );
}
