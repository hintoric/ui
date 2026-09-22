import { slug } from './slug.ts';
import type { DocsSection } from './types.ts';

const HEADING = /<h([123])([^>]*)>([\s\S]*?)<\/h\1>/g;
const ID = /\bid="([^"]+)"/;

// Only the ones the pages actually use. An unknown entity is left as written,
// which is visible in the palette and therefore gets noticed.
const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  ndash: '–',
  mdash: '—',
  hellip: '…',
};

/** What a heading reads as once the JSX around the words is gone. */
function readable(inner: string): string {
  return inner
    .replace(/\{[^{}]*\}/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&(\w+);/g, (whole, name: string) => ENTITIES[name] ?? whole)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Reads a page's title and sections out of its source.
 *
 * The pages are TSX, not Markdown, so there is no document to walk — but their
 * headings are plain literal elements, and a page that ever stops being one is
 * a page whose sections simply go missing from the palette rather than a build
 * that breaks.
 */
export function extractHeadings(source: string): { title: string | undefined; sections: DocsSection[] } {
  let title: string | undefined;
  const sections: DocsSection[] = [];

  for (const [, level, attributes, inner] of source.matchAll(HEADING)) {
    const text = readable(inner);
    if (text === '') continue;
    if (level === '1') {
      title ??= text;
      continue;
    }
    // A heading that already declares an id keeps it: the prose links to it.
    sections.push({ id: ID.exec(attributes)?.[1] ?? slug(text), title: text });
  }

  return { title, sections };
}
