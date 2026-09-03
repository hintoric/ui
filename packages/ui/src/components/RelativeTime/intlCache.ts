// Memoized Intl.*Format factories, trimmed from
// @github/relative-time-element's src/intl-cache.ts (MIT licensed,
// Copyright (c) GitHub, Inc.) to the three formatter kinds this component
// needs. A plain Map (not upstream's bounded LRU) is enough here: the key
// space is small in practice (a handful of distinct (locale, options)
// combinations per app, not one per rendered element), unlike upstream's
// unbounded-locale web-component context.
class FormatterCache<V> {
  #map = new Map<string, V>();

  get(key: string): V | undefined {
    return this.#map.get(key);
  }

  set(key: string, value: V): void {
    this.#map.set(key, value);
  }
}

function cacheKey(locale: string | undefined, options?: object): string {
  return `${locale ?? ''} ${options ? JSON.stringify(options) : ''}`;
}

const dateTimeFormats = new FormatterCache<Intl.DateTimeFormat>();
export function dateTimeFormat(locale: string | undefined, options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = cacheKey(locale, options);
  let formatter = dateTimeFormats.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormats.set(key, formatter);
  }
  return formatter;
}

const relativeTimeFormats = new FormatterCache<Intl.RelativeTimeFormat>();
export function relativeTimeFormat(
  locale: string | undefined,
  options?: Intl.RelativeTimeFormatOptions,
): Intl.RelativeTimeFormat {
  const key = cacheKey(locale, options);
  let formatter = relativeTimeFormats.get(key);
  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(locale, options);
    relativeTimeFormats.set(key, formatter);
  }
  return formatter;
}

const durationFormats = new FormatterCache<Intl.DurationFormat>();
export function durationFormat(locale: string | undefined, options?: Intl.DurationFormatOptions): Intl.DurationFormat {
  const key = cacheKey(locale, options);
  let formatter = durationFormats.get(key);
  if (!formatter) {
    formatter = new Intl.DurationFormat(locale, options);
    durationFormats.set(key, formatter);
  }
  return formatter;
}
