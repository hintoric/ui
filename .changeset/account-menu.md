---
"@hintoric/ui": minor
---

New `AccountMenu` block: the signed-in person in one pill (avatar and menu button) with a card (avatar, address, subtitle), "Appearance" and "Language" as sub-views that stay inside the open menu, your own `items` and a sign-out row. It knows no session, routes or i18n — user, labels, locales and `onSignOut` all come in as props, with the language falling back to a `LocaleProvider`.

`MenuItem` takes `closeOnClick` (default `true`): set it to `false` for an item that changes what the menu shows instead of finishing the job, such as a row that opens a sub-view. `ColorSchemeMenuItems` takes the same `closeOnClick`, plus `onModeChange`, so it can sit in a menu that stays open — until now, choosing a scheme always closed the menu.
