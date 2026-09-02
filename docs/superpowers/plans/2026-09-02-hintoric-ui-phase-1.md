# @hintoric/ui Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the `@hintoric/ui` monorepo and ship its Phase 1 component set (`ColorSchemeProvider`, `Box`, `Stack`, `Typography`, `Sheet`, `Card`, `Button`, `IconButton`, `Input`, `Textarea`) — visually and API-compatible with MUI Joy UI, built on Base UI (`@base-ui/react`) for behavior and Tailwind CSS v4 + `class-variance-authority` for styling.

**Architecture:** A pnpm workspace with `packages/ui` (the publishable library) and `apps/playground` (a Vite+React app for manual visual QA). Each component wraps either a Base UI primitive (Button, IconButton, Input) or Base UI's `useRender` hook for polymorphic rendering (Box, Stack, Typography, Sheet, Card), styled with Tailwind utility classes selected via `class-variance-authority`. All Joy UI palette/variant colors are ported as CSS custom properties computed directly from Joy UI's own `extendTheme.ts` formulas, so the visual output matches Joy UI pixel-for-pixel where the formulas allow it.

**Tech Stack:** React 19, TypeScript 7, Vite 8 (library mode for `packages/ui`, app mode for the playground), Tailwind CSS v4 (`@theme` CSS-first config), `class-variance-authority`, `clsx` + `tailwind-merge`, `@base-ui/react` v1, Vitest 4 + React Testing Library, pnpm workspaces, Changesets.

**Spec:** [docs/superpowers/specs/2026-09-02-hintoric-ui-design.md](../specs/2026-09-02-hintoric-ui-design.md)

## Global Constraints

- Package name is exactly `@hintoric/ui`; peer dependencies are `react`/`react-dom` `^18.3.0 || ^19.0.0` and `@base-ui/react` `^1.7.0` (Base UI's own supported range).
- No `sx` prop and no runtime JS theme object anywhere in the library — every component accepts a plain `className` (merged via the shared `cx()` utility) as its styling escape hatch (spec §3, §7).
- Component names, prop names, defaults, and visual variants (`variant`, `color`, `size`, `component`, `startDecorator`/`endDecorator`) must match Joy UI's Phase 1 component set (spec §6) unless a deviation is explicitly called out in a task.
- Every Tailwind utility class name used anywhere in `packages/ui/src` must appear as a **complete literal string** in the source. Never build a class name by interpolating a variable into a template string (e.g. `` `bg-${color}-500` ``) — Tailwind's v4 content scanner only recognizes complete literal tokens, so an interpolated name silently produces an unstyled component with no build error. Task 5 centralizes the one place where per-color/variant literals are enumerated; every other task must consume those constants rather than re-deriving class names dynamically.
- Package manager is pnpm, pinned via `"packageManager": "pnpm@10.24.0"` in the root `package.json`.
- Do not run `npm publish`, `pnpm publish`, or `changeset publish` as part of this plan — Task 2 and Task 17 only prepare the publish configuration. Publishing is a separate, explicitly-approved action.

---

## Task 1: Monorepo scaffold

**Files:**
- Create: `package.json` (workspace root)
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `eslint.config.js`
- Create: `.prettierrc.json`
- Create: `.changeset/config.json`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: the pnpm workspace itself (`packages/*`, `apps/*` glob), `tsconfig.base.json` for all packages to extend, root scripts (`build`, `test`, `lint`, `typecheck`) that fan out via `pnpm --filter`.

- [ ] **Step 1: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

- [ ] **Step 2: Create the root `package.json`**

```json
{
  "name": "hintoric-ui",
  "private": true,
  "packageManager": "pnpm@10.24.0",
  "scripts": {
    "build": "pnpm --filter @hintoric/ui build",
    "test": "pnpm --filter @hintoric/ui test",
    "typecheck": "pnpm -r typecheck",
    "lint": "eslint .",
    "dev:playground": "pnpm --filter playground dev",
    "changeset": "changeset",
    "release": "changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^3.0.1",
    "@eslint/js": "^10.0.1",
    "eslint": "^10.9.1",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^7.1.1",
    "prettier": "^3.9.6",
    "typescript": "^7.0.2",
    "typescript-eslint": "^8.69.0"
  }
}
```

- [ ] **Step 3: Create `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

- [ ] **Step 4: Create `.gitignore`**

```
node_modules
dist
.turbo
*.log
.DS_Store
```

- [ ] **Step 5: Create `eslint.config.js`**

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
);
```

- [ ] **Step 6: Create `.prettierrc.json`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 7: Create `.changeset/config.json`**

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.1/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["playground"]
}
```

- [ ] **Step 8: Verify the workspace installs**

Run: `pnpm install`
Expected: exits `0`. No `packages/*` or `apps/*` exist yet, so pnpm only installs the root `devDependencies` — that's expected at this point.

- [ ] **Step 9: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.base.json .gitignore eslint.config.js .prettierrc.json .changeset/config.json
git commit -m "chore: scaffold pnpm workspace root"
```

---

## Task 2: `packages/ui` package scaffold + Vite library build

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/vite.config.ts`
- Create: `packages/ui/src/index.ts` (placeholder, replaced task-by-task)
- Create: `packages/ui/src/test/setup.ts`

**Interfaces:**
- Consumes: `tsconfig.base.json` (Task 1).
- Produces: the `@hintoric/ui` package identity, its build (`pnpm --filter @hintoric/ui build` → `dist/index.js`, `dist/index.d.ts`), and its test runner (`pnpm --filter @hintoric/ui test`). Every later task in `packages/ui` adds files under `src/` and re-exports them from `src/index.ts`; none of them touch this task's config files.

- [ ] **Step 1: Create `packages/ui/package.json`**

```json
{
  "name": "@hintoric/ui",
  "version": "0.1.0",
  "description": "Joy UI's look and API, built on Base UI and Tailwind CSS.",
  "type": "module",
  "license": "MIT",
  "sideEffects": ["**/*.css"],
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./styles.css": "./dist/style.css"
  },
  "publishConfig": {
    "access": "public"
  },
  "peerDependencies": {
    "react": "^18.3.0 || ^19.0.0",
    "react-dom": "^18.3.0 || ^19.0.0",
    "@base-ui/react": "^1.7.0"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.6.0"
  },
  "devDependencies": {
    "@base-ui/react": "^1.7.0",
    "@typescript/typescript6": "^6.0.2",
    "@tailwindcss/vite": "^4.3.3",
    "@testing-library/jest-dom": "^7.0.1",
    "@testing-library/react": "^16.3.3",
    "@testing-library/user-event": "^14.6.7",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.5",
    "@vitejs/plugin-react": "^6.1.1",
    "jsdom": "^30.0.1",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "tailwindcss": "^4.3.3",
    "typescript": "^7.0.2",
    "vite": "^8.2.2",
    "vite-plugin-dts": "^5.1.0",
    "vitest": "^4.1.11"
  },
  "scripts": {
    "build": "vite build",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  }
}
```

**Discovered during implementation:** TypeScript 7 no longer ships the classic JS Compiler API that `vite-plugin-dts` needs to generate rolled-up `.d.ts` files; `vite build` fails with `[unplugin-dts] The installed "typescript" package does not provide the JavaScript Compiler API`. The error message itself names the fix — install `@typescript/typescript6` as a compatibility shim alongside TypeScript 7 — which is already reflected in the `devDependencies` above.

- [ ] **Step 2: Create `packages/ui/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create the test setup file `packages/ui/src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// `test.globals` below is intentionally `false` (tests use explicit imports),
// which means Testing Library's own auto-cleanup detection never fires.
// Register it explicitly, otherwise DOM nodes from one test's render() leak
// into the next test in the same file — discovered in Task 7, where a second
// `render()` in the same file produced two matching "go dark" buttons.
afterEach(() => {
  cleanup();
});
```

- [ ] **Step 4: Create a placeholder `packages/ui/src/index.ts`**

```ts
export const HINTORIC_UI_VERSION = '0.1.0';
```

- [ ] **Step 5: Create `packages/ui/vite.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({ include: ['src'], exclude: ['src/test/**', '**/*.test.*'], rollupTypes: true }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@base-ui/react'],
    },
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

- [ ] **Step 6: Install dependencies**

Run: `pnpm install`
Expected: exits `0`, `packages/ui/node_modules` (hoisted to the workspace root `node_modules`) now contains `react`, `@base-ui/react`, `vite`, `vitest`, etc.

- [ ] **Step 7: Verify the build**

Run: `pnpm --filter @hintoric/ui build`
Expected: exits `0`; `packages/ui/dist/index.js` and `packages/ui/dist/index.d.ts` exist and contain `HINTORIC_UI_VERSION`.

- [ ] **Step 8: Verify the test runner**

Run: `pnpm --filter @hintoric/ui test`
Expected: exits `1` and prints "No test files found" (Vitest 4 treats zero matched test files as a failure by default; no `*.test.ts` files exist yet, so this is expected here and resolves itself starting in Task 4, once the first test file exists).

- [ ] **Step 9: Commit**

```bash
git add packages/ui/package.json packages/ui/tsconfig.json packages/ui/vite.config.ts packages/ui/src/index.ts packages/ui/src/test/setup.ts
git commit -m "chore: scaffold @hintoric/ui package with Vite library build"
```

---

## Task 3: Tailwind v4 theme — Joy UI palette as CSS variables

**Files:**
- Create: `packages/ui/src/styles/theme.css`
- Create: `packages/ui/src/styles/index.css`
- Create: `packages/ui/src/styles/css.d.ts`
- Modify: `packages/ui/vite.config.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: every `--color-*`, `--font-body`, and `--radius-*` custom property that later components' Tailwind classes (`bg-primary-solid-bg`, `text-ink-primary`, `font-body`, `rounded-md`, …) resolve against, plus the `[data-color-scheme="dark"]` override block that `ColorSchemeProvider` (Task 7) toggles.

**Provenance:** every hex value below is copied verbatim from Joy UI's own `packages/mui-joy/src/colors/colors.ts` (`grey`→`neutral`, `blue`→`primary`, `yellow`→`warning`, `red`→`danger`, `green`→`success`) and every semantic token (`*-solid-bg`, `*-soft-color`, `--color-ink-*`, `--color-surface*`, `--radius-*`, `--font-body`) is derived from the exact formulas in `packages/mui-joy/src/styles/extendTheme.ts` (`createLightModeVariantVariables`/`createDarkModeVariantVariables`, the `light`/`dark` `palette.text`/`palette.background`, and `defaultScales.radius`/`fontFamily`), at tag `v6.x` of `mui/material-ui`.

- [ ] **Step 1: Create `packages/ui/src/styles/theme.css`**

```css
@theme {
  /* raw palette stops (from Joy UI's colors.ts: blue/grey/yellow/red/green) */
  --color-neutral-50: #FBFCFE;
  --color-neutral-100: #F0F4F8;
  --color-neutral-200: #DDE7EE;
  --color-neutral-300: #CDD7E1;
  --color-neutral-400: #9FA6AD;
  --color-neutral-500: #636B74;
  --color-neutral-600: #555E68;
  --color-neutral-700: #32383E;
  --color-neutral-800: #171A1C;
  --color-neutral-900: #0B0D0E;
  --color-primary-50: #EDF5FD;
  --color-primary-100: #E3EFFB;
  --color-primary-200: #C7DFF7;
  --color-primary-300: #97C3F0;
  --color-primary-400: #4393E4;
  --color-primary-500: #0B6BCB;
  --color-primary-600: #185EA5;
  --color-primary-700: #12467B;
  --color-primary-800: #0A2744;
  --color-primary-900: #051423;
  --color-warning-50: #FEFAF6;
  --color-warning-100: #FDF0E1;
  --color-warning-200: #FCE1C2;
  --color-warning-300: #F3C896;
  --color-warning-400: #EA9A3E;
  --color-warning-500: #9A5B13;
  --color-warning-600: #72430D;
  --color-warning-700: #492B08;
  --color-warning-800: #2E1B05;
  --color-warning-900: #1D1002;
  --color-danger-50: #FEF6F6;
  --color-danger-100: #FCE4E4;
  --color-danger-200: #F7C5C5;
  --color-danger-300: #F09898;
  --color-danger-400: #E47474;
  --color-danger-500: #C41C1C;
  --color-danger-600: #A51818;
  --color-danger-700: #7D1212;
  --color-danger-800: #430A0A;
  --color-danger-900: #240505;
  --color-success-50: #F6FEF6;
  --color-success-100: #E3FBE3;
  --color-success-200: #C7F7C7;
  --color-success-300: #A1E8A1;
  --color-success-400: #51BC51;
  --color-success-500: #1F7A1F;
  --color-success-600: #136C13;
  --color-success-700: #0A470A;
  --color-success-800: #042F04;
  --color-success-900: #021D02;
  --color-common-white: #FFFFFF;
  --color-common-black: #000000;

  /* per-variant semantic tokens (light mode default) */
  --color-primary-plain-color: var(--color-primary-500);
  --color-primary-plain-hover-bg: var(--color-primary-100);
  --color-primary-plain-active-bg: var(--color-primary-200);
  --color-primary-plain-disabled-color: var(--color-neutral-400);
  --color-primary-outlined-color: var(--color-primary-500);
  --color-primary-outlined-border: var(--color-primary-300);
  --color-primary-outlined-hover-bg: var(--color-primary-100);
  --color-primary-outlined-active-bg: var(--color-primary-200);
  --color-primary-outlined-disabled-color: var(--color-neutral-400);
  --color-primary-outlined-disabled-border: var(--color-neutral-200);
  --color-primary-soft-color: var(--color-primary-700);
  --color-primary-soft-bg: var(--color-primary-100);
  --color-primary-soft-hover-bg: var(--color-primary-200);
  --color-primary-soft-active-color: var(--color-primary-800);
  --color-primary-soft-active-bg: var(--color-primary-300);
  --color-primary-soft-disabled-color: var(--color-neutral-400);
  --color-primary-soft-disabled-bg: var(--color-neutral-50);
  --color-primary-solid-color: var(--color-common-white);
  --color-primary-solid-bg: var(--color-primary-500);
  --color-primary-solid-hover-bg: var(--color-primary-600);
  --color-primary-solid-active-bg: var(--color-primary-700);
  --color-primary-solid-disabled-color: var(--color-neutral-400);
  --color-primary-solid-disabled-bg: var(--color-neutral-100);
  --color-neutral-plain-color: var(--color-neutral-500);
  --color-neutral-plain-hover-bg: var(--color-neutral-100);
  --color-neutral-plain-active-bg: var(--color-neutral-200);
  --color-neutral-plain-disabled-color: var(--color-neutral-400);
  --color-neutral-outlined-color: var(--color-neutral-500);
  --color-neutral-outlined-border: var(--color-neutral-300);
  --color-neutral-outlined-hover-bg: var(--color-neutral-100);
  --color-neutral-outlined-active-bg: var(--color-neutral-200);
  --color-neutral-outlined-disabled-color: var(--color-neutral-400);
  --color-neutral-outlined-disabled-border: var(--color-neutral-200);
  --color-neutral-soft-color: var(--color-neutral-700);
  --color-neutral-soft-bg: var(--color-neutral-100);
  --color-neutral-soft-hover-bg: var(--color-neutral-200);
  --color-neutral-soft-active-color: var(--color-neutral-800);
  --color-neutral-soft-active-bg: var(--color-neutral-300);
  --color-neutral-soft-disabled-color: var(--color-neutral-400);
  --color-neutral-soft-disabled-bg: var(--color-neutral-50);
  --color-neutral-solid-color: var(--color-common-white);
  --color-neutral-solid-bg: var(--color-neutral-500);
  --color-neutral-solid-hover-bg: var(--color-neutral-600);
  --color-neutral-solid-active-bg: var(--color-neutral-700);
  --color-neutral-solid-disabled-color: var(--color-neutral-400);
  --color-neutral-solid-disabled-bg: var(--color-neutral-100);
  --color-danger-plain-color: var(--color-danger-500);
  --color-danger-plain-hover-bg: var(--color-danger-100);
  --color-danger-plain-active-bg: var(--color-danger-200);
  --color-danger-plain-disabled-color: var(--color-neutral-400);
  --color-danger-outlined-color: var(--color-danger-500);
  --color-danger-outlined-border: var(--color-danger-300);
  --color-danger-outlined-hover-bg: var(--color-danger-100);
  --color-danger-outlined-active-bg: var(--color-danger-200);
  --color-danger-outlined-disabled-color: var(--color-neutral-400);
  --color-danger-outlined-disabled-border: var(--color-neutral-200);
  --color-danger-soft-color: var(--color-danger-700);
  --color-danger-soft-bg: var(--color-danger-100);
  --color-danger-soft-hover-bg: var(--color-danger-200);
  --color-danger-soft-active-color: var(--color-danger-800);
  --color-danger-soft-active-bg: var(--color-danger-300);
  --color-danger-soft-disabled-color: var(--color-neutral-400);
  --color-danger-soft-disabled-bg: var(--color-neutral-50);
  --color-danger-solid-color: var(--color-common-white);
  --color-danger-solid-bg: var(--color-danger-500);
  --color-danger-solid-hover-bg: var(--color-danger-600);
  --color-danger-solid-active-bg: var(--color-danger-700);
  --color-danger-solid-disabled-color: var(--color-neutral-400);
  --color-danger-solid-disabled-bg: var(--color-neutral-100);
  --color-success-plain-color: var(--color-success-500);
  --color-success-plain-hover-bg: var(--color-success-100);
  --color-success-plain-active-bg: var(--color-success-200);
  --color-success-plain-disabled-color: var(--color-neutral-400);
  --color-success-outlined-color: var(--color-success-500);
  --color-success-outlined-border: var(--color-success-300);
  --color-success-outlined-hover-bg: var(--color-success-100);
  --color-success-outlined-active-bg: var(--color-success-200);
  --color-success-outlined-disabled-color: var(--color-neutral-400);
  --color-success-outlined-disabled-border: var(--color-neutral-200);
  --color-success-soft-color: var(--color-success-700);
  --color-success-soft-bg: var(--color-success-100);
  --color-success-soft-hover-bg: var(--color-success-200);
  --color-success-soft-active-color: var(--color-success-800);
  --color-success-soft-active-bg: var(--color-success-300);
  --color-success-soft-disabled-color: var(--color-neutral-400);
  --color-success-soft-disabled-bg: var(--color-neutral-50);
  --color-success-solid-color: var(--color-common-white);
  --color-success-solid-bg: var(--color-success-500);
  --color-success-solid-hover-bg: var(--color-success-600);
  --color-success-solid-active-bg: var(--color-success-700);
  --color-success-solid-disabled-color: var(--color-neutral-400);
  --color-success-solid-disabled-bg: var(--color-neutral-100);
  --color-warning-plain-color: var(--color-warning-500);
  --color-warning-plain-hover-bg: var(--color-warning-100);
  --color-warning-plain-active-bg: var(--color-warning-200);
  --color-warning-plain-disabled-color: var(--color-neutral-400);
  --color-warning-outlined-color: var(--color-warning-500);
  --color-warning-outlined-border: var(--color-warning-300);
  --color-warning-outlined-hover-bg: var(--color-warning-100);
  --color-warning-outlined-active-bg: var(--color-warning-200);
  --color-warning-outlined-disabled-color: var(--color-neutral-400);
  --color-warning-outlined-disabled-border: var(--color-neutral-200);
  --color-warning-soft-color: var(--color-warning-700);
  --color-warning-soft-bg: var(--color-warning-100);
  --color-warning-soft-hover-bg: var(--color-warning-200);
  --color-warning-soft-active-color: var(--color-warning-800);
  --color-warning-soft-active-bg: var(--color-warning-300);
  --color-warning-soft-disabled-color: var(--color-neutral-400);
  --color-warning-soft-disabled-bg: var(--color-neutral-50);
  --color-warning-solid-color: var(--color-common-white);
  --color-warning-solid-bg: var(--color-warning-500);
  --color-warning-solid-hover-bg: var(--color-warning-600);
  --color-warning-solid-active-bg: var(--color-warning-700);
  --color-warning-solid-disabled-color: var(--color-neutral-400);
  --color-warning-solid-disabled-bg: var(--color-neutral-100);

  /* text + surface tokens (light mode default) */
  --color-ink-primary: var(--color-neutral-800);
  --color-ink-secondary: var(--color-neutral-700);
  --color-ink-tertiary: var(--color-neutral-600);
  --color-ink-icon: var(--color-neutral-500);
  --color-canvas: var(--color-common-white);
  --color-surface: var(--color-neutral-50);
  --color-surface-popup: var(--color-common-white);
  --color-surface-1: var(--color-neutral-100);
  --color-surface-2: var(--color-neutral-200);
  --color-surface-3: var(--color-neutral-300);
  --color-divider: rgba(99, 107, 116, 0.2);

  /* typography font stack (Joy UI defaultTheme.fontFamily) */
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;

  /* radius scale (Joy UI defaultTheme.radius) */
  --radius-xs: 2px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}

[data-color-scheme="dark"] {
  --color-primary-plain-color: var(--color-primary-300);
  --color-primary-plain-hover-bg: var(--color-primary-800);
  --color-primary-plain-active-bg: var(--color-primary-700);
  --color-primary-plain-disabled-color: var(--color-neutral-500);
  --color-primary-outlined-color: var(--color-primary-200);
  --color-primary-outlined-border: var(--color-primary-700);
  --color-primary-outlined-hover-bg: var(--color-primary-800);
  --color-primary-outlined-active-bg: var(--color-primary-700);
  --color-primary-outlined-disabled-color: var(--color-neutral-500);
  --color-primary-outlined-disabled-border: var(--color-neutral-800);
  --color-primary-soft-color: var(--color-primary-200);
  --color-primary-soft-bg: var(--color-primary-800);
  --color-primary-soft-hover-bg: var(--color-primary-700);
  --color-primary-soft-active-color: var(--color-primary-100);
  --color-primary-soft-active-bg: var(--color-primary-600);
  --color-primary-soft-disabled-color: var(--color-neutral-500);
  --color-primary-soft-disabled-bg: var(--color-neutral-800);
  --color-primary-solid-color: var(--color-common-white);
  --color-primary-solid-bg: var(--color-primary-500);
  --color-primary-solid-hover-bg: var(--color-primary-600);
  --color-primary-solid-active-bg: var(--color-primary-700);
  --color-primary-solid-disabled-color: var(--color-neutral-500);
  --color-primary-solid-disabled-bg: var(--color-neutral-800);
  --color-neutral-plain-color: var(--color-neutral-300);
  --color-neutral-plain-hover-bg: var(--color-neutral-800);
  --color-neutral-plain-active-bg: var(--color-neutral-700);
  --color-neutral-plain-disabled-color: var(--color-neutral-500);
  --color-neutral-outlined-color: var(--color-neutral-200);
  --color-neutral-outlined-border: var(--color-neutral-700);
  --color-neutral-outlined-hover-bg: var(--color-neutral-800);
  --color-neutral-outlined-active-bg: var(--color-neutral-700);
  --color-neutral-outlined-disabled-color: var(--color-neutral-500);
  --color-neutral-outlined-disabled-border: var(--color-neutral-800);
  --color-neutral-soft-color: var(--color-neutral-200);
  --color-neutral-soft-bg: var(--color-neutral-800);
  --color-neutral-soft-hover-bg: var(--color-neutral-700);
  --color-neutral-soft-active-color: var(--color-neutral-100);
  --color-neutral-soft-active-bg: var(--color-neutral-600);
  --color-neutral-soft-disabled-color: var(--color-neutral-500);
  --color-neutral-soft-disabled-bg: var(--color-neutral-800);
  --color-neutral-solid-color: var(--color-common-white);
  --color-neutral-solid-bg: var(--color-neutral-500);
  --color-neutral-solid-hover-bg: var(--color-neutral-600);
  --color-neutral-solid-active-bg: var(--color-neutral-700);
  --color-neutral-solid-disabled-color: var(--color-neutral-500);
  --color-neutral-solid-disabled-bg: var(--color-neutral-800);
  --color-danger-plain-color: var(--color-danger-300);
  --color-danger-plain-hover-bg: var(--color-danger-800);
  --color-danger-plain-active-bg: var(--color-danger-700);
  --color-danger-plain-disabled-color: var(--color-neutral-500);
  --color-danger-outlined-color: var(--color-danger-200);
  --color-danger-outlined-border: var(--color-danger-700);
  --color-danger-outlined-hover-bg: var(--color-danger-800);
  --color-danger-outlined-active-bg: var(--color-danger-700);
  --color-danger-outlined-disabled-color: var(--color-neutral-500);
  --color-danger-outlined-disabled-border: var(--color-neutral-800);
  --color-danger-soft-color: var(--color-danger-200);
  --color-danger-soft-bg: var(--color-danger-800);
  --color-danger-soft-hover-bg: var(--color-danger-700);
  --color-danger-soft-active-color: var(--color-danger-100);
  --color-danger-soft-active-bg: var(--color-danger-600);
  --color-danger-soft-disabled-color: var(--color-neutral-500);
  --color-danger-soft-disabled-bg: var(--color-neutral-800);
  --color-danger-solid-color: var(--color-common-white);
  --color-danger-solid-bg: var(--color-danger-500);
  --color-danger-solid-hover-bg: var(--color-danger-600);
  --color-danger-solid-active-bg: var(--color-danger-700);
  --color-danger-solid-disabled-color: var(--color-neutral-500);
  --color-danger-solid-disabled-bg: var(--color-neutral-800);
  --color-success-plain-color: var(--color-success-300);
  --color-success-plain-hover-bg: var(--color-success-800);
  --color-success-plain-active-bg: var(--color-success-700);
  --color-success-plain-disabled-color: var(--color-neutral-500);
  --color-success-outlined-color: var(--color-success-200);
  --color-success-outlined-border: var(--color-success-700);
  --color-success-outlined-hover-bg: var(--color-success-800);
  --color-success-outlined-active-bg: var(--color-success-700);
  --color-success-outlined-disabled-color: var(--color-neutral-500);
  --color-success-outlined-disabled-border: var(--color-neutral-800);
  --color-success-soft-color: var(--color-success-200);
  --color-success-soft-bg: var(--color-success-800);
  --color-success-soft-hover-bg: var(--color-success-700);
  --color-success-soft-active-color: var(--color-success-100);
  --color-success-soft-active-bg: var(--color-success-600);
  --color-success-soft-disabled-color: var(--color-neutral-500);
  --color-success-soft-disabled-bg: var(--color-neutral-800);
  --color-success-solid-color: var(--color-common-white);
  --color-success-solid-bg: var(--color-success-500);
  --color-success-solid-hover-bg: var(--color-success-600);
  --color-success-solid-active-bg: var(--color-success-700);
  --color-success-solid-disabled-color: var(--color-neutral-500);
  --color-success-solid-disabled-bg: var(--color-neutral-800);
  --color-warning-plain-color: var(--color-warning-300);
  --color-warning-plain-hover-bg: var(--color-warning-800);
  --color-warning-plain-active-bg: var(--color-warning-700);
  --color-warning-plain-disabled-color: var(--color-neutral-500);
  --color-warning-outlined-color: var(--color-warning-200);
  --color-warning-outlined-border: var(--color-warning-700);
  --color-warning-outlined-hover-bg: var(--color-warning-800);
  --color-warning-outlined-active-bg: var(--color-warning-700);
  --color-warning-outlined-disabled-color: var(--color-neutral-500);
  --color-warning-outlined-disabled-border: var(--color-neutral-800);
  --color-warning-soft-color: var(--color-warning-200);
  --color-warning-soft-bg: var(--color-warning-800);
  --color-warning-soft-hover-bg: var(--color-warning-700);
  --color-warning-soft-active-color: var(--color-warning-100);
  --color-warning-soft-active-bg: var(--color-warning-600);
  --color-warning-soft-disabled-color: var(--color-neutral-500);
  --color-warning-soft-disabled-bg: var(--color-neutral-800);
  --color-warning-solid-color: var(--color-common-white);
  --color-warning-solid-bg: var(--color-warning-500);
  --color-warning-solid-hover-bg: var(--color-warning-600);
  --color-warning-solid-active-bg: var(--color-warning-700);
  --color-warning-solid-disabled-color: var(--color-neutral-500);
  --color-warning-solid-disabled-bg: var(--color-neutral-800);

  --color-ink-primary: var(--color-neutral-100);
  --color-ink-secondary: var(--color-neutral-300);
  --color-ink-tertiary: var(--color-neutral-400);
  --color-ink-icon: var(--color-neutral-400);
  --color-canvas: var(--color-common-black);
  --color-surface: var(--color-neutral-900);
  --color-surface-popup: var(--color-common-black);
  --color-surface-1: var(--color-neutral-800);
  --color-surface-2: var(--color-neutral-700);
  --color-surface-3: var(--color-neutral-600);
  --color-divider: rgba(99, 107, 116, 0.16);
}
```

- [ ] **Step 2: Create `packages/ui/src/styles/index.css`**

```css
@import "tailwindcss";
@import "./theme.css";

@source "../";
```

The `@source "../"` directive tells Tailwind v4 to scan every file under `packages/ui/src` (relative to this CSS file) for utility class names — including the literal strings that live in plain `.ts` data files such as `utils/colorVariantClasses.ts` (Task 5), not just `.tsx` files that render JSX.

- [ ] **Step 3: Point the library entry at the stylesheet**

Edit `packages/ui/src/index.ts` (created in Task 2) — add this import at the very top of the file, above the existing `export const HINTORIC_UI_VERSION` line:

```ts
import './styles/index.css';
```

- [ ] **Step 4: Create `packages/ui/src/styles/css.d.ts`**

TypeScript has no built-in ambient type for a bare `import './foo.css'` side-effect import. Without this declaration, `vite-plugin-dts`'s type-checking pass fails the build with `TS2882: Cannot find module or type declarations for side-effect import of './styles/index.css'` — discovered when Step 6 below was first run.

```ts
declare module '*.css';
```

- [ ] **Step 5: Force a stable CSS output filename**

Vite's library mode derives the emitted CSS asset's name from the package name by default (`@hintoric/ui` → `dist/ui.css`), not `style.css` as the package's `exports` map (Task 2) expects. Edit `packages/ui/vite.config.ts` — add an `output.assetFileNames` entry inside `build.rollupOptions`:

```ts
    rollupOptions: {
      external: ['react', 'react-dom', '@base-ui/react'],
      output: {
        assetFileNames: (asset) => (asset.names?.[0]?.endsWith('.css') ? 'style.css' : '[name][extname]'),
      },
    },
```

- [ ] **Step 6: Verify the CSS builds**

Run: `pnpm --filter @hintoric/ui build`
Expected: exits `0`; `packages/ui/dist/style.css` now exists and contains the string `--color-primary-500` (confirms Tailwind processed `theme.css`).

Run: `grep -c "color-primary-500" packages/ui/dist/style.css`
Expected: `1` or more.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/styles/theme.css packages/ui/src/styles/index.css packages/ui/src/styles/css.d.ts packages/ui/src/index.ts packages/ui/vite.config.ts
git commit -m "feat: port Joy UI's color palette and variant tokens as Tailwind v4 theme"
```

---

## Task 4: `cx` className utility

**Files:**
- Create: `packages/ui/src/utils/cx.ts`
- Test: `packages/ui/src/utils/cx.test.ts`

**Interfaces:**
- Consumes: `clsx`, `tailwind-merge` (already declared as dependencies in Task 2).
- Produces: `cx(...inputs: ClassValue[]): string`, imported by every component task from here on as `import { cx } from '../../utils/cx';`.

- [ ] **Step 1: Write the failing test**

```ts
// packages/ui/src/utils/cx.test.ts
import { describe, expect, it } from 'vitest';
import { cx } from './cx';

describe('cx', () => {
  it('joins truthy class names and drops falsy ones', () => {
    expect(cx('a', false && 'b', undefined, 'c')).toBe('a c');
  });

  it('resolves conflicting Tailwind classes, keeping the last one', () => {
    expect(cx('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- cx.test.ts`
Expected: FAIL — `Cannot find module './cx'`.

- [ ] **Step 3: Write the implementation**

```ts
// packages/ui/src/utils/cx.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cx(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- cx.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/utils/cx.ts packages/ui/src/utils/cx.test.ts
git commit -m "feat: add cx className-merging utility"
```

---

## Task 5: Shared color-variant-classes data module

**Files:**
- Create: `packages/ui/src/utils/colorVariantClasses.ts`
- Test: `packages/ui/src/utils/colorVariantClasses.test.ts`

**Interfaces:**
- Consumes: nothing (pure data, no imports).
- Produces: `type JoyVariant = 'solid' | 'soft' | 'outlined' | 'plain'`, `type JoyColor = 'primary' | 'neutral' | 'danger' | 'success' | 'warning'`, `INTERACTIVE_COLOR_CLASSES: Record<JoyVariant, Record<JoyColor, string>>` (for Button, IconButton, Input), `SURFACE_COLOR_CLASSES: Record<JoyVariant, Record<JoyColor, string>>` (for Sheet, Card). Every later component task looks up its cva `compoundVariants` from one of these two maps instead of writing Tailwind class strings itself — this is the single place where the "always literal, never interpolated" Global Constraint is enforced.

- [ ] **Step 1: Write the failing test**

```ts
// packages/ui/src/utils/colorVariantClasses.test.ts
import { describe, expect, it } from 'vitest';
import {
  INTERACTIVE_COLOR_CLASSES,
  SURFACE_COLOR_CLASSES,
  type JoyColor,
  type JoyVariant,
} from './colorVariantClasses';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

describe('colorVariantClasses', () => {
  it('defines all four variants for the interactive map', () => {
    expect(Object.keys(INTERACTIVE_COLOR_CLASSES)).toEqual(VARIANTS);
  });

  it('defines all five colors under every variant of both maps', () => {
    for (const variant of VARIANTS) {
      expect(Object.keys(INTERACTIVE_COLOR_CLASSES[variant])).toEqual(COLORS);
      expect(Object.keys(SURFACE_COLOR_CLASSES[variant])).toEqual(COLORS);
    }
  });

  it('produces the exact class string Button/Input rely on for solid/primary', () => {
    expect(INTERACTIVE_COLOR_CLASSES.solid.primary).toBe(
      'bg-primary-solid-bg text-primary-solid-color hover:bg-primary-solid-hover-bg active:bg-primary-solid-active-bg disabled:bg-primary-solid-disabled-bg disabled:text-primary-solid-disabled-color',
    );
  });

  it('keeps surface classes free of hover/active/disabled pseudo-classes', () => {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        expect(SURFACE_COLOR_CLASSES[variant][color]).not.toMatch(/hover:|active:|disabled:/);
      }
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- colorVariantClasses.test.ts`
Expected: FAIL — `Cannot find module './colorVariantClasses'`.

- [ ] **Step 3: Write the implementation**

```ts
// packages/ui/src/utils/colorVariantClasses.ts
export type JoyVariant = 'solid' | 'soft' | 'outlined' | 'plain';
export type JoyColor = 'primary' | 'neutral' | 'danger' | 'success' | 'warning';

// Every string below is a COMPLETE literal Tailwind class list. Do not refactor
// this into a template-literal helper like `bg-${color}-solid-bg` — Tailwind's
// v4 content scanner only recognizes complete literal tokens in source files,
// so an interpolated name would silently stop generating CSS for it.
export const INTERACTIVE_COLOR_CLASSES: Record<JoyVariant, Record<JoyColor, string>> = {
  solid: {
    primary: 'bg-primary-solid-bg text-primary-solid-color hover:bg-primary-solid-hover-bg active:bg-primary-solid-active-bg disabled:bg-primary-solid-disabled-bg disabled:text-primary-solid-disabled-color',
    neutral: 'bg-neutral-solid-bg text-neutral-solid-color hover:bg-neutral-solid-hover-bg active:bg-neutral-solid-active-bg disabled:bg-neutral-solid-disabled-bg disabled:text-neutral-solid-disabled-color',
    danger: 'bg-danger-solid-bg text-danger-solid-color hover:bg-danger-solid-hover-bg active:bg-danger-solid-active-bg disabled:bg-danger-solid-disabled-bg disabled:text-danger-solid-disabled-color',
    success: 'bg-success-solid-bg text-success-solid-color hover:bg-success-solid-hover-bg active:bg-success-solid-active-bg disabled:bg-success-solid-disabled-bg disabled:text-success-solid-disabled-color',
    warning: 'bg-warning-solid-bg text-warning-solid-color hover:bg-warning-solid-hover-bg active:bg-warning-solid-active-bg disabled:bg-warning-solid-disabled-bg disabled:text-warning-solid-disabled-color',
  },
  soft: {
    primary: 'bg-primary-soft-bg text-primary-soft-color hover:bg-primary-soft-hover-bg active:bg-primary-soft-active-bg active:text-primary-soft-active-color disabled:bg-primary-soft-disabled-bg disabled:text-primary-soft-disabled-color',
    neutral: 'bg-neutral-soft-bg text-neutral-soft-color hover:bg-neutral-soft-hover-bg active:bg-neutral-soft-active-bg active:text-neutral-soft-active-color disabled:bg-neutral-soft-disabled-bg disabled:text-neutral-soft-disabled-color',
    danger: 'bg-danger-soft-bg text-danger-soft-color hover:bg-danger-soft-hover-bg active:bg-danger-soft-active-bg active:text-danger-soft-active-color disabled:bg-danger-soft-disabled-bg disabled:text-danger-soft-disabled-color',
    success: 'bg-success-soft-bg text-success-soft-color hover:bg-success-soft-hover-bg active:bg-success-soft-active-bg active:text-success-soft-active-color disabled:bg-success-soft-disabled-bg disabled:text-success-soft-disabled-color',
    warning: 'bg-warning-soft-bg text-warning-soft-color hover:bg-warning-soft-hover-bg active:bg-warning-soft-active-bg active:text-warning-soft-active-color disabled:bg-warning-soft-disabled-bg disabled:text-warning-soft-disabled-color',
  },
  outlined: {
    primary: 'border border-primary-outlined-border text-primary-outlined-color bg-transparent hover:bg-primary-outlined-hover-bg active:bg-primary-outlined-active-bg disabled:text-primary-outlined-disabled-color disabled:border-primary-outlined-disabled-border',
    neutral: 'border border-neutral-outlined-border text-neutral-outlined-color bg-transparent hover:bg-neutral-outlined-hover-bg active:bg-neutral-outlined-active-bg disabled:text-neutral-outlined-disabled-color disabled:border-neutral-outlined-disabled-border',
    danger: 'border border-danger-outlined-border text-danger-outlined-color bg-transparent hover:bg-danger-outlined-hover-bg active:bg-danger-outlined-active-bg disabled:text-danger-outlined-disabled-color disabled:border-danger-outlined-disabled-border',
    success: 'border border-success-outlined-border text-success-outlined-color bg-transparent hover:bg-success-outlined-hover-bg active:bg-success-outlined-active-bg disabled:text-success-outlined-disabled-color disabled:border-success-outlined-disabled-border',
    warning: 'border border-warning-outlined-border text-warning-outlined-color bg-transparent hover:bg-warning-outlined-hover-bg active:bg-warning-outlined-active-bg disabled:text-warning-outlined-disabled-color disabled:border-warning-outlined-disabled-border',
  },
  plain: {
    primary: 'text-primary-plain-color bg-transparent hover:bg-primary-plain-hover-bg active:bg-primary-plain-active-bg disabled:text-primary-plain-disabled-color',
    neutral: 'text-neutral-plain-color bg-transparent hover:bg-neutral-plain-hover-bg active:bg-neutral-plain-active-bg disabled:text-neutral-plain-disabled-color',
    danger: 'text-danger-plain-color bg-transparent hover:bg-danger-plain-hover-bg active:bg-danger-plain-active-bg disabled:text-danger-plain-disabled-color',
    success: 'text-success-plain-color bg-transparent hover:bg-success-plain-hover-bg active:bg-success-plain-active-bg disabled:text-success-plain-disabled-color',
    warning: 'text-warning-plain-color bg-transparent hover:bg-warning-plain-hover-bg active:bg-warning-plain-active-bg disabled:text-warning-plain-disabled-color',
  },
};

export const SURFACE_COLOR_CLASSES: Record<JoyVariant, Record<JoyColor, string>> = {
  solid: {
    primary: 'bg-primary-solid-bg text-primary-solid-color',
    neutral: 'bg-neutral-solid-bg text-neutral-solid-color',
    danger: 'bg-danger-solid-bg text-danger-solid-color',
    success: 'bg-success-solid-bg text-success-solid-color',
    warning: 'bg-warning-solid-bg text-warning-solid-color',
  },
  soft: {
    primary: 'bg-primary-soft-bg text-primary-soft-color',
    neutral: 'bg-neutral-soft-bg text-neutral-soft-color',
    danger: 'bg-danger-soft-bg text-danger-soft-color',
    success: 'bg-success-soft-bg text-success-soft-color',
    warning: 'bg-warning-soft-bg text-warning-soft-color',
  },
  outlined: {
    primary: 'border border-primary-outlined-border text-primary-outlined-color bg-transparent',
    neutral: 'border border-neutral-outlined-border text-neutral-outlined-color bg-transparent',
    danger: 'border border-danger-outlined-border text-danger-outlined-color bg-transparent',
    success: 'border border-success-outlined-border text-success-outlined-color bg-transparent',
    warning: 'border border-warning-outlined-border text-warning-outlined-color bg-transparent',
  },
  plain: {
    primary: 'text-primary-plain-color bg-transparent',
    neutral: 'text-neutral-plain-color bg-transparent',
    danger: 'text-danger-plain-color bg-transparent',
    success: 'text-success-plain-color bg-transparent',
    warning: 'text-warning-plain-color bg-transparent',
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- colorVariantClasses.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/utils/colorVariantClasses.ts packages/ui/src/utils/colorVariantClasses.test.ts
git commit -m "feat: add literal color-variant Tailwind class maps for interactive and surface components"
```

---

## Task 6: Polymorphic `component` prop helper

**Files:**
- Create: `packages/ui/src/utils/asRenderProp.ts`
- Test: `packages/ui/src/utils/asRenderProp.test.ts`

**Interfaces:**
- Consumes: `react` (peer dep, already installed).
- Produces: `asRenderProp(component: React.ElementType | undefined): React.ReactElement | undefined`. Box, Stack, Typography, Sheet (Tasks 8–11) all call this to translate Joy UI's `component` prop into Base UI's `useRender({ render })` prop.

- [ ] **Step 1: Write the failing test**

```tsx
// packages/ui/src/utils/asRenderProp.test.ts
import { describe, expect, it } from 'vitest';
import { asRenderProp } from './asRenderProp';

describe('asRenderProp', () => {
  it('returns undefined when no component is given', () => {
    expect(asRenderProp(undefined)).toBeUndefined();
  });

  it('creates a React element of the given tag name', () => {
    const element = asRenderProp('section');
    expect(element?.type).toBe('section');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- asRenderProp.test.ts`
Expected: FAIL — `Cannot find module './asRenderProp'`.

- [ ] **Step 3: Write the implementation**

```ts
// packages/ui/src/utils/asRenderProp.ts
import * as React from 'react';

export function asRenderProp(
  component: React.ElementType | undefined,
): React.ReactElement | undefined {
  if (!component) {
    return undefined;
  }
  return React.createElement(component);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- asRenderProp.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/utils/asRenderProp.ts packages/ui/src/utils/asRenderProp.test.ts
git commit -m "feat: add asRenderProp helper bridging Joy UI's component prop to Base UI's useRender"
```

---

## Task 7: `ColorSchemeProvider` + `useColorScheme`

**Files:**
- Create: `packages/ui/src/theme/ColorSchemeProvider.tsx`
- Test: `packages/ui/src/theme/ColorSchemeProvider.test.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `ColorSchemeProvider({ children, defaultMode? }): JSX.Element`, `useColorScheme(): { mode: 'light' | 'dark'; setMode: (mode: 'light' | 'dark') => void }`, and the exported types `ColorSchemeMode`, `ColorSchemeProviderProps`. The playground app (Task 18) is the only later consumer; every styled component (Tasks 8–16) is decoupled from this — they only rely on the `data-color-scheme` attribute existing somewhere above them in the DOM, set here.

- [ ] **Step 1: Write the failing test**

```tsx
// packages/ui/src/theme/ColorSchemeProvider.test.tsx
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSchemeProvider, useColorScheme } from './ColorSchemeProvider';

function Consumer() {
  const { mode, setMode } = useColorScheme();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <button type="button" onClick={() => setMode('dark')}>
        go dark
      </button>
    </div>
  );
}

describe('ColorSchemeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('defaults to light mode and sets data-color-scheme on its wrapper', () => {
    render(
      <ColorSchemeProvider>
        <Consumer />
      </ColorSchemeProvider>,
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    expect(screen.getByTestId('mode').closest('[data-color-scheme]')).toHaveAttribute(
      'data-color-scheme',
      'light',
    );
  });

  it('switches mode and updates the data attribute when setMode is called', async () => {
    render(
      <ColorSchemeProvider>
        <Consumer />
      </ColorSchemeProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'go dark' }));
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('mode').closest('[data-color-scheme]')).toHaveAttribute(
      'data-color-scheme',
      'dark',
    );
  });

  it('persists the chosen mode to localStorage', async () => {
    render(
      <ColorSchemeProvider>
        <Consumer />
      </ColorSchemeProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'go dark' }));
    expect(window.localStorage.getItem('hintoric-color-scheme')).toBe('dark');
  });

  it('throws a clear error when useColorScheme is used outside the provider', () => {
    function Bad() {
      useColorScheme();
      return null;
    }
    expect(() => render(<Bad />)).toThrow(
      'useColorScheme must be used within a ColorSchemeProvider',
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- ColorSchemeProvider.test.tsx`
Expected: FAIL — `Cannot find module './ColorSchemeProvider'`.

- [ ] **Step 3: Write the implementation**

```tsx
// packages/ui/src/theme/ColorSchemeProvider.tsx
'use client';
import * as React from 'react';

export type ColorSchemeMode = 'light' | 'dark';

interface ColorSchemeContextValue {
  mode: ColorSchemeMode;
  setMode: (mode: ColorSchemeMode) => void;
}

const ColorSchemeContext = React.createContext<ColorSchemeContextValue | null>(null);

const STORAGE_KEY = 'hintoric-color-scheme';

export interface ColorSchemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ColorSchemeMode;
}

export function ColorSchemeProvider({
  children,
  defaultMode = 'light',
}: ColorSchemeProviderProps) {
  const [mode, setModeState] = React.useState<ColorSchemeMode>(() => {
    if (typeof window === 'undefined') {
      return defaultMode;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : defaultMode;
  });

  const setMode = React.useCallback((next: ColorSchemeMode) => {
    setModeState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const value = React.useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <ColorSchemeContext.Provider value={value}>
      <div data-color-scheme={mode}>{children}</div>
    </ColorSchemeContext.Provider>
  );
}

export function useColorScheme(): ColorSchemeContextValue {
  const context = React.useContext(ColorSchemeContext);
  if (!context) {
    throw new Error('useColorScheme must be used within a ColorSchemeProvider');
  }
  return context;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- ColorSchemeProvider.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/theme/ColorSchemeProvider.tsx packages/ui/src/theme/ColorSchemeProvider.test.tsx
git commit -m "feat: add ColorSchemeProvider and useColorScheme"
```

---

## Task 8: `Box`

**Files:**
- Create: `packages/ui/src/components/Box/Box.tsx`
- Create: `packages/ui/src/components/Box/types.ts`
- Create: `packages/ui/src/components/Box/index.ts`
- Test: `packages/ui/src/components/Box/Box.test.tsx`

**Interfaces:**
- Consumes: `cx` (Task 4), `asRenderProp` (Task 6), `useRender`/`mergeProps` from `@base-ui/react`.
- Produces: `Box` (forwardRef component, ref type `HTMLElement`), `BoxProps` (`React.ComponentPropsWithoutRef<'div'> & { component?: React.ElementType }`). Stack (Task 9) and Card (Task 12) render on top of the same `useRender`/`asRenderProp` pattern established here.

- [ ] **Step 1: Write the failing test**

```tsx
// packages/ui/src/components/Box/Box.test.tsx
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Box } from './Box';

describe('Box', () => {
  it('renders a div by default', () => {
    render(<Box data-testid="box">content</Box>);
    const el = screen.getByTestId('box');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveTextContent('content');
  });

  it('renders the element passed via the component prop', () => {
    render(
      <Box component="section" data-testid="box">
        content
      </Box>,
    );
    expect(screen.getByTestId('box').tagName).toBe('SECTION');
  });

  it('merges a custom className with its own', () => {
    render(<Box className="custom-class" data-testid="box" />);
    expect(screen.getByTestId('box')).toHaveClass('custom-class');
  });

  it('forwards a ref to the underlying DOM node', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Box ref={ref} data-testid="box" />);
    expect(ref.current).toBe(screen.getByTestId('box'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- Box.test.tsx`
Expected: FAIL — `Cannot find module './Box'`.

- [ ] **Step 3: Write `packages/ui/src/components/Box/types.ts`**

```ts
import type * as React from 'react';

export interface BoxProps extends React.ComponentPropsWithoutRef<'div'> {
  component?: React.ElementType;
}
```

- [ ] **Step 4: Write `packages/ui/src/components/Box/Box.tsx`**

```tsx
'use client';
import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { mergeProps } from '@base-ui/react/merge-props';
import { cx } from '../../utils/cx';
import { asRenderProp } from '../../utils/asRenderProp';
import type { BoxProps } from './types';

export const Box = React.forwardRef<HTMLElement, BoxProps>(function Box(
  { component, className, ...props },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render: asRenderProp(component),
    ref,
    props: mergeProps<'div'>({ className: cx(className) }, props),
  });
});
```

- [ ] **Step 5: Write `packages/ui/src/components/Box/index.ts`**

```ts
export { Box } from './Box';
export type { BoxProps } from './types';
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- Box.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/Box
git commit -m "feat: add Box component"
```

---

## Task 9: `Stack`

**Files:**
- Create: `packages/ui/src/components/Stack/stackVariants.ts`
- Create: `packages/ui/src/components/Stack/Stack.tsx`
- Create: `packages/ui/src/components/Stack/types.ts`
- Create: `packages/ui/src/components/Stack/index.ts`
- Test: `packages/ui/src/components/Stack/Stack.test.tsx`

**Interfaces:**
- Consumes: `cx` (Task 4), `asRenderProp` (Task 6), `useRender`/`mergeProps` from `@base-ui/react`.
- Produces: `Stack` (forwardRef, ref type `HTMLElement`), `StackProps` (`direction?: 'row' | 'column'`, `spacing?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8`, `component?: React.ElementType`, plus native div props).

**Design note:** Joy UI's `Stack.spacing` accepts any number and multiplies it by the theme's 8px spacing unit. Reproducing that with literal Tailwind classes (Global Constraint) means enumerating a curated set of steps rather than an arbitrary number — Phase 1 supports `0, 1, 2, 3, 4, 5, 6, 8`, each mapped to the Tailwind `gap-*` utility that renders at `spacing * 8px` (e.g. `spacing={2}` → 16px → `gap-4`).

- [ ] **Step 1: Write the failing test**

```tsx
// packages/ui/src/components/Stack/Stack.test.tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stack } from './Stack';

describe('Stack', () => {
  it('renders a div with column direction and no gap by default', () => {
    render(<Stack data-testid="stack">content</Stack>);
    const el = screen.getByTestId('stack');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveClass('flex', 'flex-col', 'gap-0');
  });

  it('applies row direction', () => {
    render(<Stack direction="row" data-testid="stack" />);
    expect(screen.getByTestId('stack')).toHaveClass('flex-row');
  });

  it('maps spacing to the matching gap utility (spacing unit = 8px)', () => {
    render(<Stack spacing={2} data-testid="stack" />);
    expect(screen.getByTestId('stack')).toHaveClass('gap-4');
  });

  it('renders the element passed via the component prop', () => {
    render(<Stack component="section" data-testid="stack" />);
    expect(screen.getByTestId('stack').tagName).toBe('SECTION');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- Stack.test.tsx`
Expected: FAIL — `Cannot find module './Stack'`.

- [ ] **Step 3: Write `packages/ui/src/components/Stack/stackVariants.ts`**

```ts
import { cva } from 'class-variance-authority';

export type StackSpacingKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8';

export const stackVariants = cva('flex', {
  variants: {
    direction: {
      row: 'flex-row',
      column: 'flex-col',
    },
    spacing: {
      '0': 'gap-0',
      '1': 'gap-2',
      '2': 'gap-4',
      '3': 'gap-6',
      '4': 'gap-8',
      '5': 'gap-10',
      '6': 'gap-12',
      '8': 'gap-16',
    } satisfies Record<StackSpacingKey, string>,
  },
  defaultVariants: { direction: 'column', spacing: '0' },
});
```

- [ ] **Step 4: Write `packages/ui/src/components/Stack/types.ts`**

```ts
import type * as React from 'react';

export type StackSpacing = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;

export interface StackProps extends React.ComponentPropsWithoutRef<'div'> {
  component?: React.ElementType;
  direction?: 'row' | 'column';
  spacing?: StackSpacing;
}
```

- [ ] **Step 5: Write `packages/ui/src/components/Stack/Stack.tsx`**

```tsx
'use client';
import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { mergeProps } from '@base-ui/react/merge-props';
import { cx } from '../../utils/cx';
import { asRenderProp } from '../../utils/asRenderProp';
import { stackVariants, type StackSpacingKey } from './stackVariants';
import type { StackProps } from './types';

export const Stack = React.forwardRef<HTMLElement, StackProps>(function Stack(
  { component, direction, spacing = 0, className, ...props },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render: asRenderProp(component),
    ref,
    props: mergeProps<'div'>(
      {
        className: cx(
          stackVariants({ direction, spacing: String(spacing) as StackSpacingKey }),
          className,
        ),
      },
      props,
    ),
  });
});
```

- [ ] **Step 6: Write `packages/ui/src/components/Stack/index.ts`**

```ts
export { Stack } from './Stack';
export type { StackProps, StackSpacing } from './types';
```

- [ ] **Step 7: Run test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- Stack.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/Stack
git commit -m "feat: add Stack component"
```

---

## Task 10: `Typography`

**Files:**
- Create: `packages/ui/src/components/Typography/typographyVariants.ts`
- Create: `packages/ui/src/components/Typography/Typography.tsx`
- Create: `packages/ui/src/components/Typography/types.ts`
- Create: `packages/ui/src/components/Typography/index.ts`
- Test: `packages/ui/src/components/Typography/Typography.test.tsx`

**Interfaces:**
- Consumes: `cx` (Task 4), `asRenderProp` (Task 6), `useRender`/`mergeProps` from `@base-ui/react`.
- Produces: `Typography` (forwardRef, ref type `HTMLElement`), `TypographyProps` (`level?: TypographyLevel`, `component?: React.ElementType`, native `<p>` props minus `color`), `TypographyLevel` union type.

**Provenance:** the `level` → tag/font mapping is copied from Joy UI's `Typography.tsx` (`defaultVariantMapping`) and its `fontSize`/`fontWeight`/`lineHeight` scale from `extendTheme.ts`, both at `v6.x`. Joy UI's `fontSize` scale (`xs`=0.75rem … `xl4`=2.25rem) and `fontWeight` scale (300/500/600/700) happen to line up exactly with Tailwind's own default `text-*`/`font-*` utilities, so those are reused as-is; `lineHeight` values that don't have an exact built-in match use Tailwind arbitrary values (`leading-[…]`).

- [ ] **Step 1: Write the failing test**

```tsx
// packages/ui/src/components/Typography/Typography.test.tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Typography } from './Typography';

describe('Typography', () => {
  it('defaults to level body-md rendered as a <p>', () => {
    render(<Typography data-testid="t">Hello</Typography>);
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('P');
    expect(el).toHaveClass('text-base');
  });

  it('renders level h1 as an <h1> with the h1 classes', () => {
    render(
      <Typography level="h1" data-testid="t">
        Title
      </Typography>,
    );
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('H1');
    expect(el).toHaveClass('text-4xl', 'font-bold');
  });

  it('renders level body-xs as a <span>', () => {
    render(
      <Typography level="body-xs" data-testid="t">
        Fine print
      </Typography>,
    );
    expect(screen.getByTestId('t').tagName).toBe('SPAN');
  });

  it('lets the component prop override the level default tag', () => {
    render(
      <Typography level="h2" component="div" data-testid="t">
        Title
      </Typography>,
    );
    expect(screen.getByTestId('t').tagName).toBe('DIV');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- Typography.test.tsx`
Expected: FAIL — `Cannot find module './Typography'`.

- [ ] **Step 3: Write `packages/ui/src/components/Typography/types.ts`**

```ts
import type * as React from 'react';

export type TypographyLevel =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'title-lg'
  | 'title-md'
  | 'title-sm'
  | 'body-lg'
  | 'body-md'
  | 'body-sm'
  | 'body-xs';

export interface TypographyProps extends Omit<React.ComponentPropsWithoutRef<'p'>, 'color'> {
  component?: React.ElementType;
  level?: TypographyLevel;
}
```

- [ ] **Step 4: Write `packages/ui/src/components/Typography/typographyVariants.ts`**

```ts
import { cva } from 'class-variance-authority';
import type * as React from 'react';
import type { TypographyLevel } from './types';

export const typographyVariants = cva('font-body', {
  variants: {
    level: {
      h1: 'text-4xl font-bold leading-[1.33334] tracking-tight text-ink-primary',
      h2: 'text-3xl font-bold leading-[1.33334] tracking-tight text-ink-primary',
      h3: 'text-2xl font-semibold leading-[1.33334] tracking-tight text-ink-primary',
      h4: 'text-xl font-semibold leading-normal tracking-tight text-ink-primary',
      'title-lg': 'text-lg font-semibold leading-[1.33334] text-ink-primary',
      'title-md': 'text-base font-medium leading-normal text-ink-primary',
      'title-sm': 'text-sm font-medium leading-[1.42858] text-ink-primary',
      'body-lg': 'text-lg leading-normal text-ink-secondary',
      'body-md': 'text-base leading-normal text-ink-secondary',
      'body-sm': 'text-sm leading-normal text-ink-tertiary',
      'body-xs': 'text-xs font-medium leading-normal text-ink-tertiary',
    },
  },
  defaultVariants: { level: 'body-md' },
});

export const TYPOGRAPHY_DEFAULT_TAG: Record<TypographyLevel, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  'title-lg': 'p',
  'title-md': 'p',
  'title-sm': 'p',
  'body-lg': 'p',
  'body-md': 'p',
  'body-sm': 'p',
  'body-xs': 'span',
};
```

- [ ] **Step 5: Write `packages/ui/src/components/Typography/Typography.tsx`**

```tsx
'use client';
import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { mergeProps } from '@base-ui/react/merge-props';
import { cx } from '../../utils/cx';
import { asRenderProp } from '../../utils/asRenderProp';
import { typographyVariants, TYPOGRAPHY_DEFAULT_TAG } from './typographyVariants';
import type { TypographyProps } from './types';

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(function Typography(
  { component, level = 'body-md', className, ...props },
  ref,
) {
  const tag = component ?? TYPOGRAPHY_DEFAULT_TAG[level];
  return useRender({
    defaultTagName: 'p',
    render: asRenderProp(tag),
    ref,
    props: mergeProps<'p'>({ className: cx(typographyVariants({ level }), className) }, props),
  });
});
```

- [ ] **Step 6: Write `packages/ui/src/components/Typography/index.ts`**

```ts
export { Typography } from './Typography';
export type { TypographyProps, TypographyLevel } from './types';
```

- [ ] **Step 7: Run test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- Typography.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/Typography
git commit -m "feat: add Typography component"
```

---

## Task 11: `Sheet`

**Files:**
- Create: `packages/ui/src/components/Sheet/sheetVariants.ts`
- Create: `packages/ui/src/components/Sheet/Sheet.tsx`
- Create: `packages/ui/src/components/Sheet/types.ts`
- Create: `packages/ui/src/components/Sheet/index.ts`
- Test: `packages/ui/src/components/Sheet/Sheet.test.tsx`

**Interfaces:**
- Consumes: `cx` (Task 4), `asRenderProp` (Task 6), `SURFACE_COLOR_CLASSES`/`JoyVariant`/`JoyColor` (Task 5), `useRender`/`mergeProps` from `@base-ui/react`.
- Produces: `Sheet` (forwardRef, ref type `HTMLElement`), `SheetProps` (`variant?: JoyVariant`, `color?: JoyColor`, `component?: React.ElementType`, native div props minus `color`). Card (Task 12) renders `Sheet` directly.

- [ ] **Step 1: Write the failing test**

```tsx
// packages/ui/src/components/Sheet/Sheet.test.tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sheet } from './Sheet';

describe('Sheet', () => {
  it('defaults to plain/neutral', () => {
    render(<Sheet data-testid="sheet">content</Sheet>);
    expect(screen.getByTestId('sheet')).toHaveClass('text-neutral-plain-color');
  });

  it('applies solid/primary classes when requested', () => {
    render(
      <Sheet variant="solid" color="primary" data-testid="sheet">
        content
      </Sheet>,
    );
    expect(screen.getByTestId('sheet')).toHaveClass('bg-primary-solid-bg', 'text-primary-solid-color');
  });

  it('renders the element passed via the component prop', () => {
    render(<Sheet component="section" data-testid="sheet" />);
    expect(screen.getByTestId('sheet').tagName).toBe('SECTION');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- Sheet.test.tsx`
Expected: FAIL — `Cannot find module './Sheet'`.

- [ ] **Step 3: Write `packages/ui/src/components/Sheet/types.ts`**

```ts
import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface SheetProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  component?: React.ElementType;
  variant?: JoyVariant;
  color?: JoyColor;
}
```

- [ ] **Step 4: Write `packages/ui/src/components/Sheet/sheetVariants.ts`**

```ts
import { cva } from 'class-variance-authority';
import { SURFACE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  JOY_COLORS.map((color) => ({ variant, color, class: SURFACE_COLOR_CLASSES[variant][color] })),
);

export const sheetVariants = cva('rounded-md', {
  variants: {
    variant: { solid: '', soft: '', outlined: '', plain: '' },
    color: { primary: '', neutral: '', danger: '', success: '', warning: '' },
  },
  compoundVariants,
  defaultVariants: { variant: 'plain', color: 'neutral' },
});
```

- [ ] **Step 5: Write `packages/ui/src/components/Sheet/Sheet.tsx`**

```tsx
'use client';
import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { mergeProps } from '@base-ui/react/merge-props';
import { cx } from '../../utils/cx';
import { asRenderProp } from '../../utils/asRenderProp';
import { sheetVariants } from './sheetVariants';
import type { SheetProps } from './types';

export const Sheet = React.forwardRef<HTMLElement, SheetProps>(function Sheet(
  { component, variant, color, className, ...props },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render: asRenderProp(component),
    ref,
    props: mergeProps<'div'>({ className: cx(sheetVariants({ variant, color }), className) }, props),
  });
});
```

- [ ] **Step 6: Write `packages/ui/src/components/Sheet/index.ts`**

```ts
export { Sheet } from './Sheet';
export type { SheetProps } from './types';
```

- [ ] **Step 7: Run test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- Sheet.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/Sheet
git commit -m "feat: add Sheet component"
```

---

## Task 12: `Card`

**Files:**
- Create: `packages/ui/src/components/Card/Card.tsx`
- Create: `packages/ui/src/components/Card/types.ts`
- Create: `packages/ui/src/components/Card/index.ts`
- Test: `packages/ui/src/components/Card/Card.test.tsx`

**Interfaces:**
- Consumes: `Sheet`, `SheetProps` (Task 11), `cx` (Task 4).
- Produces: `Card` (forwardRef, ref type `HTMLElement`), `CardProps` (same shape as `SheetProps`, defaults changed).

- [ ] **Step 1: Write the failing test**

```tsx
// packages/ui/src/components/Card/Card.test.tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('defaults to outlined/neutral with a column flex layout', () => {
    render(<Card data-testid="card">content</Card>);
    const el = screen.getByTestId('card');
    expect(el).toHaveClass('border-neutral-outlined-border', 'flex', 'flex-col');
  });

  it('applies a different variant/color when requested', () => {
    render(
      <Card variant="soft" color="success" data-testid="card">
        content
      </Card>,
    );
    expect(screen.getByTestId('card')).toHaveClass('bg-success-soft-bg');
  });

  it('renders its children', () => {
    render(<Card>hello card</Card>);
    expect(screen.getByText('hello card')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- Card.test.tsx`
Expected: FAIL — `Cannot find module './Card'`.

- [ ] **Step 3: Write `packages/ui/src/components/Card/types.ts`**

```ts
export type { SheetProps as CardProps } from '../Sheet/types';
```

- [ ] **Step 4: Write `packages/ui/src/components/Card/Card.tsx`**

```tsx
'use client';
import * as React from 'react';
import { Sheet } from '../Sheet/Sheet';
import { cx } from '../../utils/cx';
import type { CardProps } from './types';

export const Card = React.forwardRef<HTMLElement, CardProps>(function Card(
  { variant = 'outlined', color = 'neutral', className, ...props },
  ref,
) {
  return (
    <Sheet
      ref={ref}
      variant={variant}
      color={color}
      className={cx('flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
});
```

- [ ] **Step 5: Write `packages/ui/src/components/Card/index.ts`**

```ts
export { Card } from './Card';
export type { CardProps } from './types';
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- Card.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/Card
git commit -m "feat: add Card component"
```

---

## Task 13: `Button`

**Files:**
- Create: `packages/ui/src/components/Button/buttonVariants.ts`
- Create: `packages/ui/src/components/Button/Button.tsx`
- Create: `packages/ui/src/components/Button/types.ts`
- Create: `packages/ui/src/components/Button/index.ts`
- Test: `packages/ui/src/components/Button/Button.test.tsx`

**Interfaces:**
- Consumes: `cx` (Task 4), `INTERACTIVE_COLOR_CLASSES`/`JoyVariant`/`JoyColor` (Task 5), `Button as BaseButton` from `@base-ui/react/button`.
- Produces: `Button` (forwardRef, ref type `HTMLButtonElement`), `ButtonProps`.

- [ ] **Step 1: Write the failing test**

```tsx
// packages/ui/src/components/Button/Button.test.tsx
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders a native button with its children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies the solid/primary classes by default', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary-solid-bg');
  });

  it('applies outlined/danger classes when requested', () => {
    render(
      <Button variant="outlined" color="danger">
        Delete
      </Button>,
    );
    expect(screen.getByRole('button')).toHaveClass('border-danger-outlined-border');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button and blocks clicks while loading', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders startDecorator and endDecorator around the children', () => {
    render(
      <Button
        startDecorator={<span data-testid="start">S</span>}
        endDecorator={<span data-testid="end">E</span>}
      >
        Click me
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toContainElement(screen.getByTestId('start'));
    expect(button).toContainElement(screen.getByTestId('end'));
  });

  it('forwards a ref to the underlying button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Click me</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- Button.test.tsx`
Expected: FAIL — `Cannot find module './Button'`.

- [ ] **Step 3: Write `packages/ui/src/components/Button/types.ts`**

```ts
import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface ButtonProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
}
```

- [ ] **Step 4: Write `packages/ui/src/components/Button/buttonVariants.ts`**

```ts
import { cva } from 'class-variance-authority';
import { INTERACTIVE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  JOY_COLORS.map((color) => ({ variant, color, class: INTERACTIVE_COLOR_CLASSES[variant][color] })),
);

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-body font-medium transition-colors disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
  {
    variants: {
      variant: { solid: '', soft: '', outlined: '', plain: '' },
      color: { primary: '', neutral: '', danger: '', success: '', warning: '' },
      size: {
        sm: 'min-h-8 px-3 text-sm',
        md: 'min-h-10 px-4 text-base',
        lg: 'min-h-12 px-6 text-lg',
      },
    },
    compoundVariants,
    defaultVariants: { variant: 'solid', color: 'primary', size: 'md' },
  },
);
```

- [ ] **Step 5: Write `packages/ui/src/components/Button/Button.tsx`**

```tsx
'use client';
import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import { cx } from '../../utils/cx';
import { buttonVariants } from './buttonVariants';
import type { ButtonProps } from './types';

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'solid',
    color = 'primary',
    size = 'md',
    loading = false,
    disabled,
    startDecorator,
    endDecorator,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <BaseButton
      ref={ref}
      disabled={disabled || loading}
      className={cx(
        buttonVariants({ variant, color, size }),
        loading && 'relative text-transparent',
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center text-current"
        >
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </span>
      )}
      {startDecorator && <span className="inline-flex items-center">{startDecorator}</span>}
      {children}
      {endDecorator && <span className="inline-flex items-center">{endDecorator}</span>}
    </BaseButton>
  );
});
```

- [ ] **Step 6: Write `packages/ui/src/components/Button/index.ts`**

```ts
export { Button } from './Button';
export type { ButtonProps } from './types';
```

- [ ] **Step 7: Run test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- Button.test.tsx`
Expected: PASS (7 tests).

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/Button
git commit -m "feat: add Button component"
```

---

## Task 14: `IconButton`

**Files:**
- Create: `packages/ui/src/components/IconButton/iconButtonVariants.ts`
- Create: `packages/ui/src/components/IconButton/IconButton.tsx`
- Create: `packages/ui/src/components/IconButton/types.ts`
- Create: `packages/ui/src/components/IconButton/index.ts`
- Test: `packages/ui/src/components/IconButton/IconButton.test.tsx`

**Interfaces:**
- Consumes: `cx` (Task 4), `INTERACTIVE_COLOR_CLASSES`/`JoyVariant`/`JoyColor` (Task 5), `Button as BaseButton` from `@base-ui/react/button`.
- Produces: `IconButton` (forwardRef, ref type `HTMLButtonElement`), `IconButtonProps`.

- [ ] **Step 1: Write the failing test**

```tsx
// packages/ui/src/components/IconButton/IconButton.test.tsx
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('renders a native button with an accessible label', () => {
    render(<IconButton aria-label="close">×</IconButton>);
    expect(screen.getByRole('button', { name: 'close' })).toBeInTheDocument();
  });

  it('defaults to plain/neutral and a square md size', () => {
    render(<IconButton aria-label="close">×</IconButton>);
    expect(screen.getByRole('button')).toHaveClass('text-neutral-plain-color', 'size-10');
  });

  it('applies solid/danger classes when requested', () => {
    render(
      <IconButton variant="solid" color="danger" aria-label="delete">
        ×
      </IconButton>,
    );
    expect(screen.getByRole('button')).toHaveClass('bg-danger-solid-bg');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(
      <IconButton aria-label="close" onClick={onClick}>
        ×
      </IconButton>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards a ref to the underlying button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <IconButton aria-label="close" ref={ref}>
        ×
      </IconButton>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- IconButton.test.tsx`
Expected: FAIL — `Cannot find module './IconButton'`.

- [ ] **Step 3: Write `packages/ui/src/components/IconButton/types.ts`**

```ts
import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface IconButtonProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
}
```

- [ ] **Step 4: Write `packages/ui/src/components/IconButton/iconButtonVariants.ts`**

```ts
import { cva } from 'class-variance-authority';
import { INTERACTIVE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  JOY_COLORS.map((color) => ({ variant, color, class: INTERACTIVE_COLOR_CLASSES[variant][color] })),
);

export const iconButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
  {
    variants: {
      variant: { solid: '', soft: '', outlined: '', plain: '' },
      color: { primary: '', neutral: '', danger: '', success: '', warning: '' },
      size: {
        sm: 'size-8',
        md: 'size-10',
        lg: 'size-12',
      },
    },
    compoundVariants,
    defaultVariants: { variant: 'plain', color: 'neutral', size: 'md' },
  },
);
```

- [ ] **Step 5: Write `packages/ui/src/components/IconButton/IconButton.tsx`**

```tsx
'use client';
import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import { cx } from '../../utils/cx';
import { iconButtonVariants } from './iconButtonVariants';
import type { IconButtonProps } from './types';

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = 'plain', color = 'neutral', size = 'md', className, ...props },
  ref,
) {
  return (
    <BaseButton
      ref={ref}
      className={cx(iconButtonVariants({ variant, color, size }), className)}
      {...props}
    />
  );
});
```

- [ ] **Step 6: Write `packages/ui/src/components/IconButton/index.ts`**

```ts
export { IconButton } from './IconButton';
export type { IconButtonProps } from './types';
```

- [ ] **Step 7: Run test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- IconButton.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/IconButton
git commit -m "feat: add IconButton component"
```

---

## Task 15: `Input`

**Files:**
- Create: `packages/ui/src/components/Input/inputVariants.ts`
- Create: `packages/ui/src/components/Input/Input.tsx`
- Create: `packages/ui/src/components/Input/types.ts`
- Create: `packages/ui/src/components/Input/index.ts`
- Test: `packages/ui/src/components/Input/Input.test.tsx`

**Interfaces:**
- Consumes: `cx` (Task 4), `INTERACTIVE_COLOR_CLASSES`/`JoyVariant`/`JoyColor` (Task 5), `Input as BaseInput` from `@base-ui/react/input`.
- Produces: `Input` (forwardRef, ref type `HTMLInputElement`), `InputProps`. `inputVariants` (also consumed directly by Textarea in Task 16, since Joy UI's Input and Textarea share the same outlined/soft/solid/plain container look).

**Design note (API adapter):** Base UI's `<Input>` reports value changes through `onValueChange(value: string, ...)`, not a native `onChange` event — a deliberate Base UI API choice, not something we can configure away. To keep Joy UI's familiar `onChange={(event) => ...}` signature, this component builds a minimal object shaped like `React.ChangeEvent<HTMLInputElement>` with a correct `target.value`/`currentTarget.value` and passes that to the caller's `onChange`. This covers the overwhelming majority of real usage (`e.target.value`) but is not a byte-for-byte native `ChangeEvent` — it does not carry `bubbles`, `nativeEvent`, etc. Note this in a code comment rather than presenting it as a full native event.

- [ ] **Step 1: Write the failing test**

```tsx
// packages/ui/src/components/Input/Input.test.tsx
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renders a native input', () => {
    render(<Input aria-label="name" />);
    expect(screen.getByRole('textbox', { name: 'name' })).toBeInTheDocument();
  });

  it('applies outlined/neutral classes to the wrapper by default', () => {
    render(<Input aria-label="name" />);
    const input = screen.getByRole('textbox', { name: 'name' });
    expect(input.parentElement).toHaveClass('border-neutral-outlined-border');
  });

  it('calls onChange with the new value while typing', async () => {
    const onChange = vi.fn();
    render(<Input aria-label="name" onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'name' }), 'hi');
    expect(onChange).toHaveBeenCalled();
    const lastEvent = onChange.mock.calls.at(-1)?.[0];
    expect(lastEvent.target.value).toBe('hi');
  });

  it('renders startDecorator and endDecorator inside the wrapper', () => {
    render(
      <Input
        aria-label="name"
        startDecorator={<span data-testid="start" />}
        endDecorator={<span data-testid="end" />}
      />,
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('forwards a ref to the underlying input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input aria-label="name" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- Input.test.tsx`
Expected: FAIL — `Cannot find module './Input'`.

- [ ] **Step 3: Write `packages/ui/src/components/Input/types.ts`**

```ts
import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface InputProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'color' | 'size' | 'onChange'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}
```

- [ ] **Step 4: Write `packages/ui/src/components/Input/inputVariants.ts`**

```ts
import { cva } from 'class-variance-authority';
import { INTERACTIVE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  JOY_COLORS.map((color) => ({ variant, color, class: INTERACTIVE_COLOR_CLASSES[variant][color] })),
);

export const inputVariants = cva(
  'inline-flex items-center gap-2 rounded-md font-body transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-500',
  {
    variants: {
      variant: { solid: '', soft: '', outlined: '', plain: '' },
      color: { primary: '', neutral: '', danger: '', success: '', warning: '' },
      size: {
        sm: 'min-h-8 px-3 text-sm',
        md: 'min-h-10 px-3 text-base',
        lg: 'min-h-12 px-4 text-lg',
      },
    },
    compoundVariants,
    defaultVariants: { variant: 'outlined', color: 'neutral', size: 'md' },
  },
);
```

- [ ] **Step 5: Write `packages/ui/src/components/Input/Input.tsx`**

```tsx
'use client';
import * as React from 'react';
import { Input as BaseInput } from '@base-ui/react/input';
import { cx } from '../../utils/cx';
import { inputVariants } from './inputVariants';
import type { InputProps } from './types';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    variant = 'outlined',
    color = 'neutral',
    size = 'md',
    startDecorator,
    endDecorator,
    className,
    onChange,
    ...props
  },
  ref,
) {
  return (
    <span className={cx(inputVariants({ variant, color, size }), className)}>
      {startDecorator && (
        <span className="inline-flex items-center text-ink-icon">{startDecorator}</span>
      )}
      <BaseInput
        ref={ref}
        className="w-full min-w-0 border-none bg-transparent p-0 outline-none"
        // Base UI reports changes via onValueChange(value), not a native onChange
        // event. Build a minimal ChangeEvent-shaped object (target.value /
        // currentTarget.value only) so callers can keep Joy UI's onChange(event)
        // signature. This is not a full native ChangeEvent.
        onValueChange={
          onChange
            ? (value: string) => {
                const fakeEvent = {
                  target: { value },
                  currentTarget: { value },
                } as unknown as React.ChangeEvent<HTMLInputElement>;
                onChange(fakeEvent);
              }
            : undefined
        }
        {...props}
      />
      {endDecorator && (
        <span className="inline-flex items-center text-ink-icon">{endDecorator}</span>
      )}
    </span>
  );
});
```

- [ ] **Step 6: Write `packages/ui/src/components/Input/index.ts`**

```ts
export { Input } from './Input';
export type { InputProps } from './types';
```

- [ ] **Step 7: Run test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- Input.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/Input
git commit -m "feat: add Input component"
```

---

## Task 16: `Textarea`

**Files:**
- Create: `packages/ui/src/components/Textarea/Textarea.tsx`
- Create: `packages/ui/src/components/Textarea/types.ts`
- Create: `packages/ui/src/components/Textarea/index.ts`
- Test: `packages/ui/src/components/Textarea/Textarea.test.tsx`

**Interfaces:**
- Consumes: `cx` (Task 4), `inputVariants`/`JoyVariant`/`JoyColor` (Task 15).
- Produces: `Textarea` (forwardRef, ref type `HTMLTextAreaElement`), `TextareaProps`.

**Design note:** Base UI ships no dedicated Textarea primitive (a native `<textarea>` needs no extra behavior wrapping), so this component skips Base UI entirely and styles a plain `<textarea>` directly with the same `inputVariants` used by `Input` — Joy UI visually treats both the same way. Because it's a real native element, its `onChange` is the standard DOM event; no adapter is needed here (unlike Task 15's `Input`).

- [ ] **Step 1: Write the failing test**

```tsx
// packages/ui/src/components/Textarea/Textarea.test.tsx
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders a native textarea', () => {
    render(<Textarea aria-label="bio" />);
    expect(screen.getByRole('textbox', { name: 'bio' }).tagName).toBe('TEXTAREA');
  });

  it('applies outlined/neutral classes by default', () => {
    render(<Textarea aria-label="bio" />);
    expect(screen.getByRole('textbox', { name: 'bio' })).toHaveClass('border-neutral-outlined-border');
  });

  it('calls onChange with the native event while typing', async () => {
    const onChange = vi.fn();
    render(<Textarea aria-label="bio" onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'bio' }), 'hi');
    expect(onChange).toHaveBeenCalled();
  });

  it('forwards a ref to the underlying textarea element', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea aria-label="bio" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- Textarea.test.tsx`
Expected: FAIL — `Cannot find module './Textarea'`.

- [ ] **Step 3: Write `packages/ui/src/components/Textarea/types.ts`**

```ts
import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface TextareaProps
  extends Omit<React.ComponentPropsWithoutRef<'textarea'>, 'color' | 'size'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
}
```

- [ ] **Step 4: Write `packages/ui/src/components/Textarea/Textarea.tsx`**

```tsx
'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { inputVariants } from '../Input/inputVariants';
import type { TextareaProps } from './types';

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { variant = 'outlined', color = 'neutral', size = 'md', className, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cx(inputVariants({ variant, color, size }), 'min-h-16 items-start py-2', className)}
      {...props}
    />
  );
});
```

- [ ] **Step 5: Write `packages/ui/src/components/Textarea/index.ts`**

```ts
export { Textarea } from './Textarea';
export type { TextareaProps } from './types';
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- Textarea.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/Textarea
git commit -m "feat: add Textarea component"
```

---

## Task 17: Package entry point

**Files:**
- Modify: `packages/ui/src/index.ts`
- Test: `packages/ui/src/index.test.ts`

**Interfaces:**
- Consumes: every component and type produced by Tasks 7–16.
- Produces: the complete public API surface of `@hintoric/ui` — this is the last task before the package is "done" for Phase 1; the playground app (Task 18) imports only from this entry point, exactly as an external consumer would.

- [ ] **Step 1: Write the failing test**

```ts
// packages/ui/src/index.test.ts
import { describe, expect, it } from 'vitest';
import * as HintoricUI from './index';

describe('package entry point', () => {
  it('exports every Phase 1 component and the color-scheme hook', () => {
    const expectedExports = [
      'ColorSchemeProvider',
      'useColorScheme',
      'Box',
      'Stack',
      'Typography',
      'Sheet',
      'Card',
      'Button',
      'IconButton',
      'Input',
      'Textarea',
    ];
    for (const name of expectedExports) {
      expect(HintoricUI).toHaveProperty(name);
      expect((HintoricUI as Record<string, unknown>)[name]).toBeDefined();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- index.test.ts`
Expected: FAIL — most of `expectedExports` are `undefined` because `src/index.ts` still only exports `HINTORIC_UI_VERSION` and the stylesheet import.

- [ ] **Step 3: Replace `packages/ui/src/index.ts` in full**

```ts
import './styles/index.css';

export { ColorSchemeProvider, useColorScheme } from './theme/ColorSchemeProvider';
export type { ColorSchemeMode, ColorSchemeProviderProps } from './theme/ColorSchemeProvider';

export { Box } from './components/Box';
export type { BoxProps } from './components/Box';

export { Stack } from './components/Stack';
export type { StackProps, StackSpacing } from './components/Stack';

export { Typography } from './components/Typography';
export type { TypographyProps, TypographyLevel } from './components/Typography';

export { Sheet } from './components/Sheet';
export type { SheetProps } from './components/Sheet';

export { Card } from './components/Card';
export type { CardProps } from './components/Card';

export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';

export { IconButton } from './components/IconButton';
export type { IconButtonProps } from './components/IconButton';

export { Input } from './components/Input';
export type { InputProps } from './components/Input';

export { Textarea } from './components/Textarea';
export type { TextareaProps } from './components/Textarea';

export type { JoyColor, JoyVariant } from './utils/colorVariantClasses';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- index.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Run the full test suite**

Run: `pnpm --filter @hintoric/ui test`
Expected: all test files from Tasks 4–17 PASS (0 failures).

- [ ] **Step 6: Verify the production build and its exports**

Run: `pnpm --filter @hintoric/ui build`
Expected: exits `0`.

Run: `grep -c "ButtonProps" packages/ui/dist/index.d.ts`
Expected: `1` or more.

**Discovered during implementation:** despite `rollupTypes: true`, this toolchain's `dist/index.d.ts` is not a single flattened file — it's still bare `export … from './components/Box'`-style re-exports, and `dist/` keeps the full per-component `.d.ts` tree (`dist/components/Box/index.d.ts`, `dist/components/Box/types.d.ts`, etc.) alongside it. That's fine: `"files": ["dist"]` in `package.json` (Task 2) ships that whole tree, so the relative re-exports resolve correctly for consumers — this is the same shape most npm packages ship types in. `grep`-ing `dist/index.d.ts` for `ButtonProps` finds it as part of the `export type { ButtonProps } from './components/Button';` line, not as an inlined interface — still a valid confirmation that the entry point re-exports it.

Run: `test -s packages/ui/dist/style.css && echo OK`
Expected: `OK` (confirms the CSS bundle is non-empty).

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/index.ts packages/ui/src/index.test.ts
git commit -m "feat: export the full Phase 1 public API from @hintoric/ui"
```

---

## Task 18: Playground app

**Files:**
- Create: `apps/playground/package.json`
- Create: `apps/playground/tsconfig.json`
- Create: `apps/playground/vite.config.ts`
- Create: `apps/playground/index.html`
- Create: `apps/playground/src/main.tsx`
- Create: `apps/playground/src/App.tsx`

**Interfaces:**
- Consumes: the full public API of `@hintoric/ui` (Task 17), as a workspace dependency (`"@hintoric/ui": "workspace:*"`).
- Produces: a running dev server at `http://localhost:5173` for manual visual QA against Joy UI's own docs (mui.com/joy-ui). Nothing later in this plan depends on this app — it is the terminal task of Phase 1.

- [ ] **Step 1: Create `apps/playground/package.json`**

```json
{
  "name": "playground",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@hintoric/ui": "workspace:*",
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  },
  "devDependencies": {
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.5",
    "@vitejs/plugin-react": "^6.1.1",
    "typescript": "^7.0.2",
    "vite": "^8.2.2"
  }
}
```

- [ ] **Step 2: Create `apps/playground/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `apps/playground/vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 4: Create `apps/playground/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>@hintoric/ui playground</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `apps/playground/src/main.tsx`**

```tsx
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('#root element not found');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 6: Create `apps/playground/src/App.tsx`**

```tsx
import * as React from 'react';
import {
  Box,
  Button,
  Card,
  ColorSchemeProvider,
  IconButton,
  Input,
  Sheet,
  Stack,
  Textarea,
  Typography,
  useColorScheme,
  type JoyColor,
  type JoyVariant,
} from '@hintoric/ui';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

function ColorSchemeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <Button
      variant="outlined"
      color="neutral"
      onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
    >
      Switch to {mode === 'light' ? 'dark' : 'light'} mode
    </Button>
  );
}

function ButtonShowcase() {
  return (
    <Stack spacing={2}>
      <Typography level="h3">Button</Typography>
      {VARIANTS.map((variant) => (
        <Stack key={variant} direction="row" spacing={1}>
          {COLORS.map((color) => (
            <Button key={color} variant={variant} color={color}>
              {variant} / {color}
            </Button>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}

function IconButtonShowcase() {
  return (
    <Stack spacing={2}>
      <Typography level="h3">IconButton</Typography>
      <Stack direction="row" spacing={1}>
        {VARIANTS.map((variant) => (
          <IconButton key={variant} variant={variant} color="primary" aria-label={variant}>
            +
          </IconButton>
        ))}
      </Stack>
    </Stack>
  );
}

function InputShowcase() {
  const [value, setValue] = React.useState('');
  return (
    <Stack spacing={2}>
      <Typography level="h3">Input &amp; Textarea</Typography>
      <Stack direction="row" spacing={1}>
        {VARIANTS.map((variant) => (
          <Input key={variant} variant={variant} placeholder={variant} />
        ))}
      </Stack>
      <Input
        aria-label="controlled"
        placeholder="controlled input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <Typography level="body-sm">Current value: {value || '(empty)'}</Typography>
      <Textarea placeholder="Textarea" />
    </Stack>
  );
}

function SheetAndCardShowcase() {
  return (
    <Stack spacing={2}>
      <Typography level="h3">Sheet &amp; Card</Typography>
      <Stack direction="row" spacing={1}>
        {VARIANTS.map((variant) => (
          <Sheet key={variant} variant={variant} color="neutral">
            <Box className="p-4">Sheet ({variant})</Box>
          </Sheet>
        ))}
      </Stack>
      <Card>
        <Typography level="title-md">Card title</Typography>
        <Typography level="body-sm">Card body text goes here.</Typography>
      </Card>
    </Stack>
  );
}

function TypographyShowcase() {
  const levels = [
    'h1', 'h2', 'h3', 'h4', 'title-lg', 'title-md', 'title-sm', 'body-lg', 'body-md', 'body-sm', 'body-xs',
  ] as const;
  return (
    <Stack spacing={1}>
      <Typography level="h3">Typography</Typography>
      {levels.map((level) => (
        <Typography key={level} level={level}>
          {level}: The quick brown fox jumps over the lazy dog.
        </Typography>
      ))}
    </Stack>
  );
}

export function App() {
  return (
    <ColorSchemeProvider>
      <Box className="bg-canvas min-h-screen p-8">
        <Stack spacing={4}>
          <Stack direction="row" spacing={2}>
            <Typography level="h1">@hintoric/ui playground</Typography>
            <ColorSchemeToggle />
          </Stack>
          <ButtonShowcase />
          <IconButtonShowcase />
          <InputShowcase />
          <SheetAndCardShowcase />
          <TypographyShowcase />
        </Stack>
      </Box>
    </ColorSchemeProvider>
  );
}
```

- [ ] **Step 7: Install dependencies**

Run: `pnpm install`
Expected: exits `0`; `apps/playground` is now linked to `packages/ui` via the pnpm workspace (`workspace:*`).

- [ ] **Step 8: Verify the playground type-checks and builds**

Run: `pnpm --filter playground build`
Expected: exits `0`; `apps/playground/dist/index.html` and a bundled JS file exist.

- [ ] **Step 9: Manually verify in a browser**

Run: `pnpm --filter playground dev`

Open `http://localhost:5173` and confirm, against Joy UI's own component docs at mui.com/joy-ui as a visual reference:
- All 4 variants × 5 colors render distinct, readable Button styles.
- The "Switch to dark mode" button flips every surface, text, and component color (via the `data-color-scheme` attribute), not just some of them.
- Typing into the controlled `Input` updates the "Current value" text live.
- The Typography showcase shows a clear size/weight hierarchy from `h1` down to `body-xs`.

- [ ] **Step 10: Commit**

```bash
git add apps/playground
git commit -m "feat: add playground app for manual visual QA of Phase 1 components"
```
