---
'@hintoric/ui': patch
---

`Input` and `Autocomplete` now match `@mui/joy` in two places they didn't before:

- **They fill their container.** Both used to be `inline-flex` and shrink to roughly 200px. They are now `display: flex` like Joy, so they stretch to the width of their parent. If you relied on the old shrink-to-content width, set a width yourself.
- **Disabled fields look disabled.** A disabled `Input` or `Autocomplete` kept its resting border, text and background colours, and its text cursor. It now uses Joy's dimmed disabled colours for every variant and colour, plus the default cursor.
