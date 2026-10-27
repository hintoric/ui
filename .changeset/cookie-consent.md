---
'@hintoric/ui': minor
---

New: cookie consent. `CookieConsentProvider` keeps the visitor's choice in a first-party cookie (`hintoric_consent`) the server can read too, `useConsent` and `ConsentGate` load a script only after consent, and `CookieConsent` shows the banner and the settings dialog. Reject and allow carry equal weight, nothing is preselected, a withdrawal reloads the page, and raising `version` asks again. `parseConsentCookie` reads the cookie on the server.
