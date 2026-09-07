/**
 * Drops props that react-hook-form owns for a bound field.
 *
 * A bound field's value lives in the form state, so a `value`/`defaultValue`
 * (or `checked`/`defaultChecked`) passed alongside is ignored rather than
 * fighting it. `value` would be harmless — the bound spread overrides it — but
 * `defaultValue` would survive and React then sees a controlled input that
 * also has a default, which it warns about.
 *
 * Deleting from a copy rather than destructuring into `_unused` bindings,
 * which this repo's eslint config rightly rejects.
 */
export function omitProps<T extends object>(props: T, keys: readonly string[]): T {
  const rest = { ...props } as Record<string, unknown>;
  for (const key of keys) {
    delete rest[key];
  }
  return rest as T;
}

/** For the text and value adapters. */
export const VALUE_PROPS = ['value', 'defaultValue'] as const;

/** For the checked adapter. */
export const CHECKED_PROPS = ['checked', 'defaultChecked'] as const;
