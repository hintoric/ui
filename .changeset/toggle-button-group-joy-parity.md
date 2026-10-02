---
'@hintoric/ui': minor
---

`ToggleButtonGroup` now looks like Joy UI's. Its `variant`, `color`, new `size` and `disabled` props reach every `Button`/`IconButton` inside it that doesn't set its own, so a group of bare buttons renders outlined/neutral rather than solid/primary. The buttons join seamlessly, with Joy's separator borders and square inner corners. A selected button is marked `aria-pressed="true"` and keeps its pressed fill at the same font weight as its neighbours. A numeric `spacing` now counts in Joy's 8px steps (`spacing={1}` is 8px, not 1px). Selection now also works for buttons wrapped in another element, such as a Tooltip.

Smaller Joy-parity fixes that come with it: `Button` gets Joy's vertical padding, `IconButton` uses a minimum size plus horizontal padding instead of a fixed square, and `plain`/`neutral` buttons darken their text on hover as Joy's do. Both `Button` and `IconButton` now style `aria-pressed="true"` with their variant's active colours.
