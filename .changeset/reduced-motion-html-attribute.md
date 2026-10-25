---
'@hintoric/ui': minor
---

`ReducedMotionProvider` now also writes its value to `<html data-reduced-motion>` (`reduce` or `no-preference`), the way `ColorSchemeProvider` writes `data-color-scheme`. Code that cannot read the provider, such as the animated icons in `@hintoric/icons` or your own CSS, can follow the app setting through it.
