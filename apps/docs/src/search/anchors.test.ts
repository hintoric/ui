import { describe, expect, it, vi } from 'vitest';
import { applyHeadingIds, scrollToAnchor } from './anchors.ts';

function content(html: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  return root;
}

describe('applyHeadingIds', () => {
  it('gives every h2 and h3 the id its text slugifies to', () => {
    const root = content('<h2>Basic usage</h2><h3>Sizes</h3>');
    applyHeadingIds(root);
    expect(root.querySelector('h2')?.id).toBe('basic-usage');
    expect(root.querySelector('h3')?.id).toBe('sizes');
  });

  it('leaves an id the page declared itself alone', () => {
    const root = content('<h2 id="migration">Moving from the old provider</h2>');
    applyHeadingIds(root);
    expect(root.querySelector('h2')?.id).toBe('migration');
  });

  it('leaves the h1 alone — the page is reached by its path, not an anchor', () => {
    const root = content('<h1>Button</h1>');
    applyHeadingIds(root);
    expect(root.querySelector('h1')?.id).toBe('');
  });
});

describe('scrollToAnchor', () => {
  it('scrolls the heading the hash names into view', () => {
    const root = content('<h2 id="sizes">Sizes</h2>');
    document.body.append(root);
    const heading = root.querySelector('h2') as HTMLElement;
    heading.scrollIntoView = vi.fn();

    scrollToAnchor('#sizes');

    expect(heading.scrollIntoView).toHaveBeenCalled();
    root.remove();
  });

  it('does nothing for a hash that names no heading', () => {
    expect(() => scrollToAnchor('#nowhere')).not.toThrow();
  });

  it('does nothing without a hash', () => {
    expect(() => scrollToAnchor('')).not.toThrow();
  });
});
