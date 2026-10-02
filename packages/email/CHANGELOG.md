# @hintoric/email

## 0.1.1

### Patch Changes

- 97accb6: Fix button heights and the phone layout in sent emails. In the rendering mode mail clients use — the limited-quirks mode react-email's XHTML doctype puts a message in, or full quirks where a webmail drops the doctype — every `Button` came out 4–5px short of `@hintoric/ui`'s (27.8 / 31.8 / 39.2px instead of 32 / 36 / 44px); it now matches at every size. On phones, `Layout` inset the card's content by 72px instead of 24px and kept the card at 440px; the card now fills the screen with a 24px inset and the page takes the card's colour.

## 0.1.0

### Minor Changes

- 770cae5: First release of `@hintoric/email`: transactional email components in `@hintoric/ui`'s look, built on react-email.

  Mail clients understand neither Tailwind classes nor CSS variables, so the web components can't be sent as they are. This package has email counterparts of the most important ones — `Typography`, `Button`, `Link`, `Divider`, `Card`, `Avatar` and `Chip` — with the same props for variant, colour and size, rendered as tables and inline styles. A visual test suite compares every variant × colour of each against its `@hintoric/ui` counterpart in light and dark. Dark mode applies in clients that support `prefers-color-scheme`.

  `Layout` frames a message like the auth screens (a 440px card on the page background, fine print underneath), and `renderEmail` returns its HTML and plain text.

  The first template is `SecurityActivityAlertEmail`, the alert to send every admin when the activity log records a dangerous action such as changed bank details: a heading naming the action, one sentence with who and when, a button to the log entry. `renderSecurityActivityAlert` returns subject, HTML and plain text in one call; German and English messages are provided as `securityActivityAlertMessagesDe` / `securityActivityAlertMessagesEn`. `HintoricLogo` is the wordmark, in light and dark. Links render only for `https:`, `http:` and `mailto:` URLs.
