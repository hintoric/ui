---
'@hintoric/ui': patch
---

Fix the type metrics of thirteen components against real `@mui/joy`.

Joy renders every `body-*` typography level at `line-height: 1.5`, and
Tailwind's size utilities each ship their own paired line-height — only
`text-base` happens to agree. So `Alert`, `Badge`, `Breadcrumbs`, `Chip`,
`ChipDelete`, `ListSubheader`, `Snackbar`, `Table` and `Tooltip` rendered text
one or two pixels tighter or looser than the Joy component they mirror.
Separately:

- `Checkbox` and `Radio` had a line-height from their text size where Joy
  derives it from the control's own box dimension.
- `DialogContent`, `ModalClose` and `StepIndicator` used the wrong step of the
  size scale.
- `IconButton`, `ChipDelete` and `ModalClose` are `<button>` elements, which
  do not inherit `font-weight`; they took the browser's 400 where Joy renders
  500. `StepIndicator` had the opposite problem — it forced 500 where Joy
  inherits 400.

Text may shift by a pixel or two in tightly packed layouts.

Every value here was measured against the rendered package, not derived from
its source: the colour-scheme retrofit added `fontSize`, `fontWeight` and
`lineHeight` to the visual suite's comparisons, and these are what it found.
Nothing in the suite had ever compared a font property.
