<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.hintoric.com/assets/logo/white.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.hintoric.com/assets/logo/black.svg" />
    <img src="https://cdn.hintoric.com/assets/logo/black.svg" alt="hintoric" width="240" />
  </picture>
</p>

<p align="center">
  hintoric's icons and spot illustrations as React components, in light and dark.
</p>

## Install

```bash
npm install @hintoric/icons
```

## Usage

```tsx
import { EmptyInboxIcon } from '@hintoric/icons';

<EmptyInboxIcon className="size-40" />               // follows the colour scheme
<EmptyInboxIcon size={96} title="Inbox is empty" />  // named for assistive technology
<EmptyInboxIcon mode="dark" />                       // dark variant on any scheme
```

| Prop | Default | |
|---|---|---|
| `size` | `'1em'` | Width and height. CSS sizing wins over it. |
| `mode` | `'auto'` | `auto` shows the dark variant while `<html data-color-scheme="dark">`, as set by `@hintoric/ui`'s `ColorSchemeProvider`. `light` / `dark` pin one. |
| `title` | — | Accessible name. Without it the icon is decorative (`aria-hidden`). |

Every other prop goes to the `<svg>`. Each component also has `slug` and `cdn` (`{ light, dark }`)
with the icon's image URLs, for `<img>`, emails and anything else that is not React.
`icons` lists every icon. Requires React 19, which hoists the small stylesheet that switches the
variants into `<head>` once.

All icons: <https://ui.hintoric.dev/icons>
