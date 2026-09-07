---
'@hintoric/ui': minor
---

Every field component now binds itself to react-hook-form. Put a `name` on a field inside the new
`<Form>` and it reads its value, writes changes back, shows its validation message as helper text
and marks itself invalid for assistive technology — no `Controller` and no `control` prop. `<Form>`
either builds the form itself from a zod `schema` and `defaultValues`, or takes a `useForm()`
instance you built yourself. `<FormField>` covers controls outside this set via a render prop.

All nine fields are included: `Input`, `Textarea`, `Select`, `Autocomplete`, `Checkbox`, `Switch`,
`Radio`, `RadioGroup` and `Slider`.

Fields gain `label`, `helperText` and `error` props, and wrap themselves in a `FormControl` with a
`FormLabel` and `FormHelperText` when you use them. A field with none of them renders exactly the
markup it did before, so existing layouts are untouched. Outside a `<Form>`, every field behaves
exactly as it did — a `name` alone changes nothing.

`react-hook-form` and `zod` are new peer dependencies.

Two known limits, both deliberate. `Slider` does not receive react-hook-form's focus-on-error,
because Base UI exposes its control wrapper rather than the focusable thumb; and an invalid
`Slider` is not recoloured, matching Joy UI, which reads no form-control state on that component
at all. In both cases the error still shows in the helper text and in `aria-invalid`.

Fixed: `Input`'s `onChange` handed out a hand-built stand-in event carrying only `target.value`,
which meant `react-hook-form`'s `register()` could never resolve the field and silently recorded
nothing. It now receives the real `ChangeEvent`. Code reading `event.target.value` is unaffected.

Fixed: `FormHelperText` ignored its `FormControl`'s error state and always rendered in the muted
tertiary colour, so a validation message looked like an ordinary hint. It now takes the danger
colour on error, and both it and `FormLabel` are muted inside a disabled `FormControl`.
