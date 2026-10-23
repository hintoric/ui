# @hintoric/email

## 0.5.0

### Minor Changes

- 0caa257: New `CompanyDataFoundEmail` / `renderCompanyDataFound`: tells someone that their company details were found on the website behind their mail domain and invites them to review them. A heading ("Deine Firmendaten sind schon da"), an icon, one sentence ("Die Angaben zu Muster Bau GmbH wurden automatisch auf muster-bau.de gefunden. Du musst nichts abtippen, nur prüfen."), a button to the prefilled company settings page, and the note that nothing is taken over before they confirm. The individual fields are not listed. `companyName` is optional — without it the texts speak of "your company". German and English messages (`companyDataFoundMessagesDe` / `…En`).

## 0.4.0

### Minor Changes

- 4ce65e3: Mails for Kratos' link flows and for account security alerts.

  - New `AuthLinkEmail` / `renderAuthLink`: the mail for a flow that sends a link instead of a code — `verification_valid` and `recovery_valid`. Heading, one sentence and the button; recovery also says not to pass the link on. German and English messages (`authLinkMessagesDe` / `…En`).
  - `AuthNoAccountEmail` takes `channel: 'code' | 'link'` (default `'code'`), so the answer to a link request for an address without an account speaks of a link, not a code. The new `channel` is also passed to every message function.
  - `SecurityActivityAlertEmail` for an account target needs no actor: `activity.actorName` is optional, and without it the summary and the preview line say what happened without a subject. For an `account` target the default guidance is now "Wenn du das nicht warst, sichere dein Konto jetzt." and the button "Konto prüfen" (English: "If this wasn't you, secure your account now." / "Review account"); a workspace alert keeps its wording. `messages.reviewButton` may now be a function of the alert's context.

### Patch Changes

- 5317a68: Fix the squeezed logo in every email. `HintoricLogo` showed the hosted wordmark at a fixed 104 × 32, sized for the old 1336 × 410 artwork; the PNGs on the CDN are now the current wordmark at 2968 × 652, so mail clients squeezed it sideways. It is now 118 × 26 — the web logo's proportions at the height of the sign-in screen's logo — with the size also set inline, so a client's own image rules can't distort it.

## 0.3.0

### Minor Changes

- 2ffffae: Two templates for the mails of a sign-in flow, built for Kratos' courier.

  `AuthCodeEmail` (`renderAuthCode`) sends a one-time code for each of the four flows — `purpose: 'verification' | 'registration' | 'login' | 'recovery'` — with the heading and subject naming the flow. The code sits in its own box, large, in a monospace face and as one piece, so a double-click copies all of it. An optional `url` adds a button that does what the code does (Kratos' verification link), `email` names the address in the intro, and `expiresInMinutes` adds a line under the code. Login and recovery codes also tell the reader not to pass them on. The inbox preview line shows the code.

  `AuthNoAccountEmail` (`renderAuthNoAccount`) answers a verification or recovery request for an address without an account — Kratos' `*_code.invalid` templates — without a code: what was attempted, the missing account in a warning alert, the likely mix-up and an optional `registrationUrl` button.

  Both come with German and English messages (`authCodeMessagesDe`/`…En`, `authNoAccountMessagesDe`/`…En`) and a `…Content` export for in-app previews. `emailFonts` gains `code`, a monospace stack.

  New components `Alert` and `AlertTitle`, the email counterparts of `@hintoric/ui`'s, with the same `variant`, `color` and `size` (default soft / neutral / md) and optional `startDecorator` / `endDecorator`, which sit on the first line as on the web. Like the web Alert it shows the icon for its colour by default, as a light / dark pair of hosted PNGs under `cdn.hintoric.com/assets/email/alert/` (`startDecorator={null}` leaves it out); `emailAlertIconFiles()` lists every file it can ask for. The visual suite compares every variant × colour against the web Alert in light and dark, the sizes also without a doctype.

  The German texts of every template follow the UX-writing rules now: no "wir" (footers read "Du erhältst diese E-Mail, weil …"), no product prefix on nouns ("dein Konto bei hintoric" instead of "dein hintoric-Konto"), "hintoric" in lower case as everywhere else, "Admin" wording replaced by "weil du diesen Workspace verwaltest", and times with "Uhr" ("28. September 2026 um 19:31 Uhr"). The waitlist mail's unsubscribe link reads "E-Mails abbestellen", which can't be mistaken for signing out.

## 0.2.0

### Minor Changes

- fe03436: `Layout` takes an optional `unsubscribe` ({ href, label }) that renders an unsubscribe link as the last line of the footer. `WaitlistWelcomeEmail` exposes it as `unsubscribeUrl` (label from the new optional `messages.unsubscribe`, included in the DE/EN presets). Templates that readers can't opt out of, such as the security alert, are unchanged.

## 0.1.2

### Patch Changes

- 9a1a616: Build the security alert's avatar initials from letters only. A workspace named "Müller & Söhne GmbH" showed "M&"; it now shows "MS", and quotes or dashes in front of a word no longer count as its initial.

## 0.1.1

### Patch Changes

- 97accb6: Fix button heights and the phone layout in sent emails. In the rendering mode mail clients use — the limited-quirks mode react-email's XHTML doctype puts a message in, or full quirks where a webmail drops the doctype — every `Button` came out 4–5px short of `@hintoric/ui`'s (27.8 / 31.8 / 39.2px instead of 32 / 36 / 44px); it now matches at every size. On phones, `Layout` inset the card's content by 72px instead of 24px and kept the card at 440px; the card now fills the screen with a 24px inset and the page takes the card's colour.

## 0.1.0

### Minor Changes

- 770cae5: First release of `@hintoric/email`: transactional email components in `@hintoric/ui`'s look, built on react-email.

  Mail clients understand neither Tailwind classes nor CSS variables, so the web components can't be sent as they are. This package has email counterparts of the most important ones — `Typography`, `Button`, `Link`, `Divider`, `Card`, `Avatar` and `Chip` — with the same props for variant, colour and size, rendered as tables and inline styles. A visual test suite compares every variant × colour of each against its `@hintoric/ui` counterpart in light and dark. Dark mode applies in clients that support `prefers-color-scheme`.

  `Layout` frames a message like the auth screens (a 440px card on the page background, fine print underneath), and `renderEmail` returns its HTML and plain text.

  The first template is `SecurityActivityAlertEmail`, the alert to send every admin when the activity log records a dangerous action such as changed bank details: a heading naming the action, one sentence with who and when, a button to the log entry. `renderSecurityActivityAlert` returns subject, HTML and plain text in one call; German and English messages are provided as `securityActivityAlertMessagesDe` / `securityActivityAlertMessagesEn`. `HintoricLogo` is the wordmark, in light and dark. Links render only for `https:`, `http:` and `mailto:` URLs.
