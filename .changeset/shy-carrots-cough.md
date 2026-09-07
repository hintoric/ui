---
"@hintoric/ui": patch
---

Fixed `Input`'s browser autofill highlight showing as a hard-edged rectangle inside the field's rounded, padded pill. The native input now bleeds to the pill's edge under `:-webkit-autofill`, matching corner rounding on whichever side has no decorator, so the autofill background fills the whole control the way `@mui/joy` does.
