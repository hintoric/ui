---
'@hintoric/ui': patch
---

`RelativeTime` now sets its own text colour instead of inheriting.

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
