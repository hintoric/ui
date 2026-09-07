# LocaleProvider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One source for the display language, so `<LocaleSwitcher />` and `<RelativeTime />` stop disagreeing.

**Architecture:** A stateless `LocaleProvider` in `src/theme/` mirrors a required `locale` prop into
context (i18next owns the value, not us). `useDateTimeDefaults` resolves the precedence chain in one
place, so `RelativeTime.tsx` needs no change at all. `LocaleSwitcher`'s `locales`/`value`/`onChange`
become optional and fall back to that context — purely additive, nothing existing breaks.

**Tech Stack:** React 19 context, TypeScript, Vitest + Testing Library (jsdom), Changesets.

**Spec:** `docs/superpowers/specs/2026-09-07-locale-provider-design.md`

## Global Constraints

- **Precedence, exactly:** `prop on the component` > `DateTimeProvider.locale` > `LocaleProvider.locale` > runtime default.
- **No state in the provider.** No `useState`, no `localStorage`, no browser-language detection. `locale` is a required prop; the provider mirrors it.
- **No i18n library.** `@hintoric/ui` must not import or reference i18next, react-intl or any other. The application wires them together.
- **Additive only.** No existing call site of `LocaleSwitcher` or `DateTimeProvider` may break. The changeset is `minor`.
- **`theme/` must not import from `components/`.** The dependency runs the other way (`HourCycle` already lives in `theme/DateTimeProvider`).
- **Every file starts with `'use client';`** where it defines a context or a hook, matching `ColorSchemeProvider.tsx` and `DateTimeProvider.tsx`.
- **Run tests from `packages/ui/`:** `pnpm test`. Typecheck and lint from the repo root: `pnpm typecheck`, `pnpm lint`.
- No new visual regression tests: providers have no appearance, and the switcher's appearance does not change.

---

### Task 1: LocaleProvider, useLocale and the LocaleOption move

**Files:**
- Create: `packages/ui/src/theme/LocaleProvider.tsx`
- Create: `packages/ui/src/theme/LocaleProvider.test.tsx`
- Modify: `packages/ui/src/components/LocaleSwitcher/types.ts` (drop the `LocaleOption` definition, re-export it)
- Modify: `packages/ui/src/index.ts` (add the provider exports; **remove `LocaleOption` from the LocaleSwitcher export line**)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `LocaleOption` — `{ value: string; label: React.ReactNode; region?: string }`
  - `LocaleContextValue` — `{ locale: string; setLocale: ((locale: string) => void) | undefined; locales: readonly LocaleOption[] | undefined }`
  - `LocaleProviderProps` — `{ children: React.ReactNode; locale: string; onLocaleChange?: (locale: string) => void; locales?: readonly LocaleOption[] }`
  - `LocaleProvider(props: LocaleProviderProps)` — component
  - `useLocale(): LocaleContextValue` — throws outside a provider
  - `useLocaleContext(): LocaleContextValue | undefined` — package-internal, never exported from `index.ts`. Tasks 2 and 3 both use this one.

- [ ] **Step 1: Write the failing test**

Create `packages/ui/src/theme/LocaleProvider.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider, useLocale } from './LocaleProvider';

const locales = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'English' },
];

function Consumer() {
  const { locale, setLocale, locales: offered } = useLocale();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="has-setter">{String(Boolean(setLocale))}</span>
      <span data-testid="locales">
        {offered ? offered.map((option) => option.value).join(',') : 'undefined'}
      </span>
      <button onClick={() => setLocale?.('en')}>switch</button>
    </div>
  );
}

describe('LocaleProvider', () => {
  it('provides locale, setLocale and locales to descendants', () => {
    render(
      <LocaleProvider locale="de" onLocaleChange={vi.fn()} locales={locales}>
        <Consumer />
      </LocaleProvider>,
    );

    expect(screen.getByTestId('locale')).toHaveTextContent('de');
    expect(screen.getByTestId('has-setter')).toHaveTextContent('true');
    expect(screen.getByTestId('locales')).toHaveTextContent('de,en');
  });

  it('hands the chosen value to onLocaleChange', async () => {
    const user = userEvent.setup();
    const onLocaleChange = vi.fn();
    render(
      <LocaleProvider locale="de" onLocaleChange={onLocaleChange} locales={locales}>
        <Consumer />
      </LocaleProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'switch' }));

    expect(onLocaleChange).toHaveBeenCalledWith('en');
  });

  it('leaves setLocale undefined when no onLocaleChange is given', () => {
    render(
      <LocaleProvider locale="de">
        <Consumer />
      </LocaleProvider>,
    );

    // A read-only source is a real case: an app that wants RelativeTime in
    // German without offering a switcher should not have to invent a no-op.
    expect(screen.getByTestId('has-setter')).toHaveTextContent('false');
  });

  it('leaves locales undefined when none are given', () => {
    render(
      <LocaleProvider locale="de">
        <Consumer />
      </LocaleProvider>,
    );

    expect(screen.getByTestId('locales')).toHaveTextContent('undefined');
  });

  it('throws a clear error when useLocale is used outside the provider', () => {
    function Bad() {
      useLocale();
      return null;
    }
    expect(() => render(<Bad />)).toThrow('useLocale must be used within a LocaleProvider');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- LocaleProvider`
Expected: FAIL — `Failed to resolve import "./LocaleProvider"`.

- [ ] **Step 3: Write the implementation**

Create `packages/ui/src/theme/LocaleProvider.tsx`:

```tsx
'use client';
import * as React from 'react';

export interface LocaleOption {
  /** The value handed back to `onLocaleChange`. A BCP 47 tag in practice, but not enforced. */
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

export interface LocaleContextValue {
  locale: string;
  /** `undefined` when the provider got no `onLocaleChange` — then it is a read-only source. */
  setLocale: ((locale: string) => void) | undefined;
  /** `undefined` when the provider got no `locales`. */
  locales: readonly LocaleOption[] | undefined;
}

const LocaleContext = React.createContext<LocaleContextValue | undefined>(undefined);

export interface LocaleProviderProps {
  children: React.ReactNode;
  /** The current language. Required — this provider mirrors, it does not own. */
  locale: string;
  onLocaleChange?: (locale: string) => void;
  locales?: readonly LocaleOption[];
}

/*
 * Deliberately stateless, unlike ColorSchemeProvider. The colour scheme has no
 * owner outside this library; the language does -- in the consuming
 * applications i18next already holds it, with detection, persistence and the
 * loading of translation files. A second copy here would not be one source of
 * truth but a third party to the argument, drifting apart the moment i18next
 * changes the language for a reason other than the switcher.
 */
export function LocaleProvider({ children, locale, onLocaleChange, locales }: LocaleProviderProps) {
  const value = React.useMemo<LocaleContextValue>(
    () => ({ locale, setLocale: onLocaleChange, locales }),
    [locale, onLocaleChange, locales],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = React.useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

/**
 * The non-throwing read of the same context, for components that have to keep
 * working without a provider: `RelativeTime` falls back to the runtime
 * default, `LocaleSwitcher` to its own props. Package-internal — not exported
 * from `index.ts`.
 */
export function useLocaleContext(): LocaleContextValue | undefined {
  return React.useContext(LocaleContext);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- LocaleProvider`
Expected: PASS, 5 tests.

- [ ] **Step 5: Move `LocaleOption` out of the switcher's types**

`theme/` must not import from `components/`, so the type moves and the old home re-exports it. Replace the whole `LocaleOption` interface in `packages/ui/src/components/LocaleSwitcher/types.ts` (its first `export interface LocaleOption { … }` block, including the doc comments) with a re-export, and add the import at the top of the file:

```ts
import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';
// Defined next to the provider that also needs it: `theme/` does not depend on
// `components/`, the same direction in which `HourCycle` already lives.
import type { LocaleOption } from '../../theme/LocaleProvider';

export type { LocaleOption };
```

Leave `LocaleSwitcherProps` and `components/LocaleSwitcher/index.ts` untouched.

- [ ] **Step 6: Export from the package**

In `packages/ui/src/index.ts`, add directly below the `ColorSchemeProvider` export block:

```ts
export { LocaleProvider, useLocale } from './theme/LocaleProvider';
export type { LocaleContextValue, LocaleOption, LocaleProviderProps } from './theme/LocaleProvider';
```

Then find the existing LocaleSwitcher line and **remove `LocaleOption` from it**, or TypeScript fails with "Module has already exported a member named 'LocaleOption'":

```ts
// before
export type { LocaleOption, LocaleSwitcherProps } from './components/LocaleSwitcher';
// after
export type { LocaleSwitcherProps } from './components/LocaleSwitcher';
```

The name and shape a consumer sees are unchanged; only the file it comes from moved.

- [ ] **Step 7: Verify the whole suite and the types**

Run: `pnpm --filter @hintoric/ui test`
Expected: PASS, no regressions.

Run: `pnpm typecheck` (from the repo root — it builds the library first)
Expected: PASS. A duplicate-export error here means Step 6's removal was missed.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/theme/LocaleProvider.tsx packages/ui/src/theme/LocaleProvider.test.tsx packages/ui/src/components/LocaleSwitcher/types.ts packages/ui/src/index.ts
git commit -m "Add a LocaleProvider that mirrors the application's language"
```

---

### Task 2: The precedence chain in useDateTimeDefaults

**Files:**
- Modify: `packages/ui/src/theme/DateTimeProvider.tsx:28-30` (the `useDateTimeDefaults` body)
- Test: `packages/ui/src/components/RelativeTime/RelativeTime.test.tsx` (append three tests inside the existing `describe('RelativeTime', …)`)
- Test: `packages/ui/src/theme/DateTimeProvider.test.tsx` (append three tests that check the chain in the hook itself)

**Interfaces:**
- Consumes: `useLocaleContext()` and `LocaleProvider` from Task 1.
- Produces: `useDateTimeDefaults()` keeps its signature `(): DateTimeContextValue`, but its `locale` field now falls back to the `LocaleProvider`. `RelativeTime.tsx` is **not** modified — that is the point of putting the chain here.

- [ ] **Step 1: Write the failing tests**

First the behavioural ones. Add to the import block at the top of `packages/ui/src/components/RelativeTime/RelativeTime.test.tsx`:

```tsx
import { LocaleProvider } from '../../theme/LocaleProvider';
```

Append these four tests inside the existing `describe('RelativeTime', …)` block, next to the two `DateTimeProvider` tests that are already there:

```tsx
  it('reads the locale from LocaleProvider when no DateTimeProvider is mounted', () => {
    render(
      <LocaleProvider locale="de-DE">
        <RelativeTime date="2026-09-01T12:00:00Z" />
      </LocaleProvider>,
    );
    expect(screen.getByText('vor 3 Tagen')).toBeInTheDocument();
  });

  it("DateTimeProvider's locale wins over LocaleProvider's", () => {
    // The narrower scope wins: "the UI is English but dates are German" is a
    // deliberate choice and must not be overwritten by the app-wide language.
    render(
      <LocaleProvider locale="en">
        <DateTimeProvider locale="de-DE">
          <RelativeTime date="2026-09-01T12:00:00Z" />
        </DateTimeProvider>
      </LocaleProvider>,
    );
    expect(screen.getByText('vor 3 Tagen')).toBeInTheDocument();
  });

  it('an explicit prop wins over both providers', () => {
    render(
      <LocaleProvider locale="de-DE">
        <DateTimeProvider locale="ja-JP">
          <RelativeTime date="2026-09-01T12:00:00Z" locale="en" />
        </DateTimeProvider>
      </LocaleProvider>,
    );
    expect(screen.getByText('3 days ago')).toBeInTheDocument();
  });

```

Then add to `packages/ui/src/theme/DateTimeProvider.test.tsx` — the chain is resolved in the hook, so
it is checked there exactly rather than through a localised month name. Add the import:

```tsx
import { LocaleProvider } from './LocaleProvider';
```

and these three cases inside the existing `describe('DateTimeProvider', …)`:

```tsx
  it('falls back to the LocaleProvider for the locale', () => {
    render(
      <LocaleProvider locale="de-DE">
        <Consumer />
      </LocaleProvider>,
    );
    const defaults = JSON.parse(screen.getByTestId('defaults').textContent!);
    expect(defaults.locale).toBe('de-DE');
  });

  it('takes only the locale from the LocaleProvider, never timeZone or hourCycle', () => {
    render(
      <LocaleProvider locale="de-DE">
        <Consumer />
      </LocaleProvider>,
    );
    const defaults = JSON.parse(screen.getByTestId('defaults').textContent!);
    expect(defaults).toEqual({ locale: 'de-DE' });
  });

  it("its own locale wins over the LocaleProvider's", () => {
    render(
      <LocaleProvider locale="en">
        <DateTimeProvider locale="de-DE" timeZone="Asia/Tokyo">
          <Consumer />
        </DateTimeProvider>
      </LocaleProvider>,
    );
    const defaults = JSON.parse(screen.getByTestId('defaults').textContent!);
    expect(defaults).toEqual({ locale: 'de-DE', timeZone: 'Asia/Tokyo' });
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @hintoric/ui test -- RelativeTime DateTimeProvider`
Expected: FAIL, six new failures. The first renders `3 days ago` (the runtime default) where `vor 3 Tagen` was expected; the hook-level ones report `locale: undefined`.

- [ ] **Step 3: Write the implementation**

In `packages/ui/src/theme/DateTimeProvider.tsx`, add the import below the existing `import * as React from 'react';`:

```tsx
import { useLocaleContext } from './LocaleProvider';
```

and replace the whole `useDateTimeDefaults` function:

```tsx
// The precedence chain lives here, not in the components:
//   prop > DateTimeProvider.locale > LocaleProvider.locale > runtime default.
// The narrower scope wins, so an explicit DateTimeProvider locale ("the UI is
// English but dates are German") survives an app-wide language. Keeping it in
// one place means every future date/time component inherits it for free.
export function useDateTimeDefaults(): DateTimeContextValue {
  const dateTime = React.useContext(DateTimeContext) ?? {};
  const localeContext = useLocaleContext();
  return { ...dateTime, locale: dateTime.locale ?? localeContext?.locale };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @hintoric/ui test -- RelativeTime DateTimeProvider`
Expected: PASS.

Note the existing `DateTimeProvider.test.tsx` case `useDateTimeDefaults returns {} when no provider is mounted` still passes and needs no edit: the return is now `{ locale: undefined }`, and `JSON.stringify` drops undefined fields, so the rendered text is still `{}`.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/theme/DateTimeProvider.tsx packages/ui/src/theme/DateTimeProvider.test.tsx packages/ui/src/components/RelativeTime/RelativeTime.test.tsx
git commit -m "Fall back to the LocaleProvider's language for date and time formatting"
```

---

### Task 3: LocaleSwitcher reads the provider

**Files:**
- Modify: `packages/ui/src/components/LocaleSwitcher/LocaleSwitcher.tsx`
- Modify: `packages/ui/src/components/LocaleSwitcher/types.ts` (make three props optional)
- Test: `packages/ui/src/components/LocaleSwitcher/LocaleSwitcher.test.tsx` (append to the existing `describe`)

**Interfaces:**
- Consumes: `useLocaleContext()` and `LocaleProvider` from Task 1.
- Produces: `LocaleSwitcherProps` with `locales?`, `value?` and `onChange?` optional. Nothing later depends on it.

- [ ] **Step 1: Write the failing tests**

Add to the imports at the top of `packages/ui/src/components/LocaleSwitcher/LocaleSwitcher.test.tsx`:

```tsx
import { LocaleProvider } from '../../theme/LocaleProvider';
```

Append inside the existing `describe('LocaleSwitcher', …)`:

```tsx
  it('needs no props at all inside a LocaleProvider', async () => {
    const user = userEvent.setup();
    const onLocaleChange = vi.fn();
    render(
      <LocaleProvider locale="de" onLocaleChange={onLocaleChange} locales={locales}>
        <LocaleSwitcher />
      </LocaleProvider>,
    );

    expect(screen.getByRole('button')).toHaveTextContent('Deutsch');

    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByText('English'));

    expect(onLocaleChange).toHaveBeenCalledWith('en');
  });

  it('an explicit value prop wins over the provider', () => {
    render(
      <LocaleProvider locale="de" onLocaleChange={vi.fn()} locales={locales}>
        <LocaleSwitcher value="en" />
      </LocaleProvider>,
    );

    expect(screen.getByRole('button')).toHaveTextContent('English');
  });

  it('an explicit onChange prop wins over the provider', async () => {
    const user = userEvent.setup();
    const onLocaleChange = vi.fn();
    const onChange = vi.fn();
    render(
      <LocaleProvider locale="de" onLocaleChange={onLocaleChange} locales={locales}>
        <LocaleSwitcher onChange={onChange} />
      </LocaleProvider>,
    );

    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByText('English'));

    expect(onChange).toHaveBeenCalledWith('en');
    expect(onLocaleChange).not.toHaveBeenCalled();
  });

  it('an explicit locales prop wins over the provider', async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider locale="de" onLocaleChange={vi.fn()} locales={locales}>
        <LocaleSwitcher locales={[{ value: 'de', label: 'Deutsch' }]} />
      </LocaleProvider>,
    );

    await user.click(screen.getByRole('button'));

    expect(screen.queryByText('English')).not.toBeInTheDocument();
  });

  it('throws naming the missing piece when neither prop nor provider supplies locales', () => {
    expect(() => render(<LocaleSwitcher value="de" onChange={vi.fn()} />)).toThrow(
      /no `locales` given/,
    );
  });

  it('throws naming the missing piece when there is no current locale', () => {
    expect(() => render(<LocaleSwitcher locales={locales} onChange={vi.fn()} />)).toThrow(
      /no `value` given/,
    );
  });

  it('throws naming the missing piece when nothing can receive the change', () => {
    // A LocaleProvider without onLocaleChange is a read-only source; a switcher
    // under it needs its own onChange.
    expect(() =>
      render(
        <LocaleProvider locale="de" locales={locales}>
          <LocaleSwitcher />
        </LocaleProvider>,
      ),
    ).toThrow(/no `onChange` given/);
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @hintoric/ui test -- LocaleSwitcher`
Expected: FAIL — the prop-free cases fail to typecheck at runtime and render an empty button; the throw cases render without throwing.

- [ ] **Step 3: Make the three props optional**

In `packages/ui/src/components/LocaleSwitcher/types.ts`, replace the three required members of `LocaleSwitcherProps`:

```ts
  /**
   * The offered languages. Falls back to the `locales` of an enclosing
   * `LocaleProvider`; one of the two must supply them.
   */
  locales?: readonly LocaleOption[];
  /** The current language. Falls back to the `LocaleProvider`'s `locale`. */
  value?: string;
  /** Falls back to the `LocaleProvider`'s `onLocaleChange`. */
  onChange?: (value: string) => void;
```

- [ ] **Step 4: Read the context in the component**

In `packages/ui/src/components/LocaleSwitcher/LocaleSwitcher.tsx`, add the import:

```tsx
import { useLocaleContext } from '../../theme/LocaleProvider';
```

and replace the start of the component (the destructuring and the first two statements of the body) with:

```tsx
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
```

Everything from the `return (` onwards stays exactly as it is — `locales`, `value` and `onChange` are now local constants with the same names the JSX already uses. Keep the hooks above the throws so hook order is never in question.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm --filter @hintoric/ui test -- LocaleSwitcher`
Expected: PASS, including the four pre-existing prop-driven tests — they must not change.

- [ ] **Step 6: Verify the switcher's appearance is untouched**

Run: `pnpm --filter @hintoric/ui test:visual -- LocaleSwitcher`
Expected: PASS against the existing self-baseline screenshots. A failure here means the render path changed, which this task must not do.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/LocaleSwitcher/
git commit -m "Let LocaleSwitcher take its language from the LocaleProvider"
```

---

### Task 4: Documentation

**Files:**
- Create: `apps/docs/src/pages/LocaleProviderPage.tsx`
- Modify: `apps/docs/src/App.tsx` (import + route)
- Modify: `apps/docs/src/nav.ts` (the `Utils` section)
- Modify: `apps/docs/src/pages/LocaleSwitcherPage.tsx` (a prop-free example first)
- Modify: `apps/docs/src/pages/RelativeTimePage.tsx:151` (the sentence about where values come from)
- Modify: `apps/docs/src/pages/RoadmapPage.tsx` (add `LocaleProvider`, done)

**Interfaces:**
- Consumes: `LocaleProvider`, `useLocale`, `LocaleSwitcher`, `RelativeTime` from `@hintoric/ui` (exported in Task 1).
- Produces: nothing later depends on it.

Docs import from the built `dist/`, so run `pnpm --filter @hintoric/ui build` first if the new exports do not resolve.

- [ ] **Step 1: Create the page**

Create `apps/docs/src/pages/LocaleProviderPage.tsx`:

```tsx
import { useState } from 'react';
import { LocaleProvider, LocaleSwitcher, RelativeTime, Typography } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

const LOCALES = [
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'en-US', label: 'English' },
  { value: 'fr-FR', label: 'Français' },
];

const THREE_DAYS_AGO = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

export function LocaleProviderPage() {
  const [locale, setLocale] = useState('de-DE');

  return (
    <>
      <h1>LocaleProvider</h1>
      <p className="docs-lede">
        One source for the display language. <code>LocaleSwitcher</code> writes to it,{' '}
        <code>RelativeTime</code> reads from it, and neither needs the other to know it exists.
      </p>

      <h2>The switcher and the timestamp agree</h2>
      <Demo>
        <LocaleProvider locale={locale} onLocaleChange={setLocale} locales={LOCALES}>
          <LocaleSwitcher aria-label="Choose language" />
          <Typography level="body-sm">
            <RelativeTime date={THREE_DAYS_AGO} />
          </Typography>
        </LocaleProvider>
      </Demo>
      <Code>{`<LocaleProvider locale={locale} onLocaleChange={setLocale} locales={LOCALES}>
  <LocaleSwitcher />
  <RelativeTime date={threeDaysAgo} />
</LocaleProvider>`}</Code>

      <h2>It does not own the language</h2>
      <p>
        <code>locale</code> is a required prop and the provider only mirrors it. There is no state
        here, no <code>localStorage</code> and no browser-language detection — in a real application
        i18next already owns all three, and a second copy would drift apart the moment the language
        changes for a reason other than the switcher. Wiring the two together is one line:
      </p>
      <Code>{`<LocaleProvider
  locale={i18n.language}
  onLocaleChange={i18n.changeLanguage}
  locales={LOCALES}
>
  <App />
</LocaleProvider>`}</Code>
      <p>
        The library itself knows no i18n library, and never will — that choice belongs to the
        application, not to a presentation library.
      </p>

      <h2>Precedence</h2>
      <p>
        Date and time components resolve their language in this order, narrowest first. Nothing is
        ambiguous: a deliberate <code>DateTimeProvider</code> locale (&ldquo;the UI is English but
        dates are German&rdquo;) survives an app-wide language.
      </p>
      <Code>{`prop on the component  >  DateTimeProvider.locale  >  LocaleProvider.locale  >  runtime default`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: 'locale',
            type: 'string',
            description: 'The current language. Required — the provider mirrors it rather than owning it.',
          },
          {
            name: 'onLocaleChange',
            type: '(locale: string) => void',
            description:
              'Called when a descendant changes the language. Omit it for a read-only source; a LocaleSwitcher below then needs its own onChange.',
          },
          {
            name: 'locales',
            type: 'readonly LocaleOption[]',
            description: 'The offered languages, so a LocaleSwitcher below needs no props at all.',
          },
          { name: 'children', type: 'React.ReactNode', description: 'Content that should know the language.' },
        ]}
      />

      <h2>useLocale()</h2>
      <p>
        Returns <code>{'{ locale, setLocale, locales }'}</code>. Must be called from inside a{' '}
        <code>LocaleProvider</code> — it throws otherwise. <code>setLocale</code> and{' '}
        <code>locales</code> are <code>undefined</code> when the provider was not given{' '}
        <code>onLocaleChange</code> or <code>locales</code>.
      </p>
    </>
  );
}
```

- [ ] **Step 2: Route and navigation**

In `apps/docs/src/App.tsx`, add the import next to the other page imports:

```tsx
import { LocaleProviderPage } from './pages/LocaleProviderPage';
```

and the route next to the `color-scheme-provider` one:

```tsx
            <Route path="/locale-provider" element={<LocaleProviderPage />} />
```

In `apps/docs/src/nav.ts`, extend the `Utils` section:

```ts
  {
    title: 'Utils',
    links: [
      { to: '/color-scheme-provider', label: 'ColorSchemeProvider' },
      { to: '/locale-provider', label: 'LocaleProvider' },
    ],
  },
```

- [ ] **Step 3: Put the prop-free example first on the switcher page**

In `apps/docs/src/pages/LocaleSwitcherPage.tsx`, add `LocaleProvider` to the `@hintoric/ui` import, and insert a new section directly after the `<p className="docs-lede">` paragraph, before the existing `<h2>Basic usage</h2>`:

```tsx
      <h2>Inside a LocaleProvider</h2>
      <p>
        With a <code>LocaleProvider</code> above it, the switcher needs no props — it takes the
        current language and the offered ones from there, and reports the change back to it. See{' '}
        <a href="/locale-provider">LocaleProvider</a>.
      </p>
      <Demo>
        <LocaleProvider locale={provided} onLocaleChange={setProvided} locales={LOCALES}>
          <LocaleSwitcher aria-label="Choose language" />
        </LocaleProvider>
      </Demo>
      <Code>{`<LocaleProvider locale={locale} onLocaleChange={setLocale} locales={LOCALES}>
  <LocaleSwitcher />
</LocaleProvider>`}</Code>
```

and add its state next to the other `useState` calls in that component:

```tsx
  const [provided, setProvided] = useState('de-DE');
```

Rename the existing `<h2>Basic usage</h2>` to `<h2>Without a provider</h2>` and leave everything under it untouched — those examples are the proof that props still work.

- [ ] **Step 4: Correct the RelativeTime page's sentence**

In `apps/docs/src/pages/RelativeTimePage.tsx`, under `<h2>Locale and time zone</h2>`, replace the whole paragraph:

```tsx
      <p>
        Values come from <code>DateTimeProvider</code>, falling back to the runtime default. Props
        on the component override both — useful for a single date that must be shown in a fixed
        zone.
      </p>
```

with:

```tsx
      <p>
        Values come from <code>DateTimeProvider</code>. The language falls back one step further,
        to a <a href="/locale-provider">LocaleProvider</a> and then to the runtime default. Props on
        the component override all of them — useful for a single date that must be shown in a fixed
        zone.
      </p>
```

- [ ] **Step 5: Mark it on the roadmap**

In `apps/docs/src/pages/RoadmapPage.tsx`, next to the existing `{ name: 'DateTimeProvider', done: true },`:

```tsx
      { name: 'LocaleProvider', done: true },
```

- [ ] **Step 6: Verify the docs build and the page renders**

Run: `pnpm --filter @hintoric/ui build && pnpm --filter docs build`
Expected: PASS.

Then start the docs dev server through the Browser pane (never `pnpm dev` in Bash), open `/locale-provider`, and check that switching the language in the demo changes the `RelativeTime` text beside it from "vor 3 Tagen" to "3 days ago". Read the console for errors. That demo is the proof the original bug is gone — look at it, do not just build it.

- [ ] **Step 7: Commit**

```bash
git add apps/docs/src
git commit -m "Document the LocaleProvider and the language precedence chain"
```

---

### Task 5: Playground

**Files:**
- Modify: `apps/playground/src/App.tsx` (the `LocaleDemo` component, lines 22-38)

**Interfaces:**
- Consumes: `LocaleProvider` from `@hintoric/ui`.
- Produces: nothing.

- [ ] **Step 1: Move the local state into a provider**

In `apps/playground/src/App.tsx`, add `LocaleProvider` and `RelativeTime` to the `@hintoric/ui` import list (keep it alphabetical, as it is now) and replace the whole `LocaleDemo` function:

```tsx
const LOCALES = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'English' },
];

function LocaleDemo() {
  const [locale, setLocale] = React.useState('de');
  const threeDaysAgo = React.useMemo(() => new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), []);
  return (
    <LocaleProvider locale={locale} onLocaleChange={setLocale} locales={LOCALES}>
      <Stack direction="row" spacing={2}>
        <LocaleSwitcher aria-label="Sprache wählen" />
        <Typography level="body-sm">
          gewählt: {locale} · <RelativeTime date={threeDaysAgo} />
        </Typography>
      </Stack>
    </LocaleProvider>
  );
}
```

While in that file, fix the indentation of the `<LocaleDemo />` line inside `App` — it currently sits two levels short of its siblings.

- [ ] **Step 2: Verify it runs**

Run: `pnpm --filter @hintoric/ui build`, then start the playground through the Browser pane and switch the language. Expected: the relative time flips between "vor 3 Tagen" and "3 days ago" with the switcher. Check the console for errors.

- [ ] **Step 3: Commit**

```bash
git add apps/playground/src/App.tsx
git commit -m "Wire the playground's language switcher through the LocaleProvider"
```

---

### Task 6: Changeset and full verification

**Files:**
- Create: `.changeset/<generated-name>.md`

**Interfaces:**
- Consumes: everything above.
- Produces: the release note that lands verbatim in `packages/ui/CHANGELOG.md`.

- [ ] **Step 1: Write the changeset**

Run `pnpm changeset` from the repo root, pick `@hintoric/ui`, choose **minor**, and give it this text (it is read by people reading release notes, not as a commit subject):

```markdown
Add `LocaleProvider`: one source for the display language, so `LocaleSwitcher` and `RelativeTime`
no longer disagree about it.

The provider deliberately owns nothing — `locale` is a required prop and it only mirrors it, because
in a real application i18next already holds the language with its own detection and persistence.
Wiring the two together is one line: `<LocaleProvider locale={i18n.language}
onLocaleChange={i18n.changeLanguage} locales={LOCALES}>`.

Inside one, `<LocaleSwitcher />` needs no props at all; `locales`, `value` and `onChange` are now
optional and still win when given, so nothing existing breaks. Date and time components resolve
their language narrowest-first: a prop, then `DateTimeProvider`, then `LocaleProvider`, then the
runtime default — so "the UI is English but dates are German" keeps working.
```

- [ ] **Step 2: Run everything**

```bash
pnpm --filter @hintoric/ui test
pnpm typecheck
pnpm lint
pnpm --filter @hintoric/ui build
```

Expected: all PASS. Report the actual output — do not claim success without having read it.

- [ ] **Step 3: Run the visual suite once, to prove nothing moved**

Run: `pnpm --filter @hintoric/ui test:visual`
Expected: PASS with no new or changed screenshots under `__screenshots__/`. Any diff here is a real regression: this change is not supposed to touch appearance at all.

- [ ] **Step 4: Commit**

```bash
git add .changeset
git commit -m "Add a changeset for the LocaleProvider"
```
