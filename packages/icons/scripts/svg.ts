/**
 * Turns one of the CDN's icon files (Recraft output, see the recraft-icons
 * skill) into the markup an icon component inlines: a nested <svg> that keeps
 * its own viewBox and fills whatever box the component's outer <svg> has.
 *
 * The files come from a Drive anyone in the company can write to and end up
 * as innerHTML in every app that renders the icon, so anything that could run
 * code or load something is refused rather than stripped — a broken build is
 * the right outcome for such a file, not a quietly different icon.
 */

const FORBIDDEN: [RegExp, string][] = [
  [/<script\b/i, '<script>'],
  [/<foreignObject\b/i, '<foreignObject>'],
  [/<image\b/i, '<image>'],
  [/\son[a-z]+\s*=/i, 'an event handler attribute'],
  [/javascript:/i, 'a javascript: URL'],
  [/\bhref\s*=\s*["'](?!\s*#)/i, 'a non-fragment href'],
  [/url\((?!\s*["']?\s*#)/i, 'a non-fragment url()'],
  [/@import\b/i, '@import'],
];

// Attributes of the source root that say nothing about how it paints: the
// component sets size and class itself, and namespaces are implied inline.
// `style` too: Recraft writes `display: block` there, which as an inline style
// would beat the stylesheet that hides the inactive variant.
const DROPPED_ROOT_ATTRS = new Set(['xmlns', 'version', 'width', 'height', 'id', 'class', 'style', 'x', 'y', 'viewbox']);

export interface NestedSvg {
  viewBox: string;
  markup: string;
}

export function toNestedSvg(source: string, opts: { idPrefix: string; className: string }): NestedSvg {
  const cleaned = source
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<metadata\b[\s\S]*?<\/metadata>/gi, '')
    .replace(/<(title|desc)\b[\s\S]*?<\/\1>/gi, '')
    .trim();

  const open = /^<svg\b([^>]*)>/i.exec(cleaned);
  const close = cleaned.lastIndexOf('</svg>');
  if (!open || close === -1) throw new Error('not an <svg> document');

  for (const [pattern, what] of FORBIDDEN) {
    if (pattern.test(cleaned)) throw new Error(`contains ${what}`);
  }

  const attrs = parseAttrs(open[1]);
  const viewBox = attrs.get('viewbox') ?? viewBoxFromSize(attrs);
  if (!viewBox) throw new Error('has neither a viewBox nor a numeric width and height');

  const kept = [...attrs]
    .filter(([name]) => !DROPPED_ROOT_ATTRS.has(name) && !name.startsWith('xmlns:'))
    .map(([name, value]) => ` ${attrs.originalName(name)}="${value}"`)
    .join('');

  const inner = prefixIds(cleaned.slice(open[0].length, close).trim(), opts.idPrefix)
    .replace(/>\s+</g, '><');

  return {
    viewBox,
    markup: `<svg class="${opts.className}" viewBox="${viewBox}" width="100%" height="100%"${kept}>${inner}</svg>`,
  };
}

// The light and dark variant of an icon share their ids, and so would two
// different icons on one page; a gradient or clip path would then resolve to
// whichever came first in the document.
function prefixIds(markup: string, prefix: string): string {
  const ids = new Set([...markup.matchAll(/\bid\s*=\s*"([^"]+)"/g)].map((m) => m[1]));
  if (ids.size === 0) return markup;
  const p = (id: string) => (ids.has(id) ? prefix + id : id);
  return markup
    .replace(/\bid\s*=\s*"([^"]+)"/g, (_, id: string) => `id="${p(id)}"`)
    .replace(/url\(\s*#([^)\s]+)\s*\)/g, (_, id: string) => `url(#${p(id)})`)
    .replace(/((?:xlink:)?href)\s*=\s*"#([^"]+)"/g, (_, attr: string, id: string) => `${attr}="#${p(id)}"`);
}

function parseAttrs(source: string) {
  const values = new Map<string, string>();
  const names = new Map<string, string>();
  for (const m of source.matchAll(/([^\s=]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    const lower = m[1].toLowerCase();
    names.set(lower, m[1]);
    values.set(lower, (m[2] ?? m[3]).replace(/"/g, '&quot;'));
  }
  return Object.assign(values, { originalName: (lower: string) => names.get(lower) ?? lower });
}

function viewBoxFromSize(attrs: Map<string, string>): string | undefined {
  const w = Number.parseFloat(attrs.get('width') ?? '');
  const h = Number.parseFloat(attrs.get('height') ?? '');
  return Number.isFinite(w) && Number.isFinite(h) ? `0 0 ${w} ${h}` : undefined;
}

/**
 * The component's own viewBox: the same size as the icon's, but at the origin.
 * The nested <svg> sits at x=0, y=0 of it and maps its own viewBox from there,
 * so an outer viewBox that kept the icon's origin (say `62 119 774 774`) would
 * shift the drawing up and left by that much and cut it off.
 */
export function outerViewBox(viewBox: string): string {
  const [, , width, height] = viewBox.trim().split(/[\s,]+/);
  return `0 0 ${width} ${height}`;
}

/** `empty-documents-upload` → `EmptyDocumentsUploadIcon`. */
export function componentName(slug: string): string {
  const pascal = slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return /^[0-9]/.test(pascal) ? `Icon${pascal}` : `${pascal}Icon`;
}

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
