---
'@hintoric/email': patch
---

Fix the squeezed logo in every email. `HintoricLogo` showed the hosted wordmark at a fixed 104 × 32, sized for the old 1336 × 410 artwork; the PNGs on the CDN are now the current wordmark at 2968 × 652, so mail clients squeezed it sideways. It is now 118 × 26 — the web logo's proportions at the height of the sign-in screen's logo — with the size also set inline, so a client's own image rules can't distort it.
