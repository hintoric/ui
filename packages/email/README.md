<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.hintoric.com/assets/logo/white.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.hintoric.com/assets/logo/black.svg" />
    <img src="https://cdn.hintoric.com/assets/logo/black.svg" alt="hintoric" width="240" />
  </picture>
</p>

<p align="center">
  Transactional email components in <a href="https://www.npmjs.com/package/@hintoric/ui">@hintoric/ui</a>'s look, built on <a href="https://react.email">react-email</a>.
</p>

## What this is

Mail clients understand neither Tailwind classes nor CSS variables, and run no JavaScript, so
`@hintoric/ui`'s components can't be sent as they are. `@hintoric/email` has email counterparts of
the most important ones — `Typography`, `Button`, `Link`, `Divider`,
`Card`, `Avatar` and `Chip` — with the same `variant`, `color` and `size` props,
rendered as tables and inline styles. A visual test suite compares every variant × colour of each
against its web component in light and dark.

It also ships `Layout` (a message framed like hintoric's auth screens), `renderEmail` and
ready-made templates such as `SecurityActivityAlertEmail`.

## Install

```bash
npm install @hintoric/email
```

## Usage

```tsx
import { Layout, Typography, Button, renderEmail } from '@hintoric/email';

const { html, text } = await renderEmail(
  <Layout lang="de" preview="Neue Anmeldung" footer="Muster GmbH · Musterstraße 1">
    <Typography level="h3" component="h1" textAlign="center">
      Neue Anmeldung
    </Typography>
    <Button href="https://app.example.com/security" size="lg" fullWidth>
      Aktivität prüfen
    </Button>
  </Layout>,
);
```

## Docs

Components, templates and live previews: [ui.hintoric.dev/email](https://ui.hintoric.dev/email)

## License

MIT
