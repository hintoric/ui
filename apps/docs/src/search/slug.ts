/**
 * The id a heading carries in the DOM, derived from its text.
 *
 * Both sides need the same answer: the build-time index writes it into the
 * search entry, and the runtime writes it onto the heading. One function, so
 * they cannot drift and leave a link pointing at nothing.
 */
export function slug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
