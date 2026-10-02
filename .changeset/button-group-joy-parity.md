---
'@hintoric/ui': minor
---

`ButtonGroup` now works and looks like Joy UI's. The new `variant`, `color` and `size` props, and `disabled`, are passed to every `Button`/`IconButton` inside the group that doesn't set its own. A group of bare buttons therefore renders outlined/neutral/md, as Joy's does. `disabled` now really disables those buttons; before, it only set `aria-disabled` on the container. The buttons join with Joy's separator borders, square inner corners and 1px overlap, replacing the old `overflow: hidden` + divider approximation. The group has `role="group"`.

Behaviour changes to check when upgrading:

- A numeric `spacing` now counts in Joy's 8px steps: `spacing={1}` is 8px, where `spacing={8}` used to mean 8px. A string such as `"1.5rem"` is still used as-is.
- Buttons that relied on Button's own solid/primary default now pick up the group's outlined/neutral. Pass `variant`/`color` to the group, or to the button, to keep the old look.
