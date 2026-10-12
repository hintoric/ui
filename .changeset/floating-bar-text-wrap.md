---
'@hintoric/ui': minor
---

`FloatingBar` gets a `wrap` prop: buttons break onto a second row in a narrow space instead of overflowing. `FloatingBarButton` gets a `text` prop for a text label instead of an icon: it grows with its label and keeps the pill shape (`selected` still draws the pressed state, e.g. with `color="success"`). A `Divider` inside a `variant="solid"` `FloatingBar` is now visible on the filled background; `Divider` reads an optional `--divider-line` custom property for its colour.
