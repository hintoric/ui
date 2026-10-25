import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { createAnimatedIcon } from './createAnimatedIcon';
import { FormReadingLensAnimatedIcon, animatedIcons } from './index';

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
const Icon = FormReadingLensAnimatedIcon;

function respond(url: string): Response {
  if (url.endsWith('dark-slots.json')) return Response.json(DARK_SLOTS);
  if (url.endsWith('.json')) return Response.json(ANIMATION);
  return new Response(null, { status: 404 });
}

function lastAnimationData() {
  return lottie.loadAnimation.mock.lastCall![0].animationData as typeof ANIMATION;
}

function reducedMotionQuery(matches: boolean) {
  vi.stubGlobal('matchMedia', (media: string) => ({
    media,
    matches,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

beforeEach(() => {
  lottie.loadAnimation.mockReset().mockReturnValue({ destroy: lottie.destroy });
  lottie.destroy.mockReset();
  vi.stubGlobal('fetch', vi.fn(async (url: string) => respond(url)));
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-color-scheme');
  document.documentElement.removeAttribute('data-reduced-motion');
});

describe('createAnimatedIcon', () => {
  it('plays the CDN animation with the SVG renderer, looping, in the light scheme', async () => {
    render(<Icon data-testid="icon" />);
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
    render(<Icon />);
    await waitFor(() => expect(lottie.loadAnimation).toHaveBeenCalledTimes(1));

    expect(lastAnimationData().slots.sticker.p.k).toEqual(DARK_SLOTS.sticker);
    expect(lastAnimationData().layers[0]!.shapes[0]!.c.k).toEqual(DARK_SLOTS.sticker);
  });

  it('reloads with the other colours when <html> switches scheme at runtime', async () => {
    render(<Icon data-testid="icon" />);
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
    render(<Icon mode="light" />);
    await waitFor(() => expect(lottie.loadAnimation).toHaveBeenCalledTimes(1));
    expect(lastAnimationData().slots.sticker.p.k).toEqual([1, 1, 1, 1]);
  });

  it('shows the still image and no player under data-reduced-motion="reduce"', async () => {
    document.documentElement.setAttribute('data-color-scheme', 'dark');
    document.documentElement.setAttribute('data-reduced-motion', 'reduce');
    render(<Icon data-testid="icon" />);
    const img = screen.getByTestId('icon').querySelector('img')!;
    expect(img).toHaveAttribute('src', `${BASE}/dark.svg`);
    expect(img).toHaveAttribute('alt', '');
    expect(screen.getByTestId('icon').querySelector('[data-animated-icon-player]')).toBeNull();

    await act(async () => document.documentElement.setAttribute('data-color-scheme', 'light'));
    expect(img).toHaveAttribute('src', `${BASE}/light.svg`);
    expect(lottie.loadAnimation).not.toHaveBeenCalled();
  });

  it('starts the player once <html> drops reduced motion', async () => {
    document.documentElement.setAttribute('data-reduced-motion', 'reduce');
    render(<Icon />);
    await act(async () => document.documentElement.setAttribute('data-reduced-motion', 'no-preference'));
    await waitFor(() => expect(lottie.loadAnimation).toHaveBeenCalledTimes(1));
  });

  it('follows the system setting without an attribute, and the attribute over it', async () => {
    reducedMotionQuery(true);
    const { unmount } = render(<Icon data-testid="icon" />);
    expect(screen.getByTestId('icon').querySelector('img')).toHaveAttribute('src', `${BASE}/light.svg`);
    unmount();

    // ReducedMotionProvider's app-owned `false` beats a reduced system setting.
    document.documentElement.setAttribute('data-reduced-motion', 'no-preference');
    render(<Icon />);
    await waitFor(() => expect(lottie.loadAnimation).toHaveBeenCalledTimes(1));
  });

  it('falls back to the still image when the animation cannot be loaded', async () => {
    const Broken = createAnimatedIcon({
      slug: 'broken',
      name: 'BrokenAnimatedIcon',
      cdn: {
        animation: 'https://cdn.test/broken/broken.txt',
        darkSlots: 'https://cdn.test/broken/dark-slots.json',
        light: 'https://cdn.test/broken/light.svg',
        dark: 'https://cdn.test/broken/dark.svg',
      },
    });
    render(<Broken data-testid="icon" />);
    await waitFor(() =>
      expect(screen.getByTestId('icon').querySelector('img')).toHaveAttribute('src', 'https://cdn.test/broken/light.svg'),
    );
    expect(lottie.loadAnimation).not.toHaveBeenCalled();
  });

  it('destroys the player on unmount', async () => {
    const { unmount } = render(<Icon />);
    await waitFor(() => expect(lottie.loadAnimation).toHaveBeenCalledTimes(1));
    unmount();
    expect(lottie.destroy).toHaveBeenCalledTimes(1);
  });

  it('is decorative by default and named with title', () => {
    const { rerender } = render(<Icon data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true');

    rerender(<Icon title="Formular wird gelesen" data-testid="icon" />);
    expect(screen.getByRole('img', { name: 'Formular wird gelesen' })).toBeInTheDocument();
    expect(screen.getByTestId('icon')).not.toHaveAttribute('aria-hidden');
  });

  it('sizes with size (160px by default) and passes className, style and ref through', () => {
    const ref = createRef<HTMLSpanElement>();
    const { rerender } = render(<Icon ref={ref} data-testid="icon" />);
    const el = screen.getByTestId('icon');
    expect(el.style.getPropertyValue('--hi-animated-icon-size')).toBe('160px');
    expect(ref.current).toBe(el);

    rerender(<Icon size={96} className="mx-auto" style={{ opacity: 0.5 }} data-testid="icon" />);
    expect(el.style.getPropertyValue('--hi-animated-icon-size')).toBe('96px');
    expect(el).toHaveStyle({ opacity: '0.5' });
    expect(el).toHaveClass('hi-animated-icon', 'mx-auto');
    expect(document.head.querySelectorAll('style[data-href="hintoric-animated-icons"]')).toHaveLength(1);
  });

  it('carries its slug, name and CDN URLs, and is listed', () => {
    expect(Icon.displayName).toBe('FormReadingLensAnimatedIcon');
    expect(Icon.slug).toBe('form-reading-lens');
    expect(Icon.cdn).toEqual({
      animation: `${BASE}/form-reading-lens.json`,
      darkSlots: `${BASE}/dark-slots.json`,
      light: `${BASE}/light.svg`,
      dark: `${BASE}/dark.svg`,
    });
    expect(animatedIcons).toContain(Icon);
  });
});
