---
'@hintoric/ui': minor
---

Add a `ConfirmationDialog` block: a dialog for an irreversible act whose confirmation is typed rather than clicked.

`onConfirm` may be async — the block awaits it, shows the loading state, blocks a second submit, and makes Escape and the backdrop inert while the request is in flight, since a dispatched deletion cannot be recalled. A rejection is handed to `errorMessage` and shown in an alert inside the dialog, with the typed text kept so a retry is one click. Every string is a prop with no English default, and `prompt` receives the compared text so what is shown cannot drift from what is checked.

Also fixes `Button`'s loading state, which this uncovered: `text-transparent` lost to the variant map's `disabled:text-*` on specificity, so a loading button showed its label behind the spinner — and the indicator now carries the disabled colour explicitly instead of inheriting the transparency. Both now match real `@mui/joy`, with the visual coverage that was missing.
