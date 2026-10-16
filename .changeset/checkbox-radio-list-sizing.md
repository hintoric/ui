---
'@hintoric/ui': patch
---

`Checkbox`, `Radio`, `List` and `Input` now match `@mui/joy`'s sizes more closely:

- **`Checkbox` and `Radio` labels** now have Joy's line height, which equals the box size: 16px, 20px and 24px at `sm`, `md` and `lg`. Before, they were 20px, 24px and 28px, so a labelled control was 4px taller than in Joy. The label also uses Joy's text colour now, and a dimmed colour when disabled. Before, it took the page's text colour, which made it black on a dark background.
- **`List`** now passes its `size` to its `ListItem` and `ListItemButton` rows. Rows are 32px, 36px and 44px high at `sm`, `md` and `lg`, with Joy's padding and gap. Before, every row was `md`-sized. Rows now touch each other with no gap between them, the list's top and bottom padding is 4px, 6px or 8px, and at `sm` and `lg` the line height is 1.5 (21px and 27px). Outside a `List`, a row keeps the `md` size.
- **`Input`**: the inner `<input>` now fills the whole height of the field, like Joy's. Before, it was only one line high. Clicks above or below the text missed it, and the browser's autofill highlight showed as a strip across the middle of the field.
