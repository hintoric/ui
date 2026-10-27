/*
 * Reads theme.css's two token blocks — Tailwind's `@theme { }` (light, compiles
 * to :root) and `[data-color-scheme="dark"] { }` — as plain name → value maps,
 * so jsdom tests can check the tokens without a browser.
 */

function block(css: string, opener: string): Record<string, string> {
  const start = css.indexOf(opener);
  if (start === -1) throw new Error(`theme.css has no "${opener}" block`);
  let depth = 0;
  let end = start + opener.length;
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) {
      end = i;
      break;
    }
  }
  const body = css.slice(css.indexOf('{', start) + 1, end);
  const tokens: Record<string, string> = {};
  for (const decl of body.split(';')) {
    const colon = decl.indexOf(':');
    const name = decl.slice(0, colon).trim();
    if (colon === -1 || !name.startsWith('--')) continue;
    tokens[name] = decl.slice(colon + 1).trim().replace(/\s+/g, ' ');
  }
  return tokens;
}

export function parseThemeCss(css: string): { light: Record<string, string>; dark: Record<string, string> } {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return { light: block(stripped, '@theme {'), dark: block(stripped, '[data-color-scheme="dark"] {') };
}

/** Follows `var(--x)` chains; hex results come back uppercase. */
export function resolveToken(tokens: Record<string, string>, name: string): string {
  const seen = new Set<string>();
  const resolve = (value: string): string =>
    value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/g, (_, ref: string, fallback?: string) => {
      if (seen.has(ref)) throw new Error(`Cycle at ${ref}`);
      if (ref in tokens) {
        seen.add(ref);
        const out = resolve(tokens[ref]);
        seen.delete(ref);
        return out;
      }
      if (fallback !== undefined) return resolve(fallback.trim());
      throw new Error(`Unresolved ${ref} (from ${name})`);
    });
  if (!(name in tokens)) throw new Error(`No token ${name}`);
  const value = resolve(tokens[name]);
  return /^#[0-9a-f]{3,8}$/i.test(value) ? value.toUpperCase() : value;
}
