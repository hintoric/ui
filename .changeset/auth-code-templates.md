---
'@hintoric/email': minor
---

Two templates for the mails of a sign-in flow, built for Kratos' courier.

`AuthCodeEmail` (`renderAuthCode`) sends a one-time code for each of the four flows — `purpose: 'verification' | 'registration' | 'login' | 'recovery'` — with the heading and subject naming the flow. The code sits in its own box, large, in a monospace face and as one piece, so a double-click copies all of it. An optional `url` adds a button that does what the code does (Kratos' verification link), `email` names the address in the intro, and `expiresInMinutes` adds a line under the code. Login and recovery codes also tell the reader not to pass them on. The inbox preview line shows the code.

`AuthNoAccountEmail` (`renderAuthNoAccount`) answers a verification or recovery request for an address without an account — Kratos' `*_code.invalid` templates — without a code, with the likely mix-up and an optional `registrationUrl` button.

Both come with German and English messages (`authCodeMessagesDe`/`…En`, `authNoAccountMessagesDe`/`…En`) and a `…Content` export for in-app previews. `emailFonts` gains `code`, a monospace stack.
