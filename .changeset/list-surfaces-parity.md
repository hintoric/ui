---
'@hintoric/ui': patch
---

Fix list-surface padding and row colour against real `@mui/joy`.

- `List` padded all four sides, where Joy's vertical list pads only the block
  axis. Rows were inset by 4–6px per side and never spanned the list's width:
  a `ListItem` in a 320px list measured 312px against Joy's 320px.
- `MenuList` had 4px of padding all round where Joy renders 6px vertical and
  none horizontal. (This does not apply to `Menu`, the portalled popup — that
  one is 4px all round in Joy too, so the two components differ by design.)
- `ListItem` inherited the page's text colour, so it rendered black on a dark
  surface. It now uses the `ink-secondary` token, whose two values are exactly
  what Joy renders in each scheme.
- `AccordionSummary` had no focus-visible ring and fell back to the browser's
  1px outline, where Joy renders the 2px ring its summary inherits from
  `ListItemButton`. Keyboard users had almost no focus indicator on an
  accordion.

Rows will sit flush with their list's edges rather than inset, and lists get
slightly less vertical padding at `sm`/`md`.

Found by giving these components their first visual regression coverage —
`List` had a test, but `ListItem`, `MenuList` and `AccordionSummary` had none.
