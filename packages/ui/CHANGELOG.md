# @hintoric/ui

## 0.10.0

### Minor Changes

- 45597dc: `Alert` and `Snackbar` now top-align their `startDecorator` and `endDecorator`, so an icon stays on the first line of multi-line content instead of floating in the vertical middle. Single-line alerts look the same as before. New `AlertTitle` renders a 16px semibold title above the body text of an `Alert`.

## 0.9.0

### Minor Changes

- fed8ba4: New `AccountMenu` block: the signed-in person in one pill (avatar and menu button) with a card (avatar, address, subtitle), "Appearance" and "Language" as sub-views that stay inside the open menu, your own `items` and a sign-out row. It knows no session, routes or i18n — user, labels, locales and `onSignOut` all come in as props, with the language falling back to a `LocaleProvider`.

  `MenuItem` takes `closeOnClick` (default `true`): set it to `false` for an item that changes what the menu shows instead of finishing the job, such as a row that opens a sub-view. `ColorSchemeMenuItems` takes the same `closeOnClick`, plus `onModeChange`, so it can sit in a menu that stays open — until now, choosing a scheme always closed the menu.

- d7598bb: Add `TabNav` for navigation tabs: a `<nav>` of links that look like `TabList` + `Tab`, with the same sliding indicator under the current page. Put the usual `Tab`s inside, with `href` (and `component` for a router link), and pass the current route as `value`:

  ```tsx
  <TabNav value={pathname} aria-label="Main">
    <Tab value="/documents" href="/documents" component={RouterLink}>
      Documents
    </Tab>
  </TabNav>
  ```

  Unlike Joy UI's `<Tab component={Link}>` inside `Tabs`, the links get `aria-current="page"` instead of `role="tab"`, and every link stays in the Tab order.

  `Tab` now matches Joy UI's measurements: 1rem horizontal padding at `md` (0.75rem/1.25rem at `sm`/`lg`) plus Joy's vertical padding, a transparent 1px border, Joy's focus ring, and Joy's disabled look (the variant's disabled colours and no pointer events, instead of 60% opacity). Existing tabs therefore become slightly wider and taller.

- eb80b9b: Add `@hintoric/ui/tailwind.css` for apps that run their own Tailwind CSS v4 (4.1 or later). Import it in your Tailwind stylesheet instead of `@hintoric/ui/styles.css`:

  ```css
  @import 'tailwindcss';
  @import '@hintoric/ui/tailwind.css';
  ```

  It contains the library's theme tokens (including the dark-mode values), the `dark:` variant that follows `ColorSchemeProvider`, and a `@source` for the library bundle. Your build then generates the utilities for our components and for your own markup — `md:` and other responsive variants, arbitrary values, and so on — all with the same tokens. Do not load both files: a second Tailwind build next to `styles.css` changes which utility wins inside our components. The token names are now public API, so renaming or removing one is a breaking change.

  `Divider` now writes its pseudo-element `content` with single quotes, so a Tailwind build that scans the published bundle still generates its lines. It looks the same as before.

- 6800887: Add `ReducedMotionProvider` and `useReducedMotion` so applications can pass their own reduced-motion preference into `@hintoric/ui`. Components still fall back to `prefers-reduced-motion` when no provider is present.

  Animated/loading components and larger UI transitions now respect that preference, including progress indicators, skeletons, loading spinners, map loading, accordions, tabs, modal/dialog and drawer transitions.

### Patch Changes

- db47386: `TabList` now matches Joy UI's `TabList`:

  - It draws Joy's default underline: a 1px divider line under a horizontal list, or to the right of a vertical one. The selected tab's indicator sits on that line.
  - Tabs touch. The 4px gap between them is gone.
  - The indicator takes the colour of the selected `Tab`, not the colour of the list. For example, a `solid` list with plain tabs no longer gets an indicator in the list's text colour.
  - In a vertical list, the indicator is now on the right of the selected tab, as in Joy UI. It used to be on the left. Vertical tabs also align their label to the start instead of the centre, and get Joy's padding.

  So a horizontal `TabList` is now 1px taller, and a vertical one is 1px wider.

- db47386: `Tabs` now matches Joy UI's `Tabs`:

  - The root has square corners in every variant. It used to have an 8px radius, which Joy UI's `Tabs` does not have. This is visible on `solid`, `soft` and `outlined` tabs.
  - The `size` prop now sets the root's text size: 14px for `sm`, 16px for `md` and 18px for `lg`, as in Joy UI. Before, the root always used the inherited size.
  - `Tab` and `TabPanel` use a line-height of 1.5 at every size. At `sm` and `lg` they had 20px and 28px. Joy UI has 21px and 27px, so `sm` tabs and panels are now 1px taller, and `lg` ones are 1px shorter.
  - The root is now `position: relative`, as in Joy UI. Absolutely positioned children now position against the `Tabs` root.

## 0.8.0

### Minor Changes

- 5db1699: `ButtonGroup` now works and looks like Joy UI's. The new `variant`, `color` and `size` props, and `disabled`, are passed to every `Button`/`IconButton` inside the group that doesn't set its own. A group of bare buttons therefore renders outlined/neutral/md, as Joy's does. `disabled` now really disables those buttons; before, it only set `aria-disabled` on the container. The buttons join with Joy's separator borders, square inner corners and 1px overlap, replacing the old `overflow: hidden` + divider approximation. The group has `role="group"`.

  Behaviour changes to check when upgrading:

  - A numeric `spacing` now counts in Joy's 8px steps: `spacing={1}` is 8px, where `spacing={8}` used to mean 8px. A string such as `"1.5rem"` is still used as-is.
  - Buttons that relied on Button's own solid/primary default now pick up the group's outlined/neutral. Pass `variant`/`color` to the group, or to the button, to keep the old look.

- 5db1699: `ToggleButtonGroup` now looks like Joy UI's. Its `variant`, `color`, new `size` and `disabled` props reach every `Button`/`IconButton` inside it that doesn't set its own, so a group of bare buttons renders outlined/neutral rather than solid/primary. The buttons join seamlessly, with Joy's separator borders and square inner corners. A selected button is marked `aria-pressed="true"` and keeps its pressed fill at the same font weight as its neighbours. A numeric `spacing` now counts in Joy's 8px steps (`spacing={1}` is 8px, not 1px). Selection now also works for buttons wrapped in another element, such as a Tooltip.

  Smaller Joy-parity fixes that come with it: `Button` gets Joy's vertical padding, `IconButton` uses a minimum size plus horizontal padding instead of a fixed square, and `plain`/`neutral` buttons darken their text on hover as Joy's do. Both `Button` and `IconButton` now style `aria-pressed="true"` with their variant's active colours.

## 0.7.0

### Minor Changes

- dc8a325: Add `pill` to `Button`, `IconButton` and `MenuButton`, give `MenuButton` its missing slots, and add `FloatingBarMenuButton`.

  `pill` rounds a button's ends fully — a circle on `IconButton`. It is not a Joy prop: Joy reaches
  the shape through `sx={{ borderRadius: 'xl' }}`, and this library has no `sx`, so consumers had
  been writing `className="rounded-full"` by hand next to every `FloatingBar` and every rounded
  search field. Now it is one word, and the corner it replaces is dropped rather than overridden.

  `MenuButton` now takes `startDecorator`, `endDecorator` and `loading` exactly as `Button` does.
  Joy's trigger reuses Button's whole formula, slots included; ours had only reused the classes, so
  an icon in a trigger was a bare child with no gap of its own and no loading state at all. Both
  components render their insides from one `ButtonBody` now, so they cannot drift again.

  `FloatingBarMenuButton` is a `FloatingBarButton` that opens a `Menu` inside a `Dropdown`: the same
  circle, sized by the bar, without `selected`. It exists because a `MenuButton` cannot be a
  `FloatingBarButton` — one is a Base UI menu trigger, the other a Base UI button — and every
  "more actions" menu at the end of a bar had been a `MenuButton` with `rounded-full` and a width
  by hand.

## 0.6.0

### Minor Changes

- 4f6ecfd: Add `FloatingBar` and `FloatingBarButton`: a pill of actions that floats over what it acts on.

  The shape is the reason the pair exists. In a `rounded-full` bar an `IconButton`'s `rounded-sm`
  corner reads as a mistake, so `FloatingBarButton` is a circle — and its `selected` state is a
  circle too, drawn with the variant's persistent "active" background, the same mechanism
  `ListItemButton` and `ToggleButtonGroup` use for theirs. Omit `selected` for a plain action: a
  button with no state should not claim one.

  `placement` pins the bar to an edge of the nearest positioned ancestor and picks the orientation
  that edge implies; `align` moves it along the edge and `straddle` hangs it half over. Every
  distance is a custom property with a fallback — `--floating-bar-inset`, `--floating-bar-offset`,
  `--floating-bar-straddle` — so a media query can move the bar inside once there is no room
  beside it, which a prop cannot do.

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

- 337f6cd: Add `<FileInput>`, a drop zone that also opens the file picker. Pass `onFiles` and
  get back what was chosen or dropped; `accept`, `multiple` and `disabled` work as on
  the native element, and the zone picks up `disabled` from a surrounding
  `<FormControl>`.

  The native `<input type="file">` stays underneath rather than being replaced, so the
  keyboard, screen readers and testing-library's `upload()` all keep working — only the
  browser's own grey widget is hidden. The field clears itself after every pick, which
  is what lets the same file be chosen again after a failed upload: without it the
  second attempt fires no change event at all and nothing appears to happen.

- 3074d6b: Add `<MapImage>` and `<AnimatedMapImage>`, components that render a static map for a
  given latitude/longitude by fetching it from `map-image.api.hintoric.cloud`. Both
  handle the loading and error states themselves — pass coordinates (and optionally
  `zoom`/`width`/`height`), get a sized box back that shows a spinner while the map
  loads and a fallback if it fails.

  `<AnimatedMapImage>` is the same component with a one-time entrance once the map
  loads: the frame irises open from the center while a pin drops onto the coordinate
  and an ink ring ripples out from under it. It respects `prefers-reduced-motion`
  automatically, skipping straight to the settled state.

- 337f6cd: Add `BlurhashImage`, a picture that holds its own place: the [BlurHash](https://github.com/woltapp/blurhash) paints immediately and the real image fades in over it. It is the `Skeleton` role filled with the colours of the actual picture rather than a grey rectangle — and without a `hash` prop it really is a `Skeleton`, so it can be adopted before the backend has a hash column. An image served from cache is revealed correctly, and when an image fails to load the placeholder stays put instead of collapsing to a broken-image icon.

  Also exported: `Blurhash`, the decoded canvas on its own for building your own image containers, and `encodeBlurhash(source, options?)`, which turns a `File`, `Blob`, `HTMLImageElement` or `ImageBitmap` into a hash in the browser at upload time.

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
