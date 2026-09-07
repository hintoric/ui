---
'@hintoric/ui': minor
---

Add six colour scheme switcher forms — `ColorSchemeToggle`, `ColorSchemeMenu`, `ColorSchemeMenuItems`, `ColorSchemeToggleGroup`, `ColorSchemeSwitch` and `ColorSchemeSelect` — and a `system` mode in `ColorSchemeProvider`.

`ColorSchemeProvider` now follows the operating system's preference by default and keeps following it live. Three notes when upgrading:

- **`mode` can now be `'system'`.** It is the user's choice, not the applied scheme. Use the new `resolvedMode` (`'light' | 'dark'`) wherever you compared `mode` against `'dark'` — picking a logo, an illustration, a chart palette. Existing code still type-checks and silently serves the light-mode asset on a dark page, which is why this is worth checking by hand.
- **`defaultMode` now defaults to `'system'`, not `'light'`.** Pass `defaultMode="light"` for the previous behaviour.
- **Portalled surfaces now follow the scheme.** `Menu`, `Select`'s listbox, `Modal`, `Drawer`, `Tooltip` and `Snackbar` render into a portal on `document.body`, which is a sibling of the provider's wrapper element and never a descendant — so every popup previously stayed light in a dark application. The provider now mirrors the resolved scheme onto `<html>` as well. The trade-off is that nesting providers with different schemes is not supported.

Tailwind's `dark:` variant shipped in `@hintoric/ui/styles.css` now keys off `data-color-scheme` instead of `prefers-color-scheme`, so `dark:` classes in your own markup follow the switcher rather than the operating system.
