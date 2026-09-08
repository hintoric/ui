# @hintoric/ui

## 0.5.0

### Minor Changes

- 1aae34e: Add `<AddressAutofill>`, a combobox that searches German addresses (postal code, city, street)
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

  `onInputChange` now receives a second `reason: 'input' | 'reset' | 'clear'` argument — again
  matching `@mui/joy`'s own `AutocompleteInputChangeReason` exactly — so a consumer that re-fetches on
  every input change can gate that on `reason === 'input'` and skip re-searching for an option's own
  label right after it's selected (`AddressAutofill` does exactly this).

- 3074d6b: Add `<MapImage>` and `<AnimatedMapImage>`, components that render a static map for a
  given latitude/longitude by fetching it from `map-image.api.hintoric.cloud`. Both
  handle the loading and error states themselves — pass coordinates (and optionally
  `zoom`/`width`/`height`), get a sized box back that shows a spinner while the map
  loads and a fallback if it fails.

  `<AnimatedMapImage>` is the same component with a one-time entrance once the map
  loads: the frame irises open from the center while a pin drops onto the coordinate
  and an ink ring ripples out from under it. It respects `prefers-reduced-motion`
  automatically, skipping straight to the settled state.

### Patch Changes

- fed99de: Fix `Button`'s type scale to match real `@mui/joy`. It rendered one step too
  large at `size="md"` (16px instead of 14px) and `size="lg"` (18px instead of
  16px), at `font-weight: 500` instead of 600, with line heights to match — so
  every button in the library was visibly larger and lighter than the Joy UI
  component it mirrors. `minHeight` and padding were already correct, which is
  why the difference read as a font problem rather than a layout one.

  Buttons will get slightly smaller, denser text. Layouts that packed buttons to
  the pixel may shift.

  Found while adding colour-scheme coverage to the visual regression suite: no
  assertion in the suite compared a font property, so a 852-test green run had
  never looked at this.

- fed99de: Disabled controls no longer react to the pointer.

  `Button`, `IconButton`, `ChipDelete`, `ListItemButton` and `Select` left
  `pointer-events: auto` on a disabled control where Joy UI sets `none`. CSS
  `:hover` matches a disabled `<button>` in Chrome, so a disabled control
  repainted itself with its hover background whenever the pointer rested on it —
  a disabled `outlined` or `plain` `Select` rendered `#171A1C` instead of
  `#0B0D0E` in dark mode.

  They also used `cursor: not-allowed` where Joy uses `default`.

  This was the last failing test in the visual suite, and it had looked like a
  token problem for a while: the symptom was intermittent, because it depended
  on where the pointer happened to be left by whichever test ran before.

- fed99de: Fix list-surface padding and row colour against real `@mui/joy`.

  - `List` padded all four sides, where Joy's vertical list pads only the block
    axis. Rows were inset by 4–6px per side and never spanned the list's width:
    a `ListItem` in a 320px list measured 312px against Joy's 320px.
  - `MenuList` had 4px of padding all round where Joy renders 6px vertical and
    none horizontal. (This does not apply to `Menu`, the portalled popup — that
    one is 4px all round in Joy too, so the two components differ by design.)
  - `ListItem` inherited the page's text colour, so it rendered black on a dark
    surface. It now uses the `ink-secondary` token, whose two values are exactly
    what Joy renders in each scheme.
  - `AccordionSummary` had no focus-visible ring and fell back to the browser's
    1px outline, where Joy renders the 2px ring its summary inherits from
    `ListItemButton`. Keyboard users had almost no focus indicator on an
    accordion.

  Rows will sit flush with their list's edges rather than inset, and lists get
  slightly less vertical padding at `sm`/`md`.

  Found by giving these components their first visual regression coverage —
  `List` had a test, but `ListItem`, `MenuList` and `AccordionSummary` had none.

- fed99de: Fix `Link` and `Divider` rendering their light colours in dark mode.

  Joy UI remaps its "main" palette channel per colour scheme — palette step 500
  in light, step 400 in dark (`extendTheme.js`). This project had no `main` token
  at all, so components that want "the" colour rather than a variant slot
  hardcoded step 500 and never changed when the scheme did. A variant-less
  `Link` stayed at `#0B6BCB` on a dark page where Joy renders `#4393E4`, and the
  `Divider` line kept the light neutral channel, so it read too dark against a
  dark surface.

  New `--color-{primary,neutral,danger,success,warning}-main` tokens carry the
  remap, and `Link` and the divider token now read them.

  Found by the first dark-mode assertions the visual regression suite has ever
  had: until now every one of its 1248 screenshots and every computed-style
  comparison ran in light mode only.

- fed99de: `RelativeTime` now sets its own text colour instead of inheriting.

  It rendered a bare `<time>` with no styling at all, so on a dark page it showed
  the inherited near-black text on a near-black background and was invisible.
  Its new dark-mode screenshots were solid black rectangles, which is how this
  was found.

  It now uses the `ink-primary` token, so it follows the colour scheme like every
  other text in the library — `primary` rather than a muted step because nothing
  in its design ever specified a muted timestamp. A caller's `className` still
  overrides it.

  In light mode the colour shifts from the browser default `#000000` to the
  token's `#171A1C`, which is a barely perceptible darkening.

- fed99de: Fix `Tab`'s selected state and the Stepper family's typography against real
  `@mui/joy`.

  - A selected `Tab` kept its resting background. Joy's Tab is built on its
    `ListItemButton`, which reacts to `aria-selected`, so a selected solid
    primary tab renders `#12467B` where ours rendered `#0B6BCB` — the selected
    tab was only distinguishable by its underline. `Tab.tsx` had documented the
    opposite, on the strength of reading Joy's `Tab.js`; the behaviour lives in
    the base component that file builds on.
  - `Stepper` did not set the `title-{size}` typography Joy applies to it, and
    `StepIndicator` forced a fixed 16px instead of inheriting. Every Stepper size
    rendered the same type; Joy renders 14px inside a `sm` Stepper.

  Selected tabs now carry their variant's active background, and Stepper text
  follows its size.

- fed99de: Fix the type metrics of thirteen components against real `@mui/joy`.

  Joy renders every `body-*` typography level at `line-height: 1.5`, and
  Tailwind's size utilities each ship their own paired line-height — only
  `text-base` happens to agree. So `Alert`, `Badge`, `Breadcrumbs`, `Chip`,
  `ChipDelete`, `ListSubheader`, `Snackbar`, `Table` and `Tooltip` rendered text
  one or two pixels tighter or looser than the Joy component they mirror.
  Separately:

  - `Checkbox` and `Radio` had a line-height from their text size where Joy
    derives it from the control's own box dimension.
  - `DialogContent`, `ModalClose` and `StepIndicator` used the wrong step of the
    size scale.
  - `IconButton`, `ChipDelete` and `ModalClose` are `<button>` elements, which
    do not inherit `font-weight`; they took the browser's 400 where Joy renders 500. `StepIndicator` had the opposite problem — it forced 500 where Joy
    inherits 400.

  Text may shift by a pixel or two in tightly packed layouts.

  Every value here was measured against the rendered package, not derived from
  its source: the colour-scheme retrofit added `fontSize`, `fontWeight` and
  `lineHeight` to the visual suite's comparisons, and these are what it found.
  Nothing in the suite had ever compared a font property.

## 0.4.1

### Patch Changes

- e50062b: Fixed `Skeleton` rendering with a hardcoded light-gray background (`neutral.200`) instead of the scheme-aware surface token real `@mui/joy` uses, so it stayed light-colored — and briefly flashed — in dark mode instead of matching the surrounding dark UI.
- 27a84e9: Fixed `Input`'s browser autofill highlight showing as a hard-edged rectangle inside the field's rounded, padded pill. The native input now bleeds to the pill's edge under `:-webkit-autofill`, matching corner rounding on whichever side has no decorator, so the autofill background fills the whole control the way `@mui/joy` does.

## 0.4.0

### Minor Changes

- db4d73f: Add `<HintoricLogo>` and `<HintoricIcon>`, components for the Hintoric brand logo
  and its icon mark (transcribed from cdn.hintoric.com/assets/logo/{black,white}.svg;
  the icon has no separate asset — it's the mark portion of that same file).

  Both render with `currentColor`, defaulting to the `ink-primary` token, so they
  recolor automatically between light and dark backgrounds via the existing
  `data-color-scheme` mechanism — no separate black/white asset variants or
  `useColorScheme()` call needed. The color can be overridden like any other
  icon, via `className` or `style`.

## 0.3.1

### Patch Changes

- 5d1ba0a: Fix the `<Select>` menu opening at the wrong width. The listbox now matches the
  width of the Select that opened it, as it does in Joy UI, instead of shrinking
  to fit its own options — a 400px Select opened a 79px menu. A menu whose options
  are wider than the Select still grows past it, unchanged.

  Two smaller box-model fixes came with it, so an option inside the menu now ends
  up exactly as wide as Joy UI's: the listbox pads vertically only (it was padding
  6px on the left and right too, and the vertical padding now scales with `size`:
  4px / 6px / 8px for sm / md / lg), and it draws the 1px outlined-neutral border
  it was missing.

## 0.3.0

### Minor Changes

- 1594f7e: Add six colour scheme switcher forms — `ColorSchemeToggle`, `ColorSchemeMenu`, `ColorSchemeMenuItems`, `ColorSchemeToggleGroup`, `ColorSchemeSwitch` and `ColorSchemeSelect` — and a `system` mode in `ColorSchemeProvider`.

  `ColorSchemeProvider` now follows the operating system's preference by default and keeps following it live. Three notes when upgrading:

  - **`mode` can now be `'system'`.** It is the user's choice, not the applied scheme. Use the new `resolvedMode` (`'light' | 'dark'`) wherever you compared `mode` against `'dark'` — picking a logo, an illustration, a chart palette. Existing code still type-checks and silently serves the light-mode asset on a dark page, which is why this is worth checking by hand.
  - **`defaultMode` now defaults to `'system'`, not `'light'`.** Pass `defaultMode="light"` for the previous behaviour.
  - **Portalled surfaces now follow the scheme.** `Menu`, `Select`'s listbox, `Modal`, `Drawer`, `Tooltip` and `Snackbar` render into a portal on `document.body`, which is a sibling of the provider's wrapper element and never a descendant — so every popup previously stayed light in a dark application. The provider now mirrors the resolved scheme onto `<html>` as well. The trade-off is that nesting providers with different schemes is not supported.

  Tailwind's `dark:` variant shipped in `@hintoric/ui/styles.css` now keys off `data-color-scheme` instead of `prefers-color-scheme`, so `dark:` classes in your own markup follow the switcher rather than the operating system.

- 311514f: Add a `ConfirmationDialog` block: a dialog for an irreversible act whose confirmation is typed rather than clicked.

  `onConfirm` may be async — the block awaits it, shows the loading state, blocks a second submit, and makes Escape and the backdrop inert while the request is in flight, since a dispatched deletion cannot be recalled. A rejection is handed to `errorMessage` and shown in an alert inside the dialog, with the typed text kept so a retry is one click. Every string is a prop with no English default, and `prompt` receives the compared text so what is shown cannot drift from what is checked.

  Also fixes `Button`'s loading state, which this uncovered: `text-transparent` lost to the variant map's `disabled:text-*` on specificity, so a loading button showed its label behind the spinner — and the indicator now carries the disabled colour explicitly instead of inheriting the transparency. Both now match real `@mui/joy`, with the visual coverage that was missing.

- 8283aab: Add `LocaleProvider`: one source for the display language, so `LocaleSwitcher` and `RelativeTime` no longer disagree about it.

  The provider deliberately owns nothing — `locale` is a required prop and it only mirrors it, because in a real application i18next already holds the language with its own detection and persistence. Wiring the two together is one line: `<LocaleProvider locale={i18n.language} onLocaleChange={i18n.changeLanguage} locales={LOCALES}>`.

  Inside one, `<LocaleSwitcher />` needs no props at all; `locales`, `value` and `onChange` are now optional and still win when given, so nothing existing breaks. Date and time components resolve their language narrowest-first: a prop, then `DateTimeProvider`, then `LocaleProvider`, then the runtime default — so "the UI is English but dates are German" keeps working.

- 40b0960: Every field component now binds itself to react-hook-form. Put a `name` on a field inside the new
  `<Form>` and it reads its value, writes changes back, shows its validation message as helper text
  and marks itself invalid for assistive technology — no `Controller` and no `control` prop. `<Form>`
  either builds the form itself from a zod `schema` and `defaultValues`, or takes a `useForm()`
  instance you built yourself. `<FormField>` covers controls outside this set via a render prop.

  All nine fields are included: `Input`, `Textarea`, `Select`, `Autocomplete`, `Checkbox`, `Switch`,
  `Radio`, `RadioGroup` and `Slider`.

  Fields gain `label`, `helperText` and `error` props, and wrap themselves in a `FormControl` with a
  `FormLabel` and `FormHelperText` when you use them. A field with none of them renders exactly the
  markup it did before, so existing layouts are untouched. Outside a `<Form>`, every field behaves
  exactly as it did — a `name` alone changes nothing.

  `react-hook-form` and `zod` are new peer dependencies.

  Two known limits, both deliberate. `Slider` does not receive react-hook-form's focus-on-error,
  because Base UI exposes its control wrapper rather than the focusable thumb; and an invalid
  `Slider` is not recoloured, matching Joy UI, which reads no form-control state on that component
  at all. In both cases the error still shows in the helper text and in `aria-invalid`.

  Fixed: `Input`'s `onChange` handed out a hand-built stand-in event carrying only `target.value`,
  which meant `react-hook-form`'s `register()` could never resolve the field and silently recorded
  nothing. It now receives the real `ChangeEvent`. Code reading `event.target.value` is unaffected.

  Fixed: `FormHelperText` ignored its `FormControl`'s error state and always rendered in the muted
  tertiary colour, so a validation message looked like an ordinary hint. It now takes the danger
  colour on error, and both it and `FormLabel` are muted inside a disabled `FormControl`.

## 0.2.0

### Minor Changes

- 5bf7e8b: Add `LocaleSwitcher`: a compact control for the display language, built for a header corner.

  It deliberately knows no i18n library — it takes `locales`, `value` and `onChange`, and nothing
  else. Knowing i18next would push that dependency onto every application consuming this library.
  The language names come from the caller, so it never has to decide between "Deutsch", "German"
  and "DE".

## 0.1.1

### Patch Changes

- 7a961d3: Add a package-level README and repository/homepage/bugs metadata so the npm listing page renders correctly.
