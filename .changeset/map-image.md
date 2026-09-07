---
'@hintoric/ui': minor
---

Add `<MapImage>` and `<AnimatedMapImage>`, components that render a static map for a
given latitude/longitude by fetching it from `map-image.api.hintoric.cloud`. Both
handle the loading and error states themselves — pass coordinates (and optionally
`zoom`/`width`/`height`), get a sized box back that shows a spinner while the map
loads and a fallback if it fails.

`<AnimatedMapImage>` is the same component with a one-time entrance once the map
loads: the frame irises open from the center while a pin drops onto the coordinate
and an ink ring ripples out from under it. It respects `prefers-reduced-motion`
automatically, skipping straight to the settled state.
