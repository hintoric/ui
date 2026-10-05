---
"@hintoric/ui": patch
---

`TabList` now matches Joy UI's `TabList`:

- It draws Joy's default underline: a 1px divider line under a horizontal list, or to the right of a vertical one. The selected tab's indicator sits on that line.
- Tabs touch. The 4px gap between them is gone.
- The indicator takes the colour of the selected `Tab`, not the colour of the list. For example, a `solid` list with plain tabs no longer gets an indicator in the list's text colour.
- In a vertical list, the indicator is now on the right of the selected tab, as in Joy UI. It used to be on the left. Vertical tabs also align their label to the start instead of the centre, and get Joy's padding.

So a horizontal `TabList` is now 1px taller, and a vertical one is 1px wider.
