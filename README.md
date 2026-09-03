<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.hintoric.com/assets/logo/ui/white.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.hintoric.com/assets/logo/ui/black.svg" />
    <img src="https://cdn.hintoric.com/assets/logo/ui/black.svg" alt="hintoric/ui" width="240" />
  </picture>
</p>

<h1 align="center">@hintoric/ui</h1>

<p align="center">
  Joy UI's look and API, built on <a href="https://base-ui.com">Base UI</a> (behavior) and Tailwind CSS (styling).
</p>

## What this is

`@hintoric/ui` is a React component library that is API-compatible with
[MUI Joy UI](https://mui.com/joy-ui/) — same component names, same `variant`/`color`/`size`/
`startDecorator`/`endDecorator`/`component` props, same defaults — so existing Joy UI code
migrates with minimal changes. It swaps Joy UI's implementation for:

- **[Base UI](https://base-ui.com)** (`@base-ui/react`) for behavior/accessibility instead of the
  unmaintained `@mui/base`
- **Tailwind CSS v4** for styling instead of Emotion/CSS-in-JS

It is not a 1:1 port of Joy UI's implementation — the look and props API are preserved, not the
Emotion-based internals.

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
spec, implementation history, and every Joy UI fidelity detail discovered along the way.

## Status

Under active development. See the [roadmap](apps/docs/src/pages/RoadmapPage.tsx) for current
component coverage.

## License

MIT
