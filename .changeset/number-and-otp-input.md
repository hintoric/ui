---
'@hintoric/ui': minor
---

New `NumberInput` and `OtpInput` components, both in Input's look and both binding to a `<Form>` by `name` like every other field.

- **`NumberInput`** is a number field with − / + buttons. It parses and formats with `Intl` (`format`, `locale`), steps with the arrow keys (Shift/Alt for large/small steps), clamps to `min`/`max`, and reports a `number | null` rather than a string — so a schema is plain `z.number()`. Unlike `Input`, it fills the width of its container, as Joy's input does.
- **`OtpInput`** is a one-time-code field with one slot per character (`length`, default 6). Focus moves on while typing, a pasted or SMS-autofilled code spreads across the slots, `validationType` filters what is accepted, `mask` hides the characters, and `onComplete` fires once the code is full. Inside a `<Form>`, a half-typed code is left to the schema instead of being blocked by the browser's own pattern check.
