---
'@hintoric/email': minor
---

Two templates for the mails of a sign-in flow, built for Kratos' courier.

`AuthCodeEmail` (`renderAuthCode`) sends a one-time code for each of the four flows — `purpose: 'verification' | 'registration' | 'login' | 'recovery'` — with the heading and subject naming the flow. The code sits in its own box, large, in a monospace face and as one piece, so a double-click copies all of it. An optional `url` adds a button that does what the code does (Kratos' verification link), `email` names the address in the intro, and `expiresInMinutes` adds a line under the code. Login and recovery codes also tell the reader not to pass them on. The inbox preview line shows the code.

`AuthNoAccountEmail` (`renderAuthNoAccount`) answers a verification or recovery request for an address without an account — Kratos' `*_code.invalid` templates — without a code: what was attempted, the missing account in a warning alert, the likely mix-up and an optional `registrationUrl` button.

Both come with German and English messages (`authCodeMessagesDe`/`…En`, `authNoAccountMessagesDe`/`…En`) and a `…Content` export for in-app previews. `emailFonts` gains `code`, a monospace stack.

New components `Alert` and `AlertTitle`, the email counterparts of `@hintoric/ui`'s, with the same `variant`, `color` and `size` (default soft / neutral / md) and optional `startDecorator` / `endDecorator`, which sit on the first line as on the web. Like the web Alert it shows the icon for its colour by default, as a light / dark pair of hosted PNGs under `cdn.hintoric.com/assets/email/alert/` (`startDecorator={null}` leaves it out); `emailAlertIconFiles()` lists every file it can ask for. The visual suite compares every variant × colour against the web Alert in light and dark, the sizes also without a doctype.

The German texts of every template follow the UX-writing rules now: no "wir" (footers read "Du erhältst diese E-Mail, weil …"), no product prefix on nouns ("dein Konto bei hintoric" instead of "dein hintoric-Konto"), "hintoric" in lower case as everywhere else, "Admin" wording replaced by "weil du diesen Workspace verwaltest", and times with "Uhr" ("28. September 2026 um 19:31 Uhr"). The waitlist mail's unsubscribe link reads "E-Mails abbestellen", which can't be mistaken for signing out.
