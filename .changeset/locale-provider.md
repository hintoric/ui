---
'@hintoric/ui': minor
---

Add `LocaleProvider`: one source for the display language, so `LocaleSwitcher` and `RelativeTime` no longer disagree about it.

The provider deliberately owns nothing — `locale` is a required prop and it only mirrors it, because in a real application i18next already holds the language with its own detection and persistence. Wiring the two together is one line: `<LocaleProvider locale={i18n.language} onLocaleChange={i18n.changeLanguage} locales={LOCALES}>`.

Inside one, `<LocaleSwitcher />` needs no props at all; `locales`, `value` and `onChange` are now optional and still win when given, so nothing existing breaks. Date and time components resolve their language narrowest-first: a prop, then `DateTimeProvider`, then `LocaleProvider`, then the runtime default — so "the UI is English but dates are German" keeps working.
