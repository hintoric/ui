import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { createIcon } from './createIcon';

const Both = createIcon({
  slug: 'demo',
  name: 'DemoIcon',
  viewBox: '0 0 10 10',
  light: '<svg class="hi-icon-light" viewBox="0 0 10 10" width="100%" height="100%"><path fill="#111"/></svg>',
  dark: '<svg class="hi-icon-dark" viewBox="0 0 10 10" width="100%" height="100%"><path fill="#eee"/></svg>',
  cdn: { light: 'https://cdn.test/light.svg', dark: 'https://cdn.test/dark.svg' },
});

const LightOnly = createIcon({
  slug: 'solo',
  name: 'SoloIcon',
  viewBox: '0 0 10 10',
  light: '<svg class="hi-icon-light" viewBox="0 0 10 10" width="100%" height="100%"><path/></svg>',
  dark: null,
  cdn: { light: 'https://cdn.test/solo.svg', dark: null },
});

const svg = (container: HTMLElement) => container.querySelector('svg[data-icon]')!;

describe('createIcon', () => {
  it('renders both variants under auto and hoists the switch stylesheet once', () => {
    const { container } = render(
      <>
        <Both />
        <Both />
      </>,
    );
    expect(svg(container)).toHaveClass('hi-icon-auto');
    expect(svg(container).querySelectorAll(':scope > svg')).toHaveLength(2);
    expect(document.head.querySelectorAll('style[data-href="hintoric-icons"]')).toHaveLength(1);
  });

  it('pins one variant, and keeps a pinned dark variant out of the auto stylesheet', () => {
    const light = render(<Both mode="light" />);
    expect(svg(light.container).innerHTML).toContain('#111');
    expect(svg(light.container).innerHTML).not.toContain('#eee');
    light.unmount();

    const dark = render(<Both mode="dark" />);
    expect(svg(dark.container)).not.toHaveClass('hi-icon-auto');
    expect(svg(dark.container).innerHTML).toContain('#eee');
    expect(svg(dark.container).innerHTML).not.toContain('hi-icon-dark');
  });

  it('falls back to the light variant when there is no dark one', () => {
    const { container } = render(<LightOnly mode="dark" />);
    expect(svg(container).querySelectorAll(':scope > svg')).toHaveLength(1);
    expect(svg(container)).not.toHaveClass('hi-icon-auto');
  });

  it('is decorative by default and named with title', () => {
    const decorative = render(<Both />);
    expect(svg(decorative.container)).toHaveAttribute('aria-hidden', 'true');
    decorative.unmount();

    const named = render(<Both title="Upload" />);
    expect(svg(named.container)).toHaveAttribute('role', 'img');
    expect(svg(named.container)).toHaveAttribute('aria-label', 'Upload');
  });

  it('sizes with size and passes className and other props through', () => {
    const { container } = render(<Both size={96} className="size-40" data-testid="x" />);
    expect(svg(container)).toHaveAttribute('width', '96');
    expect(svg(container)).toHaveClass('hi-icon-auto', 'size-40');
    expect(svg(container)).toHaveAttribute('data-testid', 'x');
  });

  it('carries its slug, name and CDN URLs', () => {
    expect(Both.displayName).toBe('DemoIcon');
    expect(Both.slug).toBe('demo');
    expect(Both.cdn.dark).toBe('https://cdn.test/dark.svg');
  });
});
