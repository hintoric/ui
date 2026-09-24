---
name: core-component-audit
description: Audit hintoric/core React components against @hintoric/ui and enforce the repository's component boundaries.
---

# Core component audit

Use this skill when reviewing or adding React UI in `hintoric/core`.

## Source of truth

`@hintoric/ui` is the source of truth for reusable visual primitives. Read the
library exports and the repository's `CLAUDE.md` before proposing a new component.
The audit report is `docs/core-component-audit.md`.

## Required workflow

1. Search `@hintoric/ui` exports before writing a native control or a local visual
   replacement.
2. Classify the code as either:
   - **Library primitive**: neutral UI with reusable behavior and visual tokens.
   - **Core composition**: product behavior, routing, session, upload, document,
     editor, PDF, tenant or i18n logic.
3. Keep core compositions in `core`. Do not move `AccountBar`, `CreateMenu`,
   document tiles, PDF/DOCX editor chrome, or route-specific dialogs into the
   library merely because they contain several UI elements.
4. Only propose a new library component when it is domain-neutral and has at least
   two concrete consumers. Prefer composing existing exports over adding another
   abstraction.
5. For library primitives, preserve the established Joy-compatible API:
   `variant`, `color`, `size`, `component`, `startDecorator`, `endDecorator`,
   `className`, and the existing theme tokens. Do not invent a second API or
   hard-code colors, radii, shadows, typography, or focus styles.
6. For core CSS, allow product layout and responsive composition only. Reuse
   library colors, typography, component states and spacing instead of duplicating
   them with bespoke values.
7. Prefer `DialogTitle`, `DialogContent`, and `DialogActions` for new dialog
   composition when their semantics fit. Keep domain-specific state and mutations
   in `core`.
8. Preserve accessibility: use the library/Base UI primitive, forward labels and
   refs, keep native inputs only when they are an intentional technical trigger,
   and test keyboard/focus behavior.
9. If a library component is added or changed, require the full visual test matrix
   and changeset described in `CLAUDE.md`. Do not accept a component without
   Light/Dark coverage and the required computed-style assertions.

## Audit output

Report findings in this order:

| Severity | Meaning |
| --- | --- |
| `must-fix` | Local primitive duplicates an existing library export or violates accessibility/theming. |
| `candidate` | A domain-neutral component has multiple consumers and is a plausible library addition. |
| `keep-in-core` | Correctly scoped product composition; no library extraction recommended. |
| `note` | Small consistency improvement, such as using an existing dialog subcomponent. |

For every finding include the file, symbol, evidence, classification, and the
smallest compliant change. Do not recommend extraction based on visual similarity
alone.

## Core examples

- `routes/documents.tsx`: use `FileInput`; keep upload state, server calls and
  document-specific picker behavior in core.
- `layouts/CreateMenu.tsx`: compose `Dropdown`, `MenuButton`, `Menu`, `MenuItem`
  and `Snackbar`; do not create a generic `CreateMenu` library component.
- `layouts/AccountBar.tsx`: keep session/logout/tenant and nested menu state in core;
  use library primitives for the rendered surface.
- `components/RenameDocumentDialog.tsx`: keep document rename behavior in core;
  prefer existing dialog subcomponents for new structure.
- `lib/ColorSchemeButton.tsx` and `i18n/LanguageSwitcher.tsx`: thin localized
  adapters are valid; they may translate labels and connect app state but must not
  fork the visual implementation.

Never solve a missing abstraction by inventing an app-local color or variant
system. First identify the existing library primitive, then compose it, and only
after a documented multi-consumer need propose a library change.
