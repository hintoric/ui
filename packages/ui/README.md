<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.hintoric.com/assets/logo/ui/white.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.hintoric.com/assets/logo/ui/black.svg" />
    <img src="https://cdn.hintoric.com/assets/logo/ui/black.svg" alt="hintoric/ui" width="360" />
  </picture>
</p>

<p align="center">
  A React component library. It uses <a href="https://base-ui.com">Base UI</a> for behavior and Tailwind CSS for styling.
</p>

## What this is

`@hintoric/ui` is a set of production-ready React components: buttons, inputs, cards, tables,
tabs, and more. Every component uses the same `variant`, `color`, and `size` system.

[Base UI](https://base-ui.com) provides behavior and accessibility. Tailwind CSS v4 provides the
styles. The library has no CSS-in-JS runtime.

Users of [MUI Joy UI](https://mui.com/joy-ui/) will find familiar names and props: `variant`,
`color`, `size`, `startDecorator`, `endDecorator`, and `component`. Existing Joy UI code needs only
small changes to work with this library. This library is not a copy of Joy UI — the internal code
is entirely our own.

## Install

```bash
npm install @hintoric/ui
```

The package ships a pre-built stylesheet — no Tailwind setup is required in your app. Import it
once, near the root of your project:

```ts
import '@hintoric/ui/styles.css';
```

## Usage

```tsx
import { Button, Input, Card } from '@hintoric/ui';

function Example() {
  return (
    <Card variant="outlined" color="neutral">
      <Input placeholder="Name" />
      <Button variant="solid" color="primary">
        Submit
      </Button>
    </Card>
  );
}
```

## Docs

Full component reference, live examples, and the roadmap: [ui.hintoric.dev](https://ui.hintoric.dev)

## License

MIT
