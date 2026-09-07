---
"@hintoric/ui": patch
---

Fix the `<Select>` menu opening at the wrong width. The listbox now matches the
width of the Select that opened it, as it does in Joy UI, instead of shrinking
to fit its own options — a 400px Select opened a 79px menu. A menu whose options
are wider than the Select still grows past it, unchanged.

Two smaller box-model fixes came with it, so an option inside the menu now ends
up exactly as wide as Joy UI's: the listbox pads vertically only (it was padding
6px on the left and right too, and the vertical padding now scales with `size`:
4px / 6px / 8px for sm / md / lg), and it draws the 1px outlined-neutral border
it was missing.
