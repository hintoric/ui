---
"@hintoric/ui": minor
---

Add `<HintoricLogo>` and `<HintoricIcon>`, components for the Hintoric brand logo
and its icon mark (transcribed from cdn.hintoric.com/assets/logo/{black,white}.svg;
the icon has no separate asset — it's the mark portion of that same file).

Both render with `currentColor`, defaulting to the `ink-primary` token, so they
recolor automatically between light and dark backgrounds via the existing
`data-color-scheme` mechanism — no separate black/white asset variants or
`useColorScheme()` call needed. The color can be overridden like any other
icon, via `className` or `style`.
