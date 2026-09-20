---
'@hintoric/ui': minor
---

Add `<FileInput>`, a drop zone that also opens the file picker. Pass `onFiles` and
get back what was chosen or dropped; `accept`, `multiple` and `disabled` work as on
the native element, and the zone picks up `disabled` from a surrounding
`<FormControl>`.

The native `<input type="file">` stays underneath rather than being replaced, so the
keyboard, screen readers and testing-library's `upload()` all keep working — only the
browser's own grey widget is hidden. The field clears itself after every pick, which
is what lets the same file be chosen again after a failed upload: without it the
second attempt fires no change event at all and nothing appears to happen.
