import { describe, expect, it } from 'vitest';
import { buildEntries, search } from './search.ts';
import type { DocsPage } from './types.ts';

const INDEX: DocsPage[] = [
  { path: '/floating-bar', title: 'FloatingBar', sections: [{ id: 'placement', title: 'Placement' }] },
  { path: '/button', title: 'Button', sections: [{ id: 'sizes', title: 'Sizes' }] },
];

const NAV = [
  { title: 'Layout', links: [{ to: '/floating-bar', label: 'FloatingBar' }] },
  { title: 'Inputs', links: [{ to: '/button', label: 'Button' }] },
];

describe('buildEntries', () => {
  it('makes one entry for every page and one for every section', () => {
    expect(buildEntries(INDEX, NAV)).toHaveLength(4);
  });

  it('carries the group a page sits in, so a hit says where it lives', () => {
    const entries = buildEntries(INDEX, NAV);
    expect(entries.find((entry) => entry.title === 'Placement')?.group).toBe('Layout');
  });

  it('points a section entry at its anchor', () => {
    const placement = buildEntries(INDEX, NAV).find((entry) => entry.title === 'Placement');
    expect(placement).toMatchObject({ path: '/floating-bar', hash: 'placement', page: 'FloatingBar' });
  });

  it('leaves out a page the nav does not list, because nothing links to it', () => {
    const orphan: DocsPage[] = [{ path: '/scratch', title: 'Scratch', sections: [] }];
    expect(buildEntries(orphan, NAV)).toEqual([]);
  });
});

describe('search', () => {
  const entries = buildEntries(INDEX, NAV);

  it('offers the pages themselves when nothing has been typed', () => {
    expect(search(entries, '').map((entry) => entry.title)).toEqual(['FloatingBar', 'Button']);
  });

  it('ignores case and matches anywhere in the title', () => {
    expect(search(entries, 'oatingb').map((entry) => entry.title)).toContain('FloatingBar');
  });

  it('finds a section by its own name', () => {
    expect(search(entries, 'placement')[0]).toMatchObject({ title: 'Placement', hash: 'placement' });
  });

  it('puts a page above one of its sections when both match', () => {
    const hits = search(entries, 'b');
    expect(hits[0]?.title).toBe('Button');
  });

  it('prefers a title that begins with the query over one that merely contains it', () => {
    const hits = search(entries, 'bar');
    expect(hits.map((entry) => entry.title)).toEqual(['FloatingBar']);
  });

  it('finds nothing for a query no title carries', () => {
    expect(search(entries, 'quantum')).toEqual([]);
  });
});
