---
'@hintoric/email': patch
---

Fix button heights and the phone layout in sent emails. In the rendering mode mail clients use — the limited-quirks mode react-email's XHTML doctype puts a message in, or full quirks where a webmail drops the doctype — every `Button` came out 4–5px short of `@hintoric/ui`'s (27.8 / 31.8 / 39.2px instead of 32 / 36 / 44px); it now matches at every size. On phones, `Layout` inset the card's content by 72px instead of 24px and kept the card at 440px; the card now fills the screen with a 24px inset and the page takes the card's colour.
