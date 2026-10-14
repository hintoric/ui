---
'@hintoric/ui': minor
---

`Alert` now shows the icon for its colour by default, on the left and on the first line: info for `primary` and `neutral`, report for `danger`, a check for `success` and a warning sign for `warning` — the Material icons Joy's own Alert demos use. It is 20px up to `md` and 24px at `lg`, in the alert's text colour, as Joy sizes icons in an alert. Existing alerts without a `startDecorator` gain the icon; a `startDecorator` still replaces it, and `startDecorator={null}` leaves it out. `ConfirmationDialog`'s error alert shows it too.

The icon is also exported on its own as `AlertIcon` (`color`, `size`), with the paths and the colour mapping as `ALERT_ICONS` and `ALERT_ICON_FOR_COLOR`.
