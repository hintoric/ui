# Visual regression coverage audit

**Date:** 2026-09-06
**Prompted by:** two component bugs found by accident within an hour of each other, both while writing documentation, neither caught by a green 775-test visual suite.

## The two bugs

**Card** was missing `position: relative`. Real `@mui/joy` sets it (`Card.js:76`). Without it, `CardCover`'s `absolute inset-0` layer anchored to the viewport instead of the card and covered the entire page. Found by writing a `CardCover` example and looking at it.

**Select** rendered as a small button instead of a form field. Its root was `inline-flex` and shrank to its content; Joy's `SelectRoot` is a block-level flex container that fills its parent. Found by a user looking at the documentation page.

Both had passing tests.

## Why the suite missed them

Three mechanisms, in order of how much damage they do:

**1. The pass/fail signal is a hand-written list of properties, and it is short.** Card's test compared `backgroundColor`, `color`, `borderColor`, `borderWidth`, `borderRadius`, `padding`. Select's compared `backgroundColor`, `color`, `borderRadius`, `minHeight` and the last shadow layer. A property nobody thought to list can diverge forever. `position` and `width` were not on either list.

**2. `toMatchScreenshot()` cannot catch a Joy-vs-ours divergence, by construction.** It compares each element against *its own* stored baseline — Joy's against Joy's, ours against ours. Our narrow Select matched our narrow baseline perfectly. The two PNGs sit side by side in the same directory and are never diffed against each other. This is documented in CLAUDE.md and is a deliberate trade-off (two independently rendered elements differ by stray anti-aliased pixels), but it means the screenshots are a self-regression check and contribute nothing to parity.

**3. Sub-component tests build their own context instead of composing the real parent.** `CardCover`'s test wraps it in a hand-made `<div style={{ position: 'relative' }}>`. It therefore verified `CardCover` against a correctly positioned parent that the real `Card` never provided. The bug lived in the composition, and nothing composed them.

A fourth, smaller point: `position: relative` on a static block moves zero pixels. Even a real Joy-vs-ours image diff would have been identical. Some divergences are invisible to screenshots in principle.

## P1 — Confirmed: every form control has Select's bug

Measured directly, each rendered inside a 400px-wide parent, comparing each component's own visual root:

| Component | `@mui/joy` root | `@hintoric/ui` root |
|---|---|---|
| Select | `DIV` `flex` / 400px | fixed 2026-09-06 |
| Input | `DIV` `flex` / 400px | `SPAN` `inline-flex` / **201px** |
| Textarea | `DIV` `flex` / 400px | `TEXTAREA` `inline-flex` / **210px** |
| Autocomplete | `DIV` `flex` / 353.5px | `DIV` `inline-flex` / **229px** |

All four shrink to content where Joy fills the container. These are the library's most-used components and the divergence is immediately visible in any real form layout.

Note the widths our controls settle at (201px, 210px, 229px) are browser defaults for the underlying element, not chosen values — further evidence nothing ever asserted them.

Two notes for whoever fixes these:

- Our `Textarea` **is** the `<textarea>`; Joy's has a wrapper `<div>` that carries the styling. The fix is not symmetric with the others.
- A `<button>` keeps a shrink-to-fit `auto` width in Chrome even as a block-level flex container, so `flex` alone was not enough for Select — it needed `w-full`. Expect the same for any control whose root is a button.

## P2 — No test asserts `width` or `display`

Before Select was fixed, not one of the 63 test files compared `width` or `display` on a component where fill-versus-shrink is a design decision. `ButtonGroup`, `CardContent`, `CardActions`, `DialogActions`, `FormControl`, `List`, `RadioGroup`, `ListItemDecorator` and `ToggleButtonGroup` do assert `display`/`flexDirection`, but as layout-direction checks, not sizing.

Recommendation: any component that is a form control, a surface, or a layout primitive should assert `display` and `width` inside a fixed-width parent. It is one extra line per test and it is the assertion that would have caught all four P1 bugs.

## P3 — Interactive states not exercised

CLAUDE.md requirement 2 asks for focus, hover and disabled coverage where the component has those states. A mechanical pass over each component's class lists against its test:

| Component | Uncovered |
|---|---|
| Autocomplete | hover, focus |
| ModalClose | hover, focus |
| Button | hover, disabled |
| IconButton | hover, disabled |
| Link | hover, disabled |
| ListItemButton | hover, disabled |
| ChipDelete | hover, disabled |
| AutocompleteOption | hover, disabled |
| Slider | focus |
| Accordion, ButtonGroup, FormControl, Option, Radio, Switch, ToggleButtonGroup, Tooltip | disabled |

**This list is a triage shortlist, not a defect list.** It flags a state the component's classes support and its test never enters; whether each one actually diverges has to be checked case by case. The heuristic also has known false positives — `Tooltip`'s "disabled" is `disabled={!title}`, and `DataGrid`'s hover is covered by asserting the `group-hover:` class rather than by driving a pointer.

Worth noting that `Autocomplete` and `ModalClose` lack **focus** coverage. Input's focus ring is the bug CLAUDE.md cites as the reason the rule exists, and Select's focus ring turned out to diverge too (see below) — focus is empirically the highest-yield state to cover.

## What Select's expanded test found once the states were added

Adding the missing properties and states to one component turned up four further divergences beyond the width bug, all invisible to the old assertions:

- The focus ring followed `color`. Joy's does not — `Select.js` derives a per-colour highlight and then overwrites it unconditionally with a flat `focusVisible`, unlike `Input`, which keeps the per-colour value through a `var(..., focusVisible)` fallback. A `danger` Select focuses to primary in the real package.
- Disabled kept `cursor: pointer`; Joy uses `default`.
- The open listbox had no text colour, inheriting the UA's black instead of Joy's neutral-700.
- The listbox had 4px of padding instead of 6px.

One component, five real divergences, from adding assertions to a test that was already "passing". That ratio is the argument for working through P1–P3.

## Suggested order

1. Fix `Input`, `Textarea`, `Autocomplete` sizing (P1) — confirmed, visible, three components.
2. Add `display` + `width` assertions inside a fixed-width parent across the suite (P2) — cheap, and prevents the whole class from recurring.
3. Work down P3 by usage: Button, IconButton, Input, Link first.
4. Where a sub-component's test builds its own parent context, add one case that composes the real parent instead (P3's structural cousin — this is what hid the Card bug).

## Out of scope

`DataGrid` and `RelativeTime` have no `@mui/joy` counterpart and are documented exemptions from the parity rule. Their tests are screenshot- and behaviour-based by design; they are not gaps.
