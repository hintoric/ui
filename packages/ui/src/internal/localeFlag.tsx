import type * as React from 'react';
import * as Flags from 'country-flag-icons/react/1x1';
import type { LocaleOption } from '../theme/LocaleProvider';

// Shared by LocaleSwitcher and AccountMenu's language view, so a language
// shows the same flag wherever it is offered.

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

export function LocaleFlag({ locale, size }: { locale: LocaleOption; size: 'sm' | 'md' | 'lg' }) {
  const region = regionOf(locale);
  const Component = region ? FLAGS[region] : undefined;
  if (!Component) return null;
  // Decorative: the label beside it already names the language, so a second
  // announcement would just repeat it.
  return <Component aria-hidden="true" focusable="false" className={`${FLAG_SIZE_CLASS[size]} shrink-0 rounded-full`} />;
}
