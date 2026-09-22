const IMPORT = /import\s*\{\s*(\w+)[^}]*\}\s*from\s*'\.\/pages\/([\w.\-/]+)'/g;
const ROUTE = /<Route\s+path="([^"]+)"\s+element=\{<(\w+)\s*\/>\}/g;

export interface DocsRoute {
  path: string;
  /** The file under `src/pages`, without extension. */
  module: string;
}

/**
 * Reads the route table out of App.tsx.
 *
 * The router is the only place that knows which URL shows which page, and
 * asking it beats a second list that would go stale the first time somebody
 * adds a page and forgets. A route whose element is not an imported page is
 * skipped rather than guessed at.
 */
export function extractRoutes(source: string): DocsRoute[] {
  const modules = new Map<string, string>();
  for (const [, name, file] of source.matchAll(IMPORT)) {
    modules.set(name, file);
  }

  const routes: DocsRoute[] = [];
  for (const [, path, component] of source.matchAll(ROUTE)) {
    const module = modules.get(component);
    if (module) routes.push({ path, module });
  }
  return routes;
}
