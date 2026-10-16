import { describe, expect, it } from 'vitest';
import { componentName, toNestedSvg } from './svg.ts';

const opts = { idPrefix: 'hi-x-light-', className: 'hi-icon-light' };

describe('toNestedSvg', () => {
  it('keeps the viewBox and paint attributes, drops size, namespaces and metadata', () => {
    const { viewBox, markup } = toNestedSvg(
      `<?xml version="1.0"?>
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="2048" height="2048" viewBox="0 0 2048 2048" fill="none">
        <metadata><c2pa:manifest>…</c2pa:manifest></metadata>
        <!-- recraft -->
        <path fill="#5B5BD6" d="M0 0h10v10z"/>
      </svg>`,
      opts,
    );
    expect(viewBox).toBe('0 0 2048 2048');
    expect(markup).toBe(
      '<svg class="hi-icon-light" viewBox="0 0 2048 2048" width="100%" height="100%" fill="none"><path fill="#5B5BD6" d="M0 0h10v10z"/></svg>',
    );
  });

  it("drops the root's inline style, which would override the variant switch", () => {
    const { markup } = toNestedSvg('<svg style="display: block;" viewBox="0 0 1 1"><path d="M0 0"/></svg>', opts);
    expect(markup).not.toContain('style=');
  });

  it('derives the viewBox from width and height when there is none', () => {
    expect(toNestedSvg('<svg width="96" height="96px"><path d="M0 0"/></svg>', opts).viewBox).toBe('0 0 96 96');
  });

  it('prefixes ids and every reference to them', () => {
    const { markup } = toNestedSvg(
      '<svg viewBox="0 0 1 1"><defs><linearGradient id="g"/><clipPath id="c"/></defs><rect fill="url(#g)" clip-path="url( #c )"/><use href="#c"/><use xlink:href="#g"/></svg>',
      opts,
    );
    expect(markup).toContain('id="hi-x-light-g"');
    expect(markup).toContain('fill="url(#hi-x-light-g)"');
    expect(markup).toContain('clip-path="url(#hi-x-light-c)"');
    expect(markup).toContain('<use href="#hi-x-light-c"/>');
    expect(markup).toContain('<use xlink:href="#hi-x-light-g"/>');
  });

  it.each([
    ['<svg viewBox="0 0 1 1"><script>alert(1)</script></svg>', '<script>'],
    ['<svg viewBox="0 0 1 1" onload="alert(1)"></svg>', 'event handler'],
    ['<svg viewBox="0 0 1 1"><a href="javascript:alert(1)"/></svg>', 'javascript:'],
    ['<svg viewBox="0 0 1 1"><image href="https://x.test/a.png"/></svg>', '<image>'],
    ['<svg viewBox="0 0 1 1"><rect fill="url(https://x.test/a)"/></svg>', 'url()'],
    ['<svg viewBox="0 0 1 1"><foreignObject/></svg>', '<foreignObject>'],
  ])('refuses %s', (source, what) => {
    expect(() => toNestedSvg(source, opts)).toThrow(what);
  });

  it('refuses a file that is not an svg or has no size', () => {
    expect(() => toNestedSvg('<html></html>', opts)).toThrow('not an <svg>');
    expect(() => toNestedSvg('<svg><path/></svg>', opts)).toThrow('viewBox');
  });
});

describe('componentName', () => {
  it('turns a slug into a PascalCase component name', () => {
    expect(componentName('empty-documents-upload')).toBe('EmptyDocumentsUploadIcon');
    expect(componentName('404-not-found')).toBe('Icon404NotFound');
  });
});
