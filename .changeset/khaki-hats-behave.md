---
"@hintoric/ui": patch
---

Fixed `Skeleton` rendering with a hardcoded light-gray background (`neutral.200`) instead of the scheme-aware surface token real `@mui/joy` uses, so it stayed light-colored — and briefly flashed — in dark mode instead of matching the surrounding dark UI.
