---
'@hintoric/email': minor
---

Mails for Kratos' link flows and for account security alerts.

- New `AuthLinkEmail` / `renderAuthLink`: the mail for a flow that sends a link instead of a code — `verification_valid` and `recovery_valid`. Heading, one sentence and the button; recovery also says not to pass the link on. German and English messages (`authLinkMessagesDe` / `…En`).
- `AuthNoAccountEmail` takes `channel: 'code' | 'link'` (default `'code'`), so the answer to a link request for an address without an account speaks of a link, not a code. The new `channel` is also passed to every message function.
- `SecurityActivityAlertEmail` for an account target needs no actor: `activity.actorName` is optional, and without it the summary and the preview line say what happened without a subject. For an `account` target the default guidance is now "Wenn du das nicht warst, sichere dein Konto jetzt." and the button "Konto prüfen" (English: "If this wasn't you, secure your account now." / "Review account"); a workspace alert keeps its wording. `messages.reviewButton` may now be a function of the alert's context.
