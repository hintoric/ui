# AddressAutofill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `<AddressAutofill>`, a combobox that searches German addresses against
`autofill.api.hintoric.cloud` as the user types and returns a structured address on selection —
built by composing the existing `<Autocomplete>` component, which gains four small, Joy-UI-matched
props (`loading`, `loadingText`, `noOptionsText`, `filter`) to support it.

**Architecture:** `Autocomplete` gets async-loading support first (mirroring real `@mui/joy`
Autocomplete's own `loading`/`loadingText`/`noOptionsText` API, plus a Base-UI-specific `filter`
escape hatch). `AddressAutofill` then composes the public `<Autocomplete>` component: it owns a
`useAddressSuggestions` hook (debounce + `AbortController` + fetch against `addressApi.ts`) and the
sole `useBoundField` call for its required `name`, and hands the result to `<Autocomplete>` as a
controlled, name-less field.

**Tech Stack:** React 19, TypeScript, `@base-ui/react` Combobox (via `Autocomplete`), Tailwind
classes, `react-hook-form` (via this repo's `internal/form` binding helpers), Vitest (`test` for
jsdom, `test:visual` for real-browser parity against `@mui/joy`), Vite (`apps/docs`).

**Spec:** [docs/superpowers/specs/2026-09-07-address-autofill-design.md](../specs/2026-09-07-address-autofill-design.md)

## Global Constraints

- No hardcoded UI text anywhere in `AddressAutofill` — `belowMinLengthContent`, `loadingContent`,
  `noResultsContent`, `errorContent` are **required props with no default value**.
- The inner `<Autocomplete>` that `AddressAutofill` renders must **never** receive a `name` prop —
  it would create a second, independent `useController` binding for the same react-hook-form field.
- `AddressAutofill` has **no `value`/`onChange`/`defaultValue` prop and no standalone mode** — it
  always requires `name` plus a surrounding `<Form>`/`FormProvider` and throws otherwise (same as
  `useFormContext()` would).
- No `baseUrl`/`fetcher` prop on `AddressAutofill` — the endpoint is fixed to
  `https://autofill.api.hintoric.cloud`; tests mock the `addressApi` module, not an injected function.
- Every prop added to `Autocomplete` that has a real `@mui/joy` Autocomplete equivalent (`loading`,
  `loadingText`, `noOptionsText`) must reuse Joy's exact name, default value, and behavior rule
  ("`loadingText` replaces suggestions only when there are none") — verified directly against
  `@mui/joy@5.0.0-beta.52`'s `Autocomplete/Autocomplete.js` and `AutocompleteProps.d.ts`.
- Every new/modified component needs jsdom tests (`pnpm test`) AND, where the spec calls for it,
  visual regression tests (`pnpm test:visual`) — see the spec's "Visuelle Regressionsabdeckung".
- A changeset is required (this changes `@hintoric/ui`'s public API).

---

## Task 1: Extend `Autocomplete` with `loading`/`loadingText`/`noOptionsText`/`filter`

**Files:**
- Modify: `packages/ui/src/components/Autocomplete/types.ts`
- Modify: `packages/ui/src/components/Autocomplete/Autocomplete.tsx`
- Test: `packages/ui/src/components/Autocomplete/Autocomplete.test.tsx`

**Interfaces:**
- Produces: `AutocompleteProps<Value>` gains `loading?: boolean`, `loadingText?: React.ReactNode`,
  `noOptionsText?: React.ReactNode`, `filter?: null | ((itemValue: Value, query: string, itemToString?: (itemValue: Value) => string) => boolean)`.
  All later tasks import these from `../../components/Autocomplete` (already re-exported via
  `export type { AutocompleteProps }` in `packages/ui/src/index.ts` — no change needed there for this task).

- [x] **Step 1: Write the failing tests**

Add to the end of the `describe('Autocomplete', ...)` block in
`packages/ui/src/components/Autocomplete/Autocomplete.test.tsx` (it currently ends after the
`'defaults to outlined/neutral/md'` test, right before the closing `});` of that `describe`):

```tsx
  it('shows loadingText in the empty slot while loading and options is empty', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={[]} loading loadingText="Loading…" />);
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByText('Loading…')).toBeInTheDocument();
  });

  it('keeps showing existing options instead of loadingText while loading', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={OPTIONS} loading loadingText="Loading…" />);
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('option', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
  });

  it('shows noOptionsText when the list is empty and not loading', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={[]} noOptionsText="Nothing here" />);
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByText('Nothing here')).toBeInTheDocument();
  });

  it('defaults noOptionsText to "No options"', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={[]} />);
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByText('No options')).toBeInTheDocument();
  });

  it('client-filters options against the input by default', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={['Zeta']} />);
    await user.type(screen.getByRole('combobox'), 'nomatch');
    expect(screen.queryByRole('option', { name: 'Zeta' })).not.toBeInTheDocument();
  });

  it('does not client-filter options when filter is null', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={['Zeta']} filter={null} />);
    await user.type(screen.getByRole('combobox'), 'nomatch');
    expect(await screen.findByRole('option', { name: 'Zeta' })).toBeInTheDocument();
  });
```

- [x] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @hintoric/ui test -- Autocomplete.test.tsx`
Expected: the four new assertions on `loading`/`loadingText`/`noOptionsText`/`filter` FAIL (props
don't exist yet, "No options" is still hardcoded, and there is no client filtering to disable).

- [x] **Step 3: Add the four props to `AutocompleteProps<Value>`**

In `packages/ui/src/components/Autocomplete/types.ts`, add after the existing `disableClearable`
field (last field before the closing `}`):

```ts
  /** Hides the built-in clear ("x") button. @default false */
  disableClearable?: boolean;
  /**
   * Shows `loadingText` in the empty-state slot instead of `noOptionsText`,
   * but only while `options` is empty — matches `@mui/joy`'s own
   * `Autocomplete` `loading` prop exactly, including that rule.
   * @default false
   */
  loading?: boolean;
  /** Shown in the empty-state slot while `loading` is true and `options` is empty. @default 'Loading…' */
  loadingText?: React.ReactNode;
  /** Shown in the empty-state slot when `options` is empty and not loading. @default 'No options' */
  noOptionsText?: React.ReactNode;
  /**
   * Passed straight to Base UI's `Combobox.Root`. Pass `null` to disable Base
   * UI's own client-side filtering of `options` against the input text —
   * required whenever `options` already reflects a server-filtered result set
   * for the current query (a debounced remote search), since otherwise Base
   * UI's default text-match filter can hide valid results whose label
   * doesn't literally contain what's currently typed.
   * @default undefined (Base UI's built-in filter)
   */
  filter?: null | ((itemValue: Value, query: string, itemToString?: (itemValue: Value) => string) => boolean);
```

- [x] **Step 4: Implement in `Autocomplete.tsx`**

Change the `AutocompleteBaseComponent` destructuring (currently ends `disableClearable = false,
className, ...props`) to:

```ts
    disableClearable = false,
    loading = false,
    loadingText = 'Loading…',
    noOptionsText = 'No options',
    filter,
    className,
    ...props
```

Add `filter={filter}` to the `<Combobox.Root>` element (alongside its existing `disabled={disabled}`):

```tsx
    <Combobox.Root
      items={options}
      itemToStringLabel={getOptionLabel}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onChange as (value: Value | null) => void}
      inputValue={inputValue}
      onInputValueChange={onInputChange}
      disabled={disabled}
      filter={filter}
    >
```

Replace the `<Combobox.Empty>` line (currently `<Combobox.Empty className="px-3 py-2 text-sm
text-ink-tertiary">No options</Combobox.Empty>`) with:

```tsx
          <Combobox.Empty className="px-3 py-2 text-sm text-ink-secondary">
            {loading ? loadingText : noOptionsText}
          </Combobox.Empty>
```

(No spinner — real `@mui/joy` Autocomplete's own `loading` state is plain text too, per
`Autocomplete.js`: `AutocompleteLoading` just renders `loadingText`. Adding an icon here would be an
unrequested embellishment on top of the thing this task is explicitly mirroring.)

**Also fixes a pre-existing token bug found while writing Task 2's visual test**: the "No options"
text was `text-ink-tertiary` (`--color-neutral-600`, `#555E68`), but Joy's own
`AutocompleteNoOptions`/`AutocompleteLoading` (both `styled(ListItem)`) set `color:
theme.palette.text.secondary`, which resolves to `--color-neutral-700` (`#32383E`) — this repo's
`ink-secondary` token, not `ink-tertiary`. Nothing tested this text's color against Joy before now.

(No changes needed in `AutocompleteFieldComponent`/`BoundAutocompleteComponent`/
`AutocompleteRootComponent` — all four new props flow through their existing generic
`...props`/`...rest` spreads.)

- [x] **Step 5: Run the tests to verify they pass**

Run: `pnpm --filter @hintoric/ui test -- Autocomplete.test.tsx`
Expected: PASS, all tests including the six new ones and the pre-existing ones.

- [x] **Step 6: Typecheck**

Run: `pnpm typecheck` (from repo root)
Expected: no errors.

- [x] **Step 7: Commit**

```bash
git add packages/ui/src/components/Autocomplete/types.ts packages/ui/src/components/Autocomplete/Autocomplete.tsx packages/ui/src/components/Autocomplete/Autocomplete.test.tsx
git commit -m "Add loading/loadingText/noOptionsText/filter to Autocomplete"
```

---

## Task 2: Visual regression for `Autocomplete`'s new props

**Files:**
- Modify: `packages/ui/src/visual/Autocomplete.visual.test.tsx`

**Interfaces:**
- Consumes: `Autocomplete` (`loading`, `loadingText`, `noOptionsText` props from Task 1).

- [x] **Step 1: Add Joy-parity cases**

Append to `packages/ui/src/visual/Autocomplete.visual.test.tsx`, inside the existing
`describe('Autocomplete visual parity with @mui/joy', ...)` block, right before its closing `});`
(after the `'disabled input matches Joy UI'` test):

```tsx
  // Forcing Joy's real Autocomplete popup open from the outside turned out to
  // be unreliable in practice (its `open` state is internal to
  // useAutocomplete, with no public controlled prop, and simulated
  // mousedown/click/ArrowDown events didn't consistently mount its Popper
  // portal even though the popup-indicator's own rendered state visibly
  // flipped). Joy's `AutocompleteNoOptions`/`AutocompleteLoading` are just
  // `styled(ListItem)` with one added rule — `color: theme.palette.text.secondary`
  // (confirmed in `@mui/joy`'s `Autocomplete.js`) — so comparing against a
  // bare `<ListItem sx={{ color: 'text.secondary' }}>` is the same comparison
  // without depending on that interaction succeeding, and matches this file's
  // existing pattern of comparing against a plain rendered Joy primitive
  // rather than a live nested one.
  it("loadingText's color matches Joy's text.secondary token", async () => {
    render(
      <JoyCssVarsProvider>
        <JoyListItem sx={{ color: 'text.secondary' }} data-testid="joy-secondary-text">
          reference
        </JoyListItem>
      </JoyCssVarsProvider>,
    );
    render(<HintoricAutocomplete options={[]} loading loadingText="Searching…" data-testid="hintoric-loading" />);

    await userEvent.click(page.getByTestId('hintoric-loading').element());
    const hintoricLoading = await screen.findByText('Searching…');

    expect(getComputedStyle(hintoricLoading).color).toBe(
      getComputedStyle(page.getByTestId('joy-secondary-text').element()).color,
    );

    await expect(page.getByTestId('hintoric-loading')).toMatchScreenshot('autocomplete-loading-hintoric');
  });

  it("noOptionsText's color matches Joy's text.secondary token, and defaults to 'No options'", async () => {
    render(
      <JoyCssVarsProvider>
        <JoyListItem sx={{ color: 'text.secondary' }} data-testid="joy-secondary-text-2">
          reference
        </JoyListItem>
      </JoyCssVarsProvider>,
    );
    render(<HintoricAutocomplete options={[]} noOptionsText="Nothing found" data-testid="hintoric-empty" />);

    await userEvent.click(page.getByTestId('hintoric-empty').element());
    const hintoricEmpty = await screen.findByText('Nothing found');

    expect(getComputedStyle(hintoricEmpty).color).toBe(
      getComputedStyle(page.getByTestId('joy-secondary-text-2').element()).color,
    );

    await expect(page.getByTestId('hintoric-empty')).toMatchScreenshot('autocomplete-empty-hintoric');
  });
```

Add the missing imports at the top of the file (`userEvent` and `screen` are not imported yet
there, and `ListItem` needs adding to the existing `@mui/joy` import):

```ts
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CssVarsProvider as JoyCssVarsProvider, Autocomplete as JoyAutocomplete, ListItem as JoyListItem } from '@mui/joy';
```

(`render` is already imported from `@testing-library/react` without `screen`, and
`JoyCssVarsProvider`/`JoyAutocomplete` are already imported from `@mui/joy` without `ListItem` —
extend both existing import lines rather than duplicating them.)

- [x] **Step 2: Run the visual tests**

Run: `pnpm --filter @hintoric/ui test:visual -- Autocomplete.visual.test.tsx`
Expected: FAILS the first time on purpose with "no existing reference screenshot found" for the
two new screenshot names — this is expected per this repo's convention.

- [x] **Step 3: Re-run to confirm the new baselines pass**

Run: `pnpm --filter @hintoric/ui test:visual -- Autocomplete.visual.test.tsx`
Expected: PASS. Open the two new PNGs under
`packages/ui/src/visual/__screenshots__/Autocomplete.visual.test.tsx/` and confirm the loading and
empty text actually render and look right before trusting them.

- [x] **Step 4: Commit**

```bash
git add packages/ui/src/visual/Autocomplete.visual.test.tsx packages/ui/src/visual/__screenshots__/Autocomplete.visual.test.tsx
git commit -m "Add Joy-parity visual tests for Autocomplete loading/noOptionsText"
```

---

## Task 3: `AddressAutofill` types + `addressApi.ts`

**Files:**
- Create: `packages/ui/src/components/AddressAutofill/types.ts`
- Create: `packages/ui/src/components/AddressAutofill/addressApi.ts`
- Test: `packages/ui/src/components/AddressAutofill/addressApi.test.ts`

**Interfaces:**
- Produces: `AddressSuggestion`, `AddressAutofillProps` (types.ts); `fetchAddressSuggestions(query:
  string, opts: { limit: number; signal: AbortSignal }): Promise<AddressSuggestion[]>` (addressApi.ts).
  Task 4 and Task 5 both import from these two files.

- [x] **Step 1: Write `types.ts`**

```ts
import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface AddressSuggestion {
  postalCode: string;
  city: string;
  street: string;
  borough: string | null;
  suburb: string | null;
}

export interface AddressAutofillProps
  extends Omit<
    React.ComponentPropsWithoutRef<'input'>,
    'color' | 'size' | 'name' | 'value' | 'defaultValue' | 'onChange'
  > {
  /** The react-hook-form field path. Required — this field always binds to a form. */
  name: string;
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  /** Turns a suggestion into display text. @default `${street}, ${postalCode} ${city}` */
  getOptionLabel?: (value: AddressSuggestion) => string;
  /** Characters typed before a search fires. @default 2 */
  minQueryLength?: number;
  /** Debounce between the last keystroke and firing the request, in ms. @default 300 */
  debounceMs?: number;
  /** Passed to the API as the result cap. @default 10 */
  limit?: number;

  /** Shown when fewer than `minQueryLength` characters have been typed. No default — see spec. */
  belowMinLengthContent: React.ReactNode;
  /** Shown while a search request is in flight and there are no suggestions yet. No default. */
  loadingContent: React.ReactNode;
  /** Shown when a search completed with zero matches. No default. */
  noResultsContent: React.ReactNode;
  /** Shown when the search request failed. No default. */
  errorContent: React.ReactNode;

  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
  placeholder?: string;
}
```

Extending the native input props (minus the ones this component owns) rather than a closed prop
list — same shape `Autocomplete`'s own `AutocompleteProps` uses — so `aria-label`, `id`,
`data-testid` etc. reach the underlying `<input>` via a `...rest` spread in the component (Task 5).
Without this, nothing in this plan's own tests or docs page could target the field by test id, and
an unlabeled instance (e.g. one cell of a variant×color grid) would have no accessible name at all.

- [x] **Step 2: Write the failing test for `addressApi.ts`**

```ts
// packages/ui/src/components/AddressAutofill/addressApi.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchAddressSuggestions } from './addressApi';

describe('fetchAddressSuggestions', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests the autocomplete endpoint with q and limit', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { postalCode: '10115', city: 'Berlin', street: 'Ackerstr.', borough: 'Mitte', suburb: 'Mitte' },
      ],
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchAddressSuggestions('acker', { limit: 5, signal: new AbortController().signal });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestedUrl = new URL(fetchMock.mock.calls[0][0] as string | URL);
    expect(requestedUrl.origin + requestedUrl.pathname).toBe('https://autofill.api.hintoric.cloud/api/autocomplete');
    expect(requestedUrl.searchParams.get('q')).toBe('acker');
    expect(requestedUrl.searchParams.get('limit')).toBe('5');
    expect(result).toEqual([
      { postalCode: '10115', city: 'Berlin', street: 'Ackerstr.', borough: 'Mitte', suburb: 'Mitte' },
    ]);
  });

  it('throws when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
    );

    await expect(
      fetchAddressSuggestions('acker', { limit: 5, signal: new AbortController().signal }),
    ).rejects.toThrow();
  });
});
```

- [x] **Step 3: Run the test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- addressApi.test.ts`
Expected: FAIL with "Cannot find module './addressApi'" (file doesn't exist yet).

- [x] **Step 4: Write `addressApi.ts`**

```ts
import type { AddressSuggestion } from './types';

const BASE_URL = 'https://autofill.api.hintoric.cloud';

export async function fetchAddressSuggestions(
  query: string,
  { limit, signal }: { limit: number; signal: AbortSignal },
): Promise<AddressSuggestion[]> {
  const url = new URL('/api/autocomplete', BASE_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(limit));

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Address autocomplete request failed with status ${response.status}`);
  }
  return response.json() as Promise<AddressSuggestion[]>;
}
```

- [x] **Step 5: Run the test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- addressApi.test.ts`
Expected: PASS.

- [x] **Step 6: Commit**

```bash
git add packages/ui/src/components/AddressAutofill/types.ts packages/ui/src/components/AddressAutofill/addressApi.ts packages/ui/src/components/AddressAutofill/addressApi.test.ts
git commit -m "Add AddressAutofill types and the addressApi fetch wrapper"
```

---

## Task 4: `useAddressSuggestions` hook

**Files:**
- Create: `packages/ui/src/components/AddressAutofill/useAddressSuggestions.ts`
- Test: `packages/ui/src/components/AddressAutofill/useAddressSuggestions.test.ts`

**Note on `waitFor`:** with `vi.useFakeTimers()` active, `@testing-library/react`'s `waitFor`
deadlocks — it polls via a real `setInterval`, which fake timers freeze too, and the test times out
at 5000ms instead of failing or passing. Every assertion below therefore uses `vi.waitFor` (from
`vitest`, timer-aware) instead, and `waitFor` is dropped from the `@testing-library/react` import.

**Interfaces:**
- Consumes: `fetchAddressSuggestions` from `./addressApi` (Task 3), `AddressSuggestion` from `./types` (Task 3).
- Produces: `useAddressSuggestions(query: string, opts: { minQueryLength: number; debounceMs: number;
  limit: number }): { suggestions: AddressSuggestion[]; isLoading: boolean; hasError: boolean }`.
  Task 5 imports this hook.

- [x] **Step 1: Write the failing tests**

```ts
// packages/ui/src/components/AddressAutofill/useAddressSuggestions.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAddressSuggestions } from './useAddressSuggestions';
import { fetchAddressSuggestions } from './addressApi';
import type { AddressSuggestion } from './types';

vi.mock('./addressApi', () => ({ fetchAddressSuggestions: vi.fn() }));

const mockedFetch = vi.mocked(fetchAddressSuggestions);

const BERLIN: AddressSuggestion = {
  postalCode: '10115',
  city: 'Berlin',
  street: 'Ackerstr.',
  borough: 'Mitte',
  suburb: 'Mitte',
};

const OPTS = { minQueryLength: 2, debounceMs: 300, limit: 10 };

describe('useAddressSuggestions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockedFetch.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not fetch below minQueryLength', async () => {
    const { result } = renderHook(({ query }) => useAddressSuggestions(query, OPTS), {
      initialProps: { query: 'a' },
    });
    await vi.advanceTimersByTimeAsync(500);
    expect(mockedFetch).not.toHaveBeenCalled();
    expect(result.current.suggestions).toEqual([]);
  });

  it('fetches only after debounceMs of no further typing', async () => {
    mockedFetch.mockResolvedValue([BERLIN]);
    const { result, rerender } = renderHook(({ query }) => useAddressSuggestions(query, OPTS), {
      initialProps: { query: 'ac' },
    });
    rerender({ query: 'ack' });
    rerender({ query: 'acke' });
    await vi.advanceTimersByTimeAsync(200);
    expect(mockedFetch).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(300);
    await vi.waitFor(() => expect(result.current.suggestions).toEqual([BERLIN]));
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith('acke', expect.objectContaining({ limit: 10 }));
  });

  it('sets isLoading only while the debounced request is in flight', async () => {
    let resolveFetch: (value: AddressSuggestion[]) => void = () => {};
    mockedFetch.mockReturnValue(new Promise((resolve) => { resolveFetch = resolve; }));
    const { result } = renderHook(({ query }) => useAddressSuggestions(query, OPTS), {
      initialProps: { query: 'acke' },
    });
    await vi.advanceTimersByTimeAsync(300);
    await vi.waitFor(() => expect(result.current.isLoading).toBe(true));
    resolveFetch([BERLIN]);
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('keeps existing suggestions visible while a new query is loading', async () => {
    mockedFetch.mockResolvedValueOnce([BERLIN]);
    const { result, rerender } = renderHook(({ query }) => useAddressSuggestions(query, OPTS), {
      initialProps: { query: 'acke' },
    });
    await vi.advanceTimersByTimeAsync(300);
    await vi.waitFor(() => expect(result.current.suggestions).toEqual([BERLIN]));

    mockedFetch.mockReturnValue(new Promise(() => {})); // never resolves in this test
    rerender({ query: 'ackerx' });
    await vi.advanceTimersByTimeAsync(300);
    await vi.waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.suggestions).toEqual([BERLIN]);
  });

  it('aborts the in-flight request when a newer query supersedes it', async () => {
    const signals: AbortSignal[] = [];
    mockedFetch.mockImplementation((_query, { signal }) => {
      signals.push(signal);
      return new Promise(() => {}); // never resolves
    });
    const { rerender } = renderHook(({ query }) => useAddressSuggestions(query, OPTS), {
      initialProps: { query: 'acke' },
    });
    await vi.advanceTimersByTimeAsync(300);
    rerender({ query: 'ackers' });
    await vi.advanceTimersByTimeAsync(300);
    expect(signals[0].aborted).toBe(true);
  });

  it('a stale response that resolves after being superseded does not overwrite newer results', async () => {
    // Simulates a test double (or non-conformant fetch) that resolves an
    // aborted request instead of rejecting it — proves the hook's own
    // aborted-signal guard on the success path, not AbortController's
    // built-in contract (which a real `fetch` already honors).
    const STALE = [{ ...BERLIN, street: 'Stale street' }];
    const FRESH = [{ ...BERLIN, street: 'Fresh street' }];
    let resolveStale: (value: AddressSuggestion[]) => void = () => {};
    mockedFetch
      .mockImplementationOnce(() => new Promise((resolve) => { resolveStale = resolve; }))
      .mockImplementationOnce(() => Promise.resolve(FRESH));

    const { result, rerender } = renderHook(({ query }) => useAddressSuggestions(query, OPTS), {
      initialProps: { query: 'acke' },
    });
    await vi.advanceTimersByTimeAsync(300);
    rerender({ query: 'ackers' });
    await vi.advanceTimersByTimeAsync(300);
    await vi.waitFor(() => expect(result.current.suggestions).toEqual(FRESH));

    resolveStale(STALE); // the superseded request finally resolves
    await Promise.resolve();
    expect(result.current.suggestions).toEqual(FRESH);
  });

  it('sets hasError and clears a previously populated list on a rejected request', async () => {
    mockedFetch.mockResolvedValueOnce([BERLIN]);
    const { result, rerender } = renderHook(({ query }) => useAddressSuggestions(query, OPTS), {
      initialProps: { query: 'acke' },
    });
    await vi.advanceTimersByTimeAsync(300);
    await vi.waitFor(() => expect(result.current.suggestions).toEqual([BERLIN]));

    mockedFetch.mockRejectedValueOnce(new Error('network down'));
    rerender({ query: 'ackers' });
    await vi.advanceTimersByTimeAsync(300);
    await vi.waitFor(() => expect(result.current.hasError).toBe(true));
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});
```

- [x] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @hintoric/ui test -- useAddressSuggestions.test.ts`
Expected: FAIL with "Cannot find module './useAddressSuggestions'".

- [x] **Step 3: Write `useAddressSuggestions.ts`**

```ts
import * as React from 'react';
import { fetchAddressSuggestions } from './addressApi';
import type { AddressSuggestion } from './types';

export interface UseAddressSuggestionsOptions {
  minQueryLength: number;
  debounceMs: number;
  limit: number;
}

export interface UseAddressSuggestionsResult {
  suggestions: AddressSuggestion[];
  isLoading: boolean;
  hasError: boolean;
}

export function useAddressSuggestions(
  query: string,
  { minQueryLength, debounceMs, limit }: UseAddressSuggestionsOptions,
): UseAddressSuggestionsResult {
  const [suggestions, setSuggestions] = React.useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (query.length < minQueryLength) {
      setSuggestions([]);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setIsLoading(true);
      setHasError(false);
      fetchAddressSuggestions(query, { limit, signal: controller.signal })
        .then((results) => {
          // Guards the success path too, not just the rejection path: a test
          // double (or a non-conformant fetch polyfill) might resolve an
          // aborted request instead of rejecting it, and an older response
          // must never overwrite what a newer query already produced.
          if (controller.signal.aborted) return;
          setSuggestions(results);
          setIsLoading(false);
        })
        .catch(() => {
          // Aborted because a newer keystroke superseded this request — the
          // effect that aborted it owns the state from here, not this one.
          if (controller.signal.aborted) return;
          setSuggestions([]);
          setHasError(true);
          setIsLoading(false);
        });
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, minQueryLength, debounceMs, limit]);

  return { suggestions, isLoading, hasError };
}
```

- [x] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @hintoric/ui test -- useAddressSuggestions.test.ts`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add packages/ui/src/components/AddressAutofill/useAddressSuggestions.ts packages/ui/src/components/AddressAutofill/useAddressSuggestions.test.ts
git commit -m "Add useAddressSuggestions: debounced, abortable address search"
```

---

## Task 5: `AddressAutofill` component

**Files:**
- Create: `packages/ui/src/components/AddressAutofill/AddressAutofill.tsx`
- Create: `packages/ui/src/components/AddressAutofill/index.ts`
- Test: `packages/ui/src/components/AddressAutofill/AddressAutofill.test.tsx`

**Interfaces:**
- Consumes: `useAddressSuggestions` (Task 4); `Autocomplete` + its `loading`/`loadingText`/
  `noOptionsText`/`filter` props (Task 1); `useBoundField`, `useForkRef`, `valueAdapter`, `omitProps`
  from `../../internal/form`.
- Produces: `AddressAutofill` component. Task 7 exports it from `packages/ui/src/index.ts`.

**Note:** the component destructures `...rest` twice for two different purposes — once from its own
props (native passthrough like `id`/`data-testid`), once from `fieldProps` (react-hook-form's bound
`value`/`onChange`/`onBlur`/`name`). Both can't be named `rest` in the same function scope (it's a
redeclaration, not just shadowing) — the code below names the second one `fieldRest`.

- [x] **Step 1: Write the failing tests**

```tsx
// packages/ui/src/components/AddressAutofill/AddressAutofill.test.tsx
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from '../Form';
import { AddressAutofill } from './AddressAutofill';
import { fetchAddressSuggestions } from './addressApi';
import type { AddressSuggestion } from './types';

vi.mock('./addressApi', () => ({ fetchAddressSuggestions: vi.fn() }));
const mockedFetch = vi.mocked(fetchAddressSuggestions);

const BERLIN: AddressSuggestion = {
  postalCode: '10115',
  city: 'Berlin',
  street: 'Ackerstr.',
  borough: 'Mitte',
  suburb: 'Mitte',
};

const CONTENT_PROPS = {
  belowMinLengthContent: 'Mindestens 2 Zeichen eingeben.',
  loadingContent: 'Suche läuft…',
  noResultsContent: 'Keine Adresse gefunden.',
  errorContent: 'Adressen konnten nicht geladen werden.',
};

describe('AddressAutofill', () => {
  beforeEach(() => {
    mockedFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws when rendered outside a <Form>', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(<AddressAutofill name="address" label="Adresse" {...CONTENT_PROPS} />),
    ).toThrow();
    consoleError.mockRestore();
  });

  it('shows belowMinLengthContent below minQueryLength', async () => {
    const user = userEvent.setup();
    render(
      <Form onSubmit={vi.fn()}>
        <AddressAutofill name="address" label="Adresse" {...CONTENT_PROPS} />
      </Form>,
    );
    await user.type(screen.getByLabelText('Adresse'), 'a');
    expect(await screen.findByText(CONTENT_PROPS.belowMinLengthContent)).toBeInTheDocument();
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('fetches at minQueryLength, after debounceMs, and selecting an option writes the value into the form', async () => {
    mockedFetch.mockResolvedValue([BERLIN]);
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <Form onSubmit={onSubmit}>
        <AddressAutofill name="address" label="Adresse" debounceMs={10} {...CONTENT_PROPS} />
        <button type="submit">ok</button>
      </Form>,
    );
    await user.type(screen.getByLabelText('Adresse'), 'acker');
    await user.click(await screen.findByRole('option', { name: /Ackerstr\./ }));
    await user.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit).toHaveBeenCalledWith({ address: BERLIN }, expect.anything());
  });

  it('shows loadingContent while a request is in flight and there are no suggestions yet', async () => {
    mockedFetch.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(
      <Form onSubmit={vi.fn()}>
        <AddressAutofill name="address" label="Adresse" debounceMs={10} {...CONTENT_PROPS} />
      </Form>,
    );
    await user.type(screen.getByLabelText('Adresse'), 'acker');
    expect(await screen.findByText(CONTENT_PROPS.loadingContent)).toBeInTheDocument();
  });

  it('shows noResultsContent when a search completes with zero matches', async () => {
    mockedFetch.mockResolvedValue([]);
    const user = userEvent.setup();
    render(
      <Form onSubmit={vi.fn()}>
        <AddressAutofill name="address" label="Adresse" debounceMs={10} {...CONTENT_PROPS} />
      </Form>,
    );
    await user.type(screen.getByLabelText('Adresse'), 'qqqqq');
    expect(await screen.findByText(CONTENT_PROPS.noResultsContent)).toBeInTheDocument();
  });

  it('shows errorContent and clears the list when the request fails', async () => {
    mockedFetch.mockRejectedValue(new Error('network down'));
    const user = userEvent.setup();
    render(
      <Form onSubmit={vi.fn()}>
        <AddressAutofill name="address" label="Adresse" debounceMs={10} {...CONTENT_PROPS} />
      </Form>,
    );
    await user.type(screen.getByLabelText('Adresse'), 'acker');
    expect(await screen.findByText(CONTENT_PROPS.errorContent)).toBeInTheDocument();
  });

  it('keeps existing suggestions visible while a new query is loading', async () => {
    mockedFetch.mockResolvedValueOnce([BERLIN]);
    const user = userEvent.setup();
    render(
      <Form onSubmit={vi.fn()}>
        <AddressAutofill name="address" label="Adresse" debounceMs={10} {...CONTENT_PROPS} />
      </Form>,
    );
    const input = screen.getByLabelText('Adresse');
    await user.type(input, 'acker');
    await screen.findByRole('option', { name: /Ackerstr\./ });

    mockedFetch.mockReturnValue(new Promise(() => {}));
    await user.type(input, 'x');
    await waitFor(() => expect(screen.getByRole('option', { name: /Ackerstr\./ })).toBeInTheDocument());
  });
});
```

- [x] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @hintoric/ui test -- AddressAutofill.test.tsx`
Expected: FAIL with "Cannot find module './AddressAutofill'".

- [x] **Step 3: Write `AddressAutofill.tsx`**

```tsx
'use client';
import * as React from 'react';
import { Autocomplete } from '../Autocomplete';
import { omitProps, useBoundField, useForkRef, valueAdapter } from '../../internal/form';
import { useAddressSuggestions } from './useAddressSuggestions';
import type { AddressAutofillProps, AddressSuggestion } from './types';

const DEFAULT_MIN_QUERY_LENGTH = 2;
const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_LIMIT = 10;

function defaultGetOptionLabel(value: AddressSuggestion): string {
  return `${value.street}, ${value.postalCode} ${value.city}`;
}

function AddressAutofillComponent(
  {
    name,
    variant,
    color,
    size,
    getOptionLabel = defaultGetOptionLabel,
    minQueryLength = DEFAULT_MIN_QUERY_LENGTH,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    limit = DEFAULT_LIMIT,
    belowMinLengthContent,
    loadingContent,
    noResultsContent,
    errorContent,
    label,
    helperText,
    error,
    disabled,
    placeholder,
    ...rest
  }: AddressAutofillProps,
  ref: React.Ref<HTMLInputElement>,
) {
  const [query, setQuery] = React.useState('');
  const { suggestions, isLoading, hasError } = useAddressSuggestions(query, {
    minQueryLength,
    debounceMs,
    limit,
  });

  const { fieldProps, errorMessage } = useBoundField(name, valueAdapter, {});
  const { ref: fieldRef, ...fieldRest } = fieldProps as {
    ref: React.Ref<HTMLInputElement>;
    name: string;
    value: AddressSuggestion | null;
    onChange: (value: AddressSuggestion | null) => void;
    onBlur: () => void;
  };
  // `Autocomplete` self-binds to react-hook-form the moment it sees a `name`
  // inside a <FormProvider> (see AutocompleteRootComponent) — passing this
  // field's own `name` through would register a second, independent binding
  // for the same form value, fighting the one just established above.
  const boundProps = omitProps(fieldRest, ['name']) as {
    value: AddressSuggestion | null;
    onChange: (value: AddressSuggestion | null) => void;
    onBlur: () => void;
  };
  const forkedRef = useForkRef(ref, fieldRef);

  const noOptionsText =
    query.length < minQueryLength ? belowMinLengthContent : hasError ? errorContent : noResultsContent;

  return (
    <Autocomplete<AddressSuggestion>
      {...rest}
      {...boundProps}
      ref={forkedRef}
      options={suggestions}
      getOptionLabel={getOptionLabel}
      inputValue={query}
      onInputChange={setQuery}
      loading={isLoading}
      loadingText={loadingContent}
      noOptionsText={noOptionsText}
      filter={null}
      variant={variant}
      color={color}
      size={size}
      label={label}
      helperText={errorMessage ?? helperText}
      error={error || errorMessage != null}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
}

export const AddressAutofill = React.forwardRef(AddressAutofillComponent) as ((
  props: AddressAutofillProps & { ref?: React.Ref<HTMLInputElement> },
) => React.ReactElement) & { displayName?: string };
AddressAutofill.displayName = 'AddressAutofill';
```

```ts
// packages/ui/src/components/AddressAutofill/index.ts
export { AddressAutofill } from './AddressAutofill';
export type { AddressAutofillProps, AddressSuggestion } from './types';
```

- [x] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @hintoric/ui test -- AddressAutofill.test.tsx`
Expected: PASS.

- [x] **Step 5: Typecheck and full jsdom suite**

Run: `pnpm typecheck && pnpm --filter @hintoric/ui test`
Expected: no errors, all tests (including every other component's) pass.

- [x] **Step 6: Commit**

```bash
git add packages/ui/src/components/AddressAutofill/AddressAutofill.tsx packages/ui/src/components/AddressAutofill/index.ts packages/ui/src/components/AddressAutofill/AddressAutofill.test.tsx
git commit -m "Add AddressAutofill component"
```

---

## Task 6: Visual regression for `AddressAutofill`

**Files:**
- Create: `packages/ui/src/visual/AddressAutofill.visual.test.tsx`

**Interfaces:**
- Consumes: `AddressAutofill` (Task 5), `Autocomplete` (for the self-baseline comparison), `Form`.

- [x] **Step 1: Write the visual test**

Per the spec, this compares against `Autocomplete` itself (no `@mui/joy` equivalent exists), across
every variant × color, plus the four content states as screenshots, plus focus-ring parity:

```tsx
// packages/ui/src/visual/AddressAutofill.visual.test.tsx
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddressAutofill } from '../components/AddressAutofill';
import { Autocomplete } from '../components/Autocomplete';
import { Form } from '../components/Form';
import { fetchAddressSuggestions } from '../components/AddressAutofill/addressApi';
import { settleTransitions } from './helpers';

vi.mock('../components/AddressAutofill/addressApi', () => ({ fetchAddressSuggestions: vi.fn() }));
const mockedFetch = vi.mocked(fetchAddressSuggestions);

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

const CONTENT_PROPS = {
  belowMinLengthContent: 'Type at least 2 characters',
  loadingContent: 'Loading…',
  noResultsContent: 'No addresses found',
  errorContent: "Couldn't load suggestions",
};

describe('AddressAutofill visual parity with Autocomplete', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches a bare Autocomplete's computed styles`, async () => {
        mockedFetch.mockResolvedValue([]);
        render(
          <Form onSubmit={vi.fn()}>
            <AddressAutofill
              name="address"
              variant={variant}
              color={color}
              data-testid={`address-${variant}-${color}`}
              {...CONTENT_PROPS}
            />
          </Form>,
        );
        render(
          <Autocomplete
            options={[]}
            variant={variant}
            color={color}
            data-testid={`autocomplete-${variant}-${color}`}
          />,
        );

        const addressInput = page.getByTestId(`address-${variant}-${color}`).element();
        const autocompleteInput = page.getByTestId(`autocomplete-${variant}-${color}`).element();
        const addressRoot = addressInput.closest('div') as HTMLElement;
        const autocompleteRoot = autocompleteInput.closest('div') as HTMLElement;

        const addressStyle = getComputedStyle(addressRoot);
        const autocompleteStyle = getComputedStyle(autocompleteRoot);

        expect(addressStyle.backgroundColor).toBe(autocompleteStyle.backgroundColor);
        expect(addressStyle.color).toBe(autocompleteStyle.color);
        expect(addressStyle.borderRadius).toBe(autocompleteStyle.borderRadius);
        expect(addressStyle.minHeight).toBe(autocompleteStyle.minHeight);

        await expect(addressRoot).toMatchScreenshot(`address-autofill-${variant}-${color}`);
      });
    }
  }

  it('below-min-length state', async () => {
    const user = userEvent.setup();
    render(
      <Form onSubmit={vi.fn()}>
        <AddressAutofill name="address" data-testid="address-below-min" {...CONTENT_PROPS} />
      </Form>,
    );
    await user.click(page.getByTestId('address-below-min').element());
    // Screenshotting the popup text itself, not the input — the input's
    // data-testid lands on the bare <input> (same as Autocomplete's own),
    // which never shows this message; the message renders in the portal-ed
    // Combobox.Empty popup instead.
    const message = await screen.findByText(CONTENT_PROPS.belowMinLengthContent);
    await expect(message).toMatchScreenshot('address-autofill-below-min-length');
  });

  it('loading state', async () => {
    mockedFetch.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(
      <Form onSubmit={vi.fn()}>
        <AddressAutofill name="address" debounceMs={10} data-testid="address-loading" {...CONTENT_PROPS} />
      </Form>,
    );
    await user.type(page.getByTestId('address-loading').element(), 'acker');
    const message = await screen.findByText(CONTENT_PROPS.loadingContent);
    await expect(message).toMatchScreenshot('address-autofill-loading');
  });

  it('no-results state', async () => {
    mockedFetch.mockResolvedValue([]);
    const user = userEvent.setup();
    render(
      <Form onSubmit={vi.fn()}>
        <AddressAutofill name="address" debounceMs={10} data-testid="address-no-results" {...CONTENT_PROPS} />
      </Form>,
    );
    await user.type(page.getByTestId('address-no-results').element(), 'qqqqq');
    const message = await screen.findByText(CONTENT_PROPS.noResultsContent);
    await expect(message).toMatchScreenshot('address-autofill-no-results');
  });

  it('error state', async () => {
    mockedFetch.mockRejectedValue(new Error('network down'));
    const user = userEvent.setup();
    render(
      <Form onSubmit={vi.fn()}>
        <AddressAutofill name="address" debounceMs={10} data-testid="address-error" {...CONTENT_PROPS} />
      </Form>,
    );
    await user.type(page.getByTestId('address-error').element(), 'acker');
    const message = await screen.findByText(CONTENT_PROPS.errorContent);
    await expect(message).toMatchScreenshot('address-autofill-error');
  });

  it('focus ring matches Autocomplete', async () => {
    mockedFetch.mockResolvedValue([]);
    render(
      <Form onSubmit={vi.fn()}>
        <AddressAutofill name="address" data-testid="address-focus" {...CONTENT_PROPS} />
      </Form>,
    );
    render(<Autocomplete options={[]} data-testid="autocomplete-focus" />);

    // Direct .focus()/.blur(), captured one at a time — this file's own
    // established pattern (see Button.visual.test.tsx, Checkbox.visual.test.tsx):
    // only one element can hold focus at once, so both computed styles must be
    // read before moving on to the next, not both read at the end.
    const addressInput = page.getByTestId('address-focus').element() as HTMLElement;
    const autocompleteInput = page.getByTestId('autocomplete-focus').element() as HTMLElement;

    addressInput.focus();
    await settleTransitions();
    const addressBoxShadow = getComputedStyle(addressInput.closest('div') as HTMLElement).boxShadow;
    addressInput.blur();

    autocompleteInput.focus();
    await settleTransitions();
    const autocompleteBoxShadow = getComputedStyle(autocompleteInput.closest('div') as HTMLElement).boxShadow;
    autocompleteInput.blur();

    expect(addressBoxShadow).toBe(autocompleteBoxShadow);
  });
});
```

*The states above only assert on empty/loading/error text, so an empty/rejected `mockedFetch` value
is enough — no `AddressSuggestion` value needs constructing in this file. If a reviewer wants a
populated-list screenshot too, add one more case resolving `mockedFetch` with a suggestion and
selecting it, mirroring Task 5's jsdom test — optional, not required for this task's acceptance.*

- [x] **Step 2: Run once to generate baselines**

Run: `pnpm --filter @hintoric/ui test:visual -- AddressAutofill.visual.test.tsx`
Expected: FAILS the first time with "no existing reference screenshot found" (expected).

- [x] **Step 3: Re-run to confirm and review**

Run: `pnpm --filter @hintoric/ui test:visual -- AddressAutofill.visual.test.tsx`
Expected: PASS. Open every new PNG under
`packages/ui/src/visual/__screenshots__/AddressAutofill.visual.test.tsx/` and confirm each state
actually looks like what its name says before trusting it.

- [x] **Step 4: Commit**

```bash
git add packages/ui/src/visual/AddressAutofill.visual.test.tsx packages/ui/src/visual/__screenshots__/AddressAutofill.visual.test.tsx
git commit -m "Add AddressAutofill visual regression tests"
```

---

## Task 7: Export and changeset

**Files:**
- Modify: `packages/ui/src/index.ts`
- Create: `.changeset/address-autofill.md`

**Interfaces:**
- Consumes: `AddressAutofill`, `AddressAutofillProps`, `AddressSuggestion` from
  `./components/AddressAutofill` (Task 5).

- [ ] **Step 1: Export from the package root**

In `packages/ui/src/index.ts`, add right after the existing `AutocompleteOption` export block
(`export { AutocompleteOption } from './components/AutocompleteOption'; export type {
AutocompleteOptionProps } from './components/AutocompleteOption';`):

```ts
export { AddressAutofill } from './components/AddressAutofill';
export type { AddressAutofillProps, AddressSuggestion } from './components/AddressAutofill';
```

- [ ] **Step 2: Verify it builds and typechecks**

Run: `pnpm --filter @hintoric/ui build && pnpm typecheck`
Expected: no errors; `packages/ui/dist/index.js` now contains `AddressAutofill`.

- [ ] **Step 3: Write the changeset**

```md
---
"@hintoric/ui": minor
---

Add `<AddressAutofill>`, a combobox that searches German addresses (postal code, city, street)
against the free `autofill.api.hintoric.cloud` lookup as you type, and returns the matched address
as a structured object on selection. It always binds to a `name` inside a `<Form>` — there is no
standalone/uncontrolled mode — and requires four content props (`belowMinLengthContent`,
`loadingContent`, `noResultsContent`, `errorContent`) since the component ships no text of its own.

`<Autocomplete>` also gains `loading`, `loadingText` and `noOptionsText` — matching real `@mui/joy`
Autocomplete's own props of the same names, including its rule that `loadingText` only replaces
suggestions when there are none yet, so existing results stay visible while a new search is in
flight. A fourth new prop, `filter`, is Base UI-specific (no Joy equivalent): pass `null` to disable
Base UI's own client-side re-filtering of `options`, needed whenever `options` already reflects a
server-filtered result set for the current query.
```

(File name only needs to be unique under `.changeset/` — `pnpm changeset` would normally generate a
random one; a descriptive name works identically.)

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/index.ts .changeset/address-autofill.md
git commit -m "Export AddressAutofill, add changeset"
```

---

## Task 8: Docs page

**Files:**
- Create: `apps/docs/src/pages/AddressAutofillPage.tsx`
- Modify: `apps/docs/src/nav.ts`
- Modify: `apps/docs/src/App.tsx`

**Interfaces:**
- Consumes: `AddressAutofill`, `Form`, `JoyColor`, `JoyVariant` from `@hintoric/ui` (its built
  `dist/`, per this repo's Vite setup — no `src/` alias exists).

- [ ] **Step 1: Write the docs page**

```tsx
// apps/docs/src/pages/AddressAutofillPage.tsx
import * as React from 'react';
import { AddressAutofill, Form } from '@hintoric/ui';
import type { AddressSuggestion, JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const CONTENT_PROPS = {
  belowMinLengthContent: 'Mindestens 2 Zeichen eingeben.',
  loadingContent: 'Suche läuft…',
  noResultsContent: 'Keine Adresse gefunden.',
  errorContent: 'Adressen konnten nicht geladen werden.',
};

interface AddressFormValues {
  address: AddressSuggestion | null;
}

function AddressAutofillDemo() {
  return (
    <Form<AddressFormValues> onSubmit={() => {}}>
      {(form) => {
        const selected = form.watch('address');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
            <AddressAutofill
              name="address"
              label="Adresse"
              placeholder="Straße, PLZ oder Ort"
              {...CONTENT_PROPS}
            />
            <code>{selected ? JSON.stringify(selected) : 'null'}</code>
          </div>
        );
      }}
    </Form>
  );
}

export function AddressAutofillPage() {
  return (
    <>
      <h1>AddressAutofill</h1>
      <p className="docs-lede">
        A combobox that searches German addresses (postal code, city, street) against the free{' '}
        <code>autofill.api.hintoric.cloud</code> lookup as you type, and returns the matched
        address as a structured object on selection. It always binds to a <code>name</code> inside
        a <code>Form</code> — there is no standalone/uncontrolled mode.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <Form<AddressFormValues> onSubmit={() => {}}>
          <AddressAutofill
            name="address"
            label="Adresse"
            placeholder="Straße, PLZ oder Ort"
            {...CONTENT_PROPS}
          />
        </Form>
      </Demo>
      <Code>{`<Form onSubmit={(values) => save(values)}>
  <AddressAutofill
    name="address"
    label="Adresse"
    placeholder="Straße, PLZ oder Ort"
    belowMinLengthContent="Mindestens 2 Zeichen eingeben."
    loadingContent="Suche läuft…"
    noResultsContent="Keine Adresse gefunden."
    errorContent="Adressen konnten nicht geladen werden."
  />
</Form>`}</Code>

      <h2>Watching the selected value</h2>
      <p>
        There is no <code>value</code>/<code>onChange</code> on the field itself — read the
        selection back with <code>form.watch(name)</code>, the same pattern used on the{' '}
        <a href="/forms">Forms</a> page.
      </p>
      <Demo>
        <AddressAutofillDemo />
      </Demo>
      <Code>{`const selected = form.watch('address');
// { postalCode, city, street, borough, suburb } | null`}</Code>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <Form<AddressFormValues> onSubmit={() => {}}>
          <VariantColorGrid
            variants={VARIANTS}
            colors={COLORS}
            renderCell={(variant, color) => (
              <AddressAutofill
                name={`address-${variant}-${color}`}
                variant={variant}
                color={color}
                {...CONTENT_PROPS}
              />
            )}
          />
        </Form>
      </Demo>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'name', type: 'string', description: 'The react-hook-form field path. Required.' },
          { name: 'getOptionLabel', type: '(value: AddressSuggestion) => string', default: '`${street}, ${postalCode} ${city}`', description: 'Turns a suggestion into display text.' },
          { name: 'minQueryLength', type: 'number', default: '2', description: 'Characters typed before a search fires.' },
          { name: 'debounceMs', type: 'number', default: '300', description: 'Debounce between the last keystroke and the request.' },
          { name: 'limit', type: 'number', default: '10', description: 'Passed to the API as the result cap.' },
          { name: 'belowMinLengthContent', type: 'React.ReactNode', description: 'Shown below minQueryLength. Required, no default.' },
          { name: 'loadingContent', type: 'React.ReactNode', description: 'Shown while a search is in flight with no suggestions yet. Required, no default.' },
          { name: 'noResultsContent', type: 'React.ReactNode', description: 'Shown when a search found nothing. Required, no default.' },
          { name: 'errorContent', type: 'React.ReactNode', description: 'Shown when the search request failed. Required, no default.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'outlined'", description: 'Visual style of the input.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Input height, padding and font size.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input.' },
        ]}
      />
    </>
  );
}
```

- [ ] **Step 2: Register the route and nav entry**

In `apps/docs/src/nav.ts`, add after the `{ to: '/autocomplete', label: 'Autocomplete' }` line
(inside the `Inputs` group):

```ts
      { to: '/address-autofill', label: 'AddressAutofill' },
```

In `apps/docs/src/App.tsx`, add the import after `import { AutocompletePage } from
'./pages/AutocompletePage';`:

```ts
import { AddressAutofillPage } from './pages/AddressAutofillPage';
```

and add the route after `<Route path="/autocomplete" element={<AutocompletePage />} />`:

```tsx
            <Route path="/address-autofill" element={<AddressAutofillPage />} />
```

- [ ] **Step 3: Build the UI package**

Run: `pnpm --filter @hintoric/ui build`
Expected: succeeds; `packages/ui/dist/` now includes the new export (docs resolves `@hintoric/ui`
from `dist/`, not `src/`, so this step is required before the docs dev server reflects anything).

- [ ] **Step 4: Run the docs dev server and verify against the real API in the browser**

Run: `pnpm --filter docs dev` (or use the project's browser-preview tooling to start the `docs`
dev server and open `/address-autofill`).

In the browser: type a real street fragment (e.g. "acker") into the "Basic usage" field and confirm
real suggestions from `autofill.api.hintoric.cloud` appear, that selecting one fills the input, and
that the "Watching the selected value" demo shows the selected `AddressSuggestion` JSON. Also check
the browser's network tab shows a real `GET .../api/autocomplete?q=acker&limit=10` request (not a
mock) — this is the one point in the whole plan that exercises the real network endpoint end to end.

- [ ] **Step 5: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint` (from repo root)
Expected: no errors. If `pnpm lint` reports failures outside `apps/docs/src/pages/AddressAutofillPage.tsx`,
`apps/docs/src/nav.ts`, `apps/docs/src/App.tsx`, or the `packages/ui/src` files this plan touched,
they belong to someone else's concurrent work in this shared checkout — confirm by checking the
reported file paths, not by re-running lint again.

- [ ] **Step 6: Commit**

```bash
git add apps/docs/src/pages/AddressAutofillPage.tsx apps/docs/src/nav.ts apps/docs/src/App.tsx
git commit -m "Add AddressAutofill docs page"
```

---

## Task 9: Final full verification

**Files:** none (verification only).

- [ ] **Step 1: Full jsdom suite**

Run: `pnpm --filter @hintoric/ui test`
Expected: PASS, no regressions in any other component's tests.

- [ ] **Step 2: Full visual suite**

Run: `pnpm --filter @hintoric/ui test:visual`
Expected: PASS. (Do not run this concurrently with another `test:visual` invocation in this shared
checkout — two Chromium instances screenshotting at once produce phantom failures, per this repo's
known trap.)

- [ ] **Step 3: Typecheck and lint, repo-wide**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 4: Confirm the changeset and its scope**

Run: `git status` and `cat .changeset/address-autofill.md`
Expected: working tree clean (everything committed task-by-task already), changeset present and
accurately describing the shipped change.
