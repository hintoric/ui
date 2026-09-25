import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReducedMotionProvider } from '../../theme/ReducedMotionProvider';
import { BlurhashImage } from './BlurhashImage';

const HASH = 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';

/** Makes the next rendered <img> look like one served from the browser cache. */
function withCachedImages(run: () => void): void {
  const complete = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'complete');
  const naturalWidth = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'naturalWidth');
  Object.defineProperty(HTMLImageElement.prototype, 'complete', { configurable: true, get: () => true });
  Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', { configurable: true, get: () => 800 });
  try {
    run();
  } finally {
    if (complete) Object.defineProperty(HTMLImageElement.prototype, 'complete', complete);
    if (naturalWidth) Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', naturalWidth);
  }
}

describe('BlurhashImage', () => {
  it('keeps the image transparent until it has loaded', () => {
    render(<BlurhashImage src="/hero.jpg" hash={HASH} alt="Hero" />);

    expect(screen.getByAltText('Hero')).toHaveClass('opacity-0');
  });

  it('reveals the image once it has loaded', () => {
    render(<BlurhashImage src="/hero.jpg" hash={HASH} alt="Hero" />);

    fireEvent.load(screen.getByAltText('Hero'));

    expect(screen.getByAltText('Hero')).toHaveClass('opacity-100');
  });

  it('uses the app-provided reduced motion preference for the fade transition', () => {
    render(
      <ReducedMotionProvider reducedMotion>
        <BlurhashImage src="/hero.jpg" hash={HASH} alt="Hero" />
      </ReducedMotionProvider>,
    );

    expect(screen.getByAltText('Hero')).not.toHaveClass('transition-opacity');
  });

  it('reveals an image that was already in the cache', () => {
    // A cached image finishes loading before React attaches onLoad, so the
    // event never fires and the picture would stay invisible for good.
    withCachedImages(() => {
      render(<BlurhashImage src="/hero.jpg" hash={HASH} alt="Hero" />);

      expect(screen.getByAltText('Hero')).toHaveClass('opacity-100');
    });
  });

  it('leaves the blurhash in place when the image fails', () => {
    render(<BlurhashImage src="/gone.jpg" hash={HASH} alt="Hero" />);

    fireEvent.error(screen.getByAltText('Hero'));

    expect(screen.getByTestId('blurhash')).toBeInTheDocument();
    expect(screen.getByAltText('Hero')).toHaveClass('opacity-0');
  });

  it('falls back to a skeleton when no hash is known', () => {
    render(<BlurhashImage src="/hero.jpg" alt="Hero" />);

    expect(screen.queryByTestId('blurhash')).toBeNull();
    expect(screen.getByTestId('blurhash-image')).toHaveTextContent('');
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('stops the skeleton pulsing once the image is there', () => {
    render(<BlurhashImage src="/hero.jpg" alt="Hero" />);

    fireEvent.load(screen.getByAltText('Hero'));

    expect(document.querySelector('.animate-pulse')).toBeNull();
  });

  it('renders no image at all until the src is known', () => {
    // A src of "" resolves to the page itself and fires an error, which would
    // show the error state before anything has even been requested.
    render(<BlurhashImage hash={HASH} alt="Hero" />);

    expect(screen.queryByAltText('Hero')).toBeNull();
    expect(screen.getByTestId('blurhash')).toBeInTheDocument();
  });

  it('still shows a skeleton when the hash is malformed', () => {
    // A truncated hash is a non-empty string, so branching on the prop alone
    // would skip the skeleton and leave the box with no loading affordance.
    render(<BlurhashImage src="/hero.jpg" hash="LEHV6n" alt="Hero" />);

    expect(screen.queryByTestId('blurhash')).toBeNull();
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('passes image props to the image, not to the frame', () => {
    // The props type is the props of <img>; spreading them onto the wrapper
    // would make loading="lazy" and srcSet silently do nothing.
    render(
      <BlurhashImage src="/hero.jpg" hash={HASH} alt="Hero" loading="lazy" sizes="50vw" />,
    );

    const image = screen.getByAltText('Hero');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('sizes', '50vw');
    expect(screen.getByTestId('blurhash-image')).not.toHaveAttribute('loading');
  });

  it('applies the requested aspect ratio', () => {
    render(<BlurhashImage src="/hero.jpg" hash={HASH} alt="Hero" ratio="4 / 3" />);

    expect(screen.getByTestId('blurhash-image')).toHaveStyle({ aspectRatio: '4 / 3' });
  });

  it('forwards onLoad and onError', () => {
    const onLoad = vi.fn();
    const onError = vi.fn();
    render(<BlurhashImage src="/hero.jpg" hash={HASH} alt="Hero" onLoad={onLoad} onError={onError} />);

    fireEvent.load(screen.getByAltText('Hero'));
    fireEvent.error(screen.getByAltText('Hero'));

    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
