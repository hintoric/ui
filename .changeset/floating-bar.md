---
'@hintoric/ui': minor
---

Add `FloatingBar` and `FloatingBarButton`: a pill of actions that floats over what it acts on.

The shape is the reason the pair exists. In a `rounded-full` bar an `IconButton`'s `rounded-sm`
corner reads as a mistake, so `FloatingBarButton` is a circle — and its `selected` state is a
circle too, drawn with the variant's persistent "active" background, the same mechanism
`ListItemButton` and `ToggleButtonGroup` use for theirs. Omit `selected` for a plain action: a
button with no state should not claim one.

`placement` pins the bar to an edge of the nearest positioned ancestor and picks the orientation
that edge implies; `align` moves it along the edge and `straddle` hangs it half over. Every
distance is a custom property with a fallback — `--floating-bar-inset`, `--floating-bar-offset`,
`--floating-bar-straddle` — so a media query can move the bar inside once there is no room
beside it, which a prop cannot do.
