---
'@hintoric/ui': patch
---

`Textarea` now fills its container, like `@mui/joy`'s. It used to be `inline-flex` and settle at the browser's default textarea width of roughly 210px; it is now `display: flex` with `width: 100%`, so it stretches to the width of its parent. It is still a single `<textarea>` — `className`, `ref` and the disabled styling all reach the same element as before. If you relied on the old width, set a width yourself.
