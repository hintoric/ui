---
"@hintoric/ui": minor
---

Add `@hintoric/ui/tailwind.css` for apps that run their own Tailwind CSS v4 (4.1 or later). Import it in your Tailwind stylesheet instead of `@hintoric/ui/styles.css`:

```css
@import "tailwindcss";
@import "@hintoric/ui/tailwind.css";
```

It contains the library's theme tokens (including the dark-mode values), the `dark:` variant that follows `ColorSchemeProvider`, and a `@source` for the library bundle. Your build then generates the utilities for our components and for your own markup — `md:` and other responsive variants, arbitrary values, and so on — all with the same tokens. Do not load both files: a second Tailwind build next to `styles.css` changes which utility wins inside our components. The token names are now public API, so renaming or removing one is a breaking change.

`Divider` now writes its pseudo-element `content` with single quotes, so a Tailwind build that scans the published bundle still generates its lines. It looks the same as before.
