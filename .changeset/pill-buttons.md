---
'@hintoric/ui': minor
---

Add `pill` to `Button`, `IconButton` and `MenuButton`, give `MenuButton` its missing slots, and add `FloatingBarMenuButton`.

`pill` rounds a button's ends fully — a circle on `IconButton`. It is not a Joy prop: Joy reaches
the shape through `sx={{ borderRadius: 'xl' }}`, and this library has no `sx`, so consumers had
been writing `className="rounded-full"` by hand next to every `FloatingBar` and every rounded
search field. Now it is one word, and the corner it replaces is dropped rather than overridden.

`MenuButton` now takes `startDecorator`, `endDecorator` and `loading` exactly as `Button` does.
Joy's trigger reuses Button's whole formula, slots included; ours had only reused the classes, so
an icon in a trigger was a bare child with no gap of its own and no loading state at all. Both
components render their insides from one `ButtonBody` now, so they cannot drift again.

`FloatingBarMenuButton` is a `FloatingBarButton` that opens a `Menu` inside a `Dropdown`: the same
circle, sized by the bar, without `selected`. It exists because a `MenuButton` cannot be a
`FloatingBarButton` — one is a Base UI menu trigger, the other a Base UI button — and every
"more actions" menu at the end of a bar had been a `MenuButton` with `rounded-full` and a width
by hand.
