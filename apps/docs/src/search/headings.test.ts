import { describe, expect, it } from 'vitest';
import { extractHeadings } from './headings.ts';

const PAGE = `
import { FloatingBar } from '@hintoric/ui';

export function FloatingBarPage() {
  return (
    <>
      <h1>FloatingBar</h1>
      <p className="docs-lede">A pill of actions.</p>
      <h2>Basic usage</h2>
      <h2>Variants &amp; colors</h2>
      <h3>FloatingBarButton</h3>
      <h2 id="migration">Moving it from a stylesheet</h2>
    </>
  );
}
`;

describe('extractHeadings', () => {
  it('reads the page title from the h1', () => {
    expect(extractHeadings(PAGE).title).toBe('FloatingBar');
  });

  it('lists h2 and h3 as sections, in document order', () => {
    expect(extractHeadings(PAGE).sections.map((section) => section.title)).toEqual([
      'Basic usage',
      'Variants & colors',
      'FloatingBarButton',
      'Moving it from a stylesheet',
    ]);
  });

  it('gives every section the id its heading will carry in the DOM', () => {
    const [basic] = extractHeadings(PAGE).sections;
    expect(basic.id).toBe('basic-usage');
  });

  it('keeps an id a heading already declares, so existing anchors survive', () => {
    // ColorSchemeProviderPage links to #migration from its own prose.
    const sections = extractHeadings(PAGE).sections;
    expect(sections.at(-1)?.id).toBe('migration');
  });

  it('reads through the markup and expressions a heading may contain', () => {
    const source = `<h2>Working with <code>sx</code>{' '}and friends</h2>`;
    expect(extractHeadings(source).sections[0]?.title).toBe('Working with sx and friends');
  });

  it('has no title and no sections for a page that declares none', () => {
    expect(extractHeadings('export const X = 1;')).toEqual({ title: undefined, sections: [] });
  });
});
