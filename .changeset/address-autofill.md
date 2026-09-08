---
"@hintoric/ui": minor
---

Add `<AddressAutofill>`, a combobox that searches German addresses (postal code, city, street)
against the free `autofill.api.hintoric.cloud` lookup as you type, and returns the matched address
as a structured object on selection. It always binds to a `name` inside a `<Form>` — there is no
standalone/uncontrolled mode — and requires four content props (`belowMinLengthContent`,
`loadingContent`, `noResultsContent`, `errorContent`) since the component ships no text of its own.

`<Autocomplete>` also gains `loading`, `loadingText` and `noOptionsText` — matching real `@mui/joy`
Autocomplete's own props of the same names, including its rule that `loadingText` only replaces
suggestions when there are none yet, so existing results stay visible while a new search is in
flight. A fourth new prop, `filter`, is Base UI-specific (no Joy equivalent): pass `null` to disable
Base UI's own client-side re-filtering of `options`, needed whenever `options` already reflects a
server-filtered result set for the current query.

`onInputChange` now receives a second `reason: 'input' | 'reset' | 'clear'` argument — again
matching `@mui/joy`'s own `AutocompleteInputChangeReason` exactly — so a consumer that re-fetches on
every input change can gate that on `reason === 'input'` and skip re-searching for an option's own
label right after it's selected (`AddressAutofill` does exactly this).
