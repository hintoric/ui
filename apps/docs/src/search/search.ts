import type { DocsPage, SearchEntry } from './types.ts';

interface NavGroupLike {
  title: string;
  links: { to: string; label: string }[];
}

/**
 * Flattens the index into one line per page and one per section.
 *
 * The nav decides which pages exist and what they are called: a page nothing
 * links to cannot be reached from the sidebar either, and the sidebar's label
 * is the name people have already read.
 */
export function buildEntries(index: DocsPage[], nav: NavGroupLike[]): SearchEntry[] {
  const groups = new Map<string, { group: string; label: string }>();
  for (const group of nav) {
    for (const link of group.links) {
      groups.set(link.to, { group: group.title, label: link.label });
    }
  }

  const entries: SearchEntry[] = [];
  for (const page of index) {
    const listed = groups.get(page.path);
    if (!listed) continue;
    const title = listed.label || page.title;
    entries.push({ path: page.path, title, page: title, group: listed.group });
    for (const section of page.sections) {
      entries.push({ path: page.path, hash: section.id, title: section.title, page: title, group: listed.group });
    }
  }
  return entries;
}

/** Ranked matches. An empty query offers the pages, which is the sidebar in a list. */
export function search(entries: SearchEntry[], query: string): SearchEntry[] {
  const needle = query.trim().toLowerCase();
  if (needle === '') return entries.filter((entry) => entry.hash === undefined);

  const hits: { entry: SearchEntry; score: number }[] = [];
  for (const entry of entries) {
    const at = entry.title.toLowerCase().indexOf(needle);
    if (at === -1) continue;
    // A page outranks its own sections, and a title that begins with what was
    // typed outranks one that merely contains it. Ties keep index order, which
    // is the order of the sidebar.
    hits.push({ entry, score: (entry.hash === undefined ? 0 : 2) + (at === 0 ? 0 : 1) });
  }
  return hits.sort((a, b) => a.score - b.score).map((hit) => hit.entry);
}
