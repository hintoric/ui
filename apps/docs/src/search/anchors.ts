import { slug } from './slug.ts';

/**
 * Gives the headings the ids the search index already assumes they have.
 *
 * The pages are TSX and write no ids, and adding one by hand to every heading
 * on seventy pages would be a list to keep in step with the index. Doing it
 * here means the id is derived the same way on both sides, by the same
 * function, and a new page needs nothing at all.
 *
 * Two headings with the same text on one page would collide — the index has
 * the same blind spot, so both sides agree and the first one wins.
 */
export function applyHeadingIds(root: HTMLElement): void {
  for (const heading of root.querySelectorAll<HTMLElement>('h2, h3')) {
    if (heading.id) continue;
    const id = slug(heading.textContent ?? '');
    if (id) heading.id = id;
  }
}

/** Jumps to the heading a hash names, once that heading exists. */
export function scrollToAnchor(hash: string): void {
  if (!hash) return;
  const target = document.getElementById(hash.replace(/^#/, ''));
  target?.scrollIntoView({ block: 'start' });
}
