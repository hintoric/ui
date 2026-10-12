---
'@hintoric/ui': patch
---

Fix `Tooltip` rendering underneath a `Modal` or `Drawer`. The `z-index` was set on the popup, which isn't positioned, so it had no effect; it now sits on the positioner (1500, like Joy UI), so a tooltip on a control inside a dialog is visible.
