import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import { extractRoutes } from './src/search/routes.ts';
import { extractHeadings } from './src/search/headings.ts';
import type { DocsPage } from './src/search/types.ts';

const MODULE = 'virtual:docs-index';
const RESOLVED = '\0' + MODULE;

/**
 * Builds the search index at build time, out of the router and the pages.
 *
 * Reading the pages in the browser instead would mean shipping every page's
 * source in the bundle just to find its headings — the index is a few
 * kilobytes, the sources are hundreds. Nothing here is maintained by hand, so
 * a new page is searchable the moment it has a route.
 */
export function docsIndex(): Plugin {
  const root = resolve(import.meta.dirname, 'src');

  async function build(): Promise<DocsPage[]> {
    const app = await readFile(resolve(root, 'App.tsx'), 'utf8');
    const pages = await Promise.all(
      extractRoutes(app).map(async ({ path, module }) => {
        const source = await readFile(resolve(root, 'pages', `${module}.tsx`), 'utf8');
        const { title, sections } = extractHeadings(source);
        return { path, title: title ?? module, sections };
      }),
    );
    return pages;
  }

  return {
    name: 'docs-index',
    resolveId(id) {
      return id === MODULE ? RESOLVED : undefined;
    },
    async load(id) {
      if (id !== RESOLVED) return undefined;
      return `export const docsIndex = ${JSON.stringify(await build())};`;
    },
    handleHotUpdate({ file, server }) {
      // A heading edited in a page has to reach the palette without a restart.
      if (!file.endsWith('.tsx')) return;
      const module = server.moduleGraph.getModuleById(RESOLVED);
      if (module) server.moduleGraph.invalidateModule(module);
    },
  };
}
