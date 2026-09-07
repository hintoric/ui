---
'@hintoric/ui': patch
---

Fix `Tab`'s selected state and the Stepper family's typography against real
`@mui/joy`.

- A selected `Tab` kept its resting background. Joy's Tab is built on its
  `ListItemButton`, which reacts to `aria-selected`, so a selected solid
  primary tab renders `#12467B` where ours rendered `#0B6BCB` — the selected
  tab was only distinguishable by its underline. `Tab.tsx` had documented the
  opposite, on the strength of reading Joy's `Tab.js`; the behaviour lives in
  the base component that file builds on.
- `Stepper` did not set the `title-{size}` typography Joy applies to it, and
  `StepIndicator` forced a fixed 16px instead of inheriting. Every Stepper size
  rendered the same type; Joy renders 14px inside a `sm` Stepper.

Selected tabs now carry their variant's active background, and Stepper text
follows its size.
