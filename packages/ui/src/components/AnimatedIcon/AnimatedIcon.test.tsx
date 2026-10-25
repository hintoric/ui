import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { AnimatedIcon } from './AnimatedIcon';
import { ReducedMotionProvider } from '../../theme/ReducedMotionProvider';
import { matchMediaState } from '../../test/setup';

const lottie = vi.hoisted(() => ({
  destroy: vi.fn(),
  loadAnimation: vi.fn(),
}));

vi.mock('lottie-web/build/player/lottie_light', () => ({
  default: { loadAnimation: lottie.loadAnimation },
}));

const ANIMATION = {
  slots: { sticker: { p: { a: 0, k: [1, 1, 1, 1] } } },
  layers: [{ shapes: [{ ty: 'fl', c: { a: 0, k: [1, 1, 1, 1], sid: 'sticker' } }] }],
};
const DARK_SLOTS = { sticker: [0.1, 0.1, 0.1, 1] };
const BASE = 'https://cdn.hintoric.com/assets/icons/form-reading-lens';

function respond(url: string): Response {
  if (url.endsWith('dark-slots.json')) return Response.json(DARK_SLOTS);
  if (url.endsWith('.json')) return Response.json(ANIMATION);
  return new Response(null, { status: 404 });
}

function lastAnimationData() {
  return lottie.loadAnimation.mock.lastCall![0].animationData as typeof ANIMATION;
}

beforeEach(() => {
  lottie.loadAnimation.mockReset().mockReturnValue({ destroy: lottie.destroy });
  lottie.destroy.mockReset();
  vi.stubGlobal('fetch', vi.fn(async (url: string) => respond(url)));
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-color-scheme');
});

describe('AnimatedIcon', () => {
  it('plays the CDN animation with the SVG renderer, looping, in the light scheme', async () => {
    render(<AnimatedIcon name="form-reading-lens" data-testid="icon" />);
    await waitFor(() => expect(lottie.loadAnimation).toHaveBeenCalledTimes(1));

    const options = lottie.loadAnimation.mock.lastCall![0];
    expect(options).toMatchObject({ renderer: 'svg', loop: true, autoplay: true });
    expect(options.container).toBe(screen.getByTestId('icon').querySelector('[data-animated-icon-player]'));
    expect(lastAnimationData().slots.sticker.p.k).toEqual([1, 1, 1, 1]);
    expect(fetch).toHaveBeenCalledWith(`${BASE}/form-reading-lens.json`);
    expect(fetch).not.toHaveBeenCalledWith(`${BASE}/dark-slots.json`);
  });

  it('overrides the slots with the dark colours before loading under a dark document', async () => {
    document.documentElement.setAttribute('data-color-scheme', 'dark');
    render(<AnimatedIcon name="form-reading-lens" />);
    await waitFor(() => expect(lottie.loadAnimation).toHaveBeenCalledTimes(1));

    expect(lastAnimationData().slots.sticker.p.k).toEqual(DARK_SLOTS.sticker);
    expect(lastAnimationData().layers[0].shapes[0].c.k).toEqual(DARK_SLOTS.sticker);
  });

  it('reloads with the other colours when <html> switches scheme at runtime', async () => {
    render(<AnimatedIcon name="form-reading-lens" data-testid="icon" />);
    await waitFor(() => expect(lottie.loadAnimation).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('icon')).toHaveAttribute('data-scheme', 'light');

    await act(async () => document.documentElement.setAttribute('data-color-scheme', 'dark'));
    await waitFor(() => expect(lottie.loadAnimation).toHaveBeenCalledTimes(2));

    expect(lottie.destroy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('icon')).toHaveAttribute('data-scheme', 'dark');
    expect(lastAnimationData().slots.sticker.p.k).toEqual(DARK_SLOTS.sticker);
  });

  it('pins a scheme with mode, whatever <html> says', async () => {
    document.documentElement.setAttribute('data-color-scheme', 'dark');
    render(<AnimatedIcon name="form-reading-lens" mode="light" data-testid="icon" />);
    await waitFor(() => expect(lottie.loadAnimation).toHaveBeenCalledTimes(1));
    expect(lastAnimationData().slots.sticker.p.k).toEqual([1, 1, 1, 1]);
  });

  it('shows the still image and no player under reduced motion', async () => {
    document.documentElement.setAttribute('data-color-scheme', 'dark');
    render(
      <ReducedMotionProvider reducedMotion>
        <AnimatedIcon name="form-reading-lens" data-testid="icon" />
      </ReducedMotionProvider>,
    );
    const img = screen.getByTestId('icon').querySelector('img')!;
    expect(img).toHaveAttribute('src', `${BASE}/dark.svg`);
    expect(img).toHaveAttribute('alt', '');
    expect(screen.getByTestId('icon').querySelector('[data-animated-icon-player]')).toBeNull();

    await act(async () => document.documentElement.setAttribute('data-color-scheme', 'light'));
    expect(img).toHaveAttribute('src', `${BASE}/light.svg`);
    expect(lottie.loadAnimation).not.toHaveBeenCalled();
  });

  it('follows the system reduced-motion preference without a provider', () => {
    matchMediaState.matches = true;
    render(<AnimatedIcon name="form-reading-lens" data-testid="icon" />);
    expect(screen.getByTestId('icon').querySelector('img')).toHaveAttribute('src', `${BASE}/light.svg`);
  });

  it('falls back to the still image when the animation cannot be loaded', async () => {
    render(
      <AnimatedIcon
        src={{
          animation: 'https://cdn.test/missing/broken.txt',
          darkSlots: 'https://cdn.test/missing/dark-slots.json',
          light: 'https://cdn.test/missing/light.svg',
          dark: 'https://cdn.test/missing/dark.svg',
        }}
        data-testid="icon"
      />,
    );
    await waitFor(() =>
      expect(screen.getByTestId('icon').querySelector('img')).toHaveAttribute('src', 'https://cdn.test/missing/light.svg'),
    );
    expect(lottie.loadAnimation).not.toHaveBeenCalled();
  });

  it('destroys the player on unmount', async () => {
    const { unmount } = render(<AnimatedIcon name="form-reading-lens" />);
    await waitFor(() => expect(lottie.loadAnimation).toHaveBeenCalledTimes(1));
    unmount();
    expect(lottie.destroy).toHaveBeenCalledTimes(1);
  });

  it('is decorative by default and named with title', () => {
    const { rerender } = render(<AnimatedIcon name="form-reading-lens" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true');

    rerender(<AnimatedIcon name="form-reading-lens" title="Formular wird gelesen" data-testid="icon" />);
    expect(screen.getByRole('img', { name: 'Formular wird gelesen' })).toBeInTheDocument();
    expect(screen.getByTestId('icon')).not.toHaveAttribute('aria-hidden');
  });

  it('is 160px square by default, sized by size, and passes className, style and ref through', () => {
    const ref = React.createRef<HTMLSpanElement>();
    const { rerender } = render(<AnimatedIcon ref={ref} name="form-reading-lens" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveStyle({ width: '160px', height: '160px' });
    expect(ref.current).toBe(screen.getByTestId('icon'));

    rerender(<AnimatedIcon name="form-reading-lens" size={96} className="mx-auto" style={{ opacity: 0.5 }} data-testid="icon" />);
    const el = screen.getByTestId('icon');
    expect(el).toHaveStyle({ width: '96px', height: '96px', opacity: '0.5' });
    expect(el).toHaveClass('mx-auto', 'inline-block');
  });
});
