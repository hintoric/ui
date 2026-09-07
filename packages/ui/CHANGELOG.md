# @hintoric/ui

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
