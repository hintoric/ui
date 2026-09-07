---
'@hintoric/ui': patch
---

Fix `Button`'s type scale to match real `@mui/joy`. It rendered one step too
large at `size="md"` (16px instead of 14px) and `size="lg"` (18px instead of
16px), at `font-weight: 500` instead of 600, with line heights to match — so
every button in the library was visibly larger and lighter than the Joy UI
component it mirrors. `minHeight` and padding were already correct, which is
why the difference read as a font problem rather than a layout one.

Buttons will get slightly smaller, denser text. Layouts that packed buttons to
the pixel may shift.

Found while adding colour-scheme coverage to the visual regression suite: no
assertion in the suite compared a font property, so a 852-test green run had
never looked at this.
