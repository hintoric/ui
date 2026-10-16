---
'@hintoric/ui': patch
---

`Textarea` now matches Joy UI's height: it starts at one row instead of the browser's default two, and grows with its content as you type. New `minRows` and `maxRows` props set the smallest and largest height in rows; past `maxRows` the content scrolls. An existing `rows` prop is read as `minRows`. The vertical padding and the `sm`/`lg` line height now also match Joy, so each size has Joy's height (32px, 36px and 51px at one row).

To measure its content, `Textarea` renders a second, hidden `<textarea aria-hidden>` right after the real one. `className`, `ref` and every other prop still reach the real field, which stays the first element; only code that counts all `<textarea>` elements on a page sees the extra one.
