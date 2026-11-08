---
'@hintoric/ui': patch
---

Fixed `HintoricIcon` missing the right needle of the Hintoric mark. It now draws all three needles, the same as the mark in `HintoricLogo`, and its `viewBox` is `0 0 324 326` (was `0 0 282.481 326`). Because the mark is now complete, the icon is wider: `0.994em` instead of `0.867em` at the same height. If you sized it with a fixed width, check that it still fits.
