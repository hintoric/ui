import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Blurhash } from './Blurhash';

// The four-by-three example hash from the woltapp/blurhash README.
const HASH = 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';

describe('Blurhash', () => {
  it('decodes onto a canvas sized to the decode resolution', () => {
    render(<Blurhash hash={HASH} />);

    const canvas = screen.getByTestId('blurhash') as HTMLCanvasElement;
    expect(canvas.width).toBe(32);
    expect(canvas.height).toBe(32);
  });

  it('honours a smaller resolution', () => {
    render(<Blurhash hash={HASH} resolution={16} />);

    const canvas = screen.getByTestId('blurhash') as HTMLCanvasElement;
    expect(canvas.width).toBe(16);
  });

  it('renders nothing for a hash the backend got wrong', () => {
    // `decode` throws on a malformed hash. A placeholder is decoration; it
    // must never take the page down with it.
    render(<Blurhash hash="not-a-hash" />);

    expect(screen.queryByTestId('blurhash')).toBeNull();
  });

  it('is hidden from assistive technology', () => {
    render(<Blurhash hash={HASH} />);

    expect(screen.getByTestId('blurhash')).toHaveAttribute('aria-hidden', 'true');
  });
});
