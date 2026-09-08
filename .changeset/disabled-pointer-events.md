---
'@hintoric/ui': patch
---

Disabled controls no longer react to the pointer.

`Button`, `IconButton`, `ChipDelete`, `ListItemButton` and `Select` left
`pointer-events: auto` on a disabled control where Joy UI sets `none`. CSS
`:hover` matches a disabled `<button>` in Chrome, so a disabled control
repainted itself with its hover background whenever the pointer rested on it —
a disabled `outlined` or `plain` `Select` rendered `#171A1C` instead of
`#0B0D0E` in dark mode.

They also used `cursor: not-allowed` where Joy uses `default`.

This was the last failing test in the visual suite, and it had looked like a
token problem for a while: the symptom was intermittent, because it depended
on where the pointer happened to be left by whichever test ran before.
