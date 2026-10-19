---
'@hintoric/ui': minor
---

Add `MailCard`, which renders a card for an email in Gmail's card layout. It takes a block spec (`CardSpec`), a schema.org object (`Offer`, `Invoice`, `Order` or `ParcelDelivery`), or JSX built from the `MailCard*` blocks. It has two themes, `joy` (the default) and `google`, each in light and dark.

- A primary action can be a split button. The alternatives behind its arrow pre-approve later workflow steps.
- `parseCardSpec` turns untrusted JSON into a `CardSpec`, and `jsonLdToSpec` maps a schema.org object to one. `MailCard` also parses a `spec` it is given, so a malformed one renders nothing.
- `MailCard` shows no text of its own and ships no translations. Pass every text through the required `messages` prop.
- The JSON Schema for `CardSpec` ships as `@hintoric/ui/card-spec.schema.json`, for a backend to check the cards it sends.
