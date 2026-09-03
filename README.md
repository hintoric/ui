<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.hintoric.com/assets/logo/ui/white.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.hintoric.com/assets/logo/ui/black.svg" />
    <img src="https://cdn.hintoric.com/assets/logo/ui/black.svg" alt="hintoric/ui" width="240" />
  </picture>
</p>

<p align="center">
  A React component library built on <a href="https://base-ui.com">Base UI</a> (behavior) and Tailwind CSS (styling).
</p>

## What this is

`@hintoric/ui` gives you a consistent set of production-ready React components — buttons, inputs,
cards, tables, tabs, and more — with the same `variant`/`color`/`size` system applied everywhere.
Behavior and accessibility come from [Base UI](https://base-ui.com); styling comes from Tailwind
CSS v4, so there's no CSS-in-JS runtime.

If you're coming from [MUI Joy UI](https://mui.com/joy-ui/): the component names and props
(`variant`, `color`, `size`, `startDecorator`/`endDecorator`, `component`) match closely, so
existing code ports over with minimal changes — but this isn't a Joy UI clone, the internals are
entirely our own.

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
