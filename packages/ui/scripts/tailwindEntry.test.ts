import { existsSync, globSync, readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { compile } from '@tailwindcss/node';
import { Scanner } from '@tailwindcss/oxide';
import ts from '@typescript/typescript6';
import { describe, expect, it } from 'vitest';
import pkg from '../package.json' with { type: 'json' };
import { tailwindEntry } from './tailwindEntry';

const root = resolve(import.meta.dirname, '..');
const distEntry = resolve(root, 'dist/tailwind.css');

describe('tailwindEntry()', () => {
  const css = tailwindEntry();

  it('carries the tokens, including the dark block', () => {
    expect(css).toMatch(/^@theme \{/m);
    expect(css).toContain('--color-primary-500: #0B6BCB;');
    expect(css).toContain('--color-surface-1: var(--color-neutral-100);');
    expect(css).toMatch(/^\[data-color-scheme="dark"\] \{/m);
    expect(css).toContain('--color-surface-1: var(--color-neutral-800);');
  });

  it('carries the dark variant and the forced page-layout utilities', () => {
    expect(css).toContain('@custom-variant dark (&:where([data-color-scheme="dark"], [data-color-scheme="dark"] *));');
    expect(css).toContain('@source inline("{bg,border}-divider");');
  });

  it('is self-contained: no imports, and it scans the published bundle', () => {
    expect(css).not.toMatch(/^@import/m);
    expect(css).toMatch(/^@source "\.\/index\.js";$/m);
  });
});

// Needs `pnpm build` first. CI's `pnpm typecheck` builds before `pnpm test`.
describe('dist/tailwind.css', () => {
  it('is exported and is what the build emitted', () => {
    expect(pkg.exports['./tailwind.css']).toBe('./dist/tailwind.css');
    expect(existsSync(distEntry), 'dist/tailwind.css is missing — run `pnpm build` first').toBe(true);
    expect(readFileSync(distEntry, 'utf8')).toBe(tailwindEntry());
  });

  /** A consumer's build: `@import "tailwindcss"; @import "@hintoric/ui/tailwind.css";`. */
  async function consumerBuild() {
    const compiler = await compile('@import "tailwindcss";\n@import "./dist/tailwind.css";\n', {
      base: root,
      onDependency: () => {},
    });
    const scanned = new Scanner({ sources: compiler.sources }).scan();
    return { compiler, scanned };
  }

  it('gives a consumer responsive and dark utilities on the library tokens', async () => {
    const { compiler, scanned } = await consumerBuild();
    const css = compiler.build([...scanned, 'md:flex-row', 'md:bg-primary-soft-bg', 'dark:bg-surface-1', 'line-clamp-2']);
    expect(css).toMatch(/@media \(width >= 48rem\) \{[^@]*?\.md\\:bg-primary-soft-bg \{\s*background-color: var\(--color-primary-soft-bg\);/);
    expect(css).toContain(
      '.dark\\:bg-surface-1:where([data-color-scheme="dark"], [data-color-scheme="dark"] *) {\n    background-color: var(--color-surface-1);',
    );
    expect(css).toContain('--color-primary-soft-bg: var(--color-primary-100);');
  });

  // Scanning a bundle is not scanning source: the bundler re-quotes strings,
  // and a class whose source spelling needs escaping in the bundle — Divider's
  // `before:content-[""]` became `before:content-[\"\"]` — is no longer found
  // by its real name, so the consumer's build silently drops it. Every utility
  // the components use must survive the round trip.
  it('generates every utility the component sources use', async () => {
    const { compiler, scanned } = await consumerBuild();
    const fromSource = new Set<string>();
    const files = globSync('src/**/*.{ts,tsx}', {
      cwd: root,
      exclude: (f) => /(^|\/)(visual|test)(\/|$)|\.test\.|\.d\.ts$/.test(f),
    });
    expect(files.length).toBeGreaterThan(50);
    const scanner = new Scanner({ sources: [] });
    for (const file of files) {
      // Comments mention utilities that aren't used ("`font-[inherit]` was
      // tried first…") and aren't in the bundle either.
      const code = ts.transpileModule(readFileSync(resolve(root, file), 'utf8'), {
        compilerOptions: { removeComments: true, jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ESNext },
        fileName: file,
      }).outputText;
      for (const c of scanner.scanFiles([{ content: code, extension: extname(file).slice(1) }])) fromSource.add(c);
    }
    const inBundle = new Set(scanned);

    // `build` is cumulative, so a candidate is a real utility exactly when
    // adding it changes the output.
    let css = compiler.build(scanned);
    const lost: string[] = [];
    for (const candidate of fromSource) {
      if (inBundle.has(candidate)) continue;
      const next = compiler.build([candidate]);
      if (next !== css) lost.push(candidate);
      css = next;
    }
    expect(lost).toEqual([]);
    // Transpiling ~250 files and rebuilding once per unmatched candidate takes
    // ~2s alone and far longer next to the rest of the suite.
  }, 30_000);
});
