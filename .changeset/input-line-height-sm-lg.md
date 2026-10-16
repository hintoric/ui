---
'@hintoric/ui': patch
---

`Input`, `NumberInput`, `Autocomplete` and `Select` now use Joy UI's line-height at `size="sm"` and `size="lg"`: 1.5, which is 21px at sm and 27px at lg. Before, they took 20px and 28px from Tailwind's `text-sm` and `text-lg`. The control's height does not change, but text and placeholders now sit at the same position as in Joy.
