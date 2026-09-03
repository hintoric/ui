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

## Packages

This is a pnpm workspace monorepo:

- [`packages/ui`](packages/ui) — the `@hintoric/ui` library itself
- [`apps/docs`](apps/docs) — the documentation site
- [`apps/playground`](apps/playground) — a Vite app for manually trying components during
  development

## Getting started

```bash
pnpm install
```

- `pnpm build` — build the library (`dist/index.js` + `dist/style.css`)
- `pnpm test` — run the library's unit tests
- `pnpm typecheck` — build the library, then typecheck every workspace package
- `pnpm lint` — lint the whole repo
- `pnpm dev:playground` — run the playground app

See [`CLAUDE.md`](CLAUDE.md) and [`docs/superpowers/specs`](docs/superpowers/specs) for the design
spec and implementation history.

## Status

Under active development. See the [roadmap](apps/docs/src/pages/RoadmapPage.tsx) for current
component coverage.

## License

MIT
