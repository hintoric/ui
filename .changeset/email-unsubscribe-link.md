---
'@hintoric/email': minor
---

`Layout` takes an optional `unsubscribe` ({ href, label }) that renders an unsubscribe link as the last line of the footer. `WaitlistWelcomeEmail` exposes it as `unsubscribeUrl` (label from the new optional `messages.unsubscribe`, included in the DE/EN presets). Templates that readers can't opt out of, such as the security alert, are unchanged.
