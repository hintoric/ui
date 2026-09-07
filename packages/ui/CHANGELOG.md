# @hintoric/ui

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
