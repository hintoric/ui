import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { AnimatedMapImage } from '../components/AnimatedMapImage';

const BERLIN = { lat: 52.520008, lng: 13.404954 };

// Total animation runtime: map-reveal is 700ms, pin-drop is 550ms starting at
// a 400ms delay (950ms), ink-ripple is 900ms starting at a 400ms delay
// (1300ms) — the ripple is the last thing to finish. Waiting past that before
// asserting computed styles or taking a screenshot avoids a flaky mid-animation
// capture.
async function waitForEntranceToSettle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
}

function setReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  })) as unknown as typeof window.matchMedia;
}

// No @mui/joy equivalent — same exemption as MapImage.visual.test.tsx, and
// this hits the same real map-image.api.hintoric.cloud service.
describe('AnimatedMapImage visual', () => {
  it('shows the same loading state as MapImage before the image resolves', () => {
    render(<AnimatedMapImage lat={BERLIN.lat} lng={BERLIN.lng} width={240} height={160} data-testid="map" />);
    const el = page.getByTestId('map').element() as HTMLElement;
    const style = getComputedStyle(el);
    expect(style.width).toBe('240px');
    expect(style.height).toBe('160px');
    expect(style.borderRadius).toBe('8px');
    expect(page.getByTestId('map-loading').element()).toBeInTheDocument();
  });

  it('settles into the fully-revealed state with the pin at rest', async () => {
    render(<AnimatedMapImage lat={BERLIN.lat} lng={BERLIN.lng} width={240} height={160} alt="Berlin" data-testid="map" />);
    await expect.element(page.getByTestId('map-loading'), { timeout: 15000 }).not.toBeInTheDocument();
    await expect.element(page.getByTestId('map-pin'), { timeout: 15000 }).toBeInTheDocument();
    await waitForEntranceToSettle();

    const el = page.getByTestId('map').element() as HTMLElement;
    expect(getComputedStyle(el).clipPath).not.toBe('circle(0% at 50% 50%)');
    const pinDot = el.querySelector('[data-testid="map-pin"] span:last-child') as HTMLElement;
    expect(getComputedStyle(pinDot).opacity).toBe('1');
    const ripple = el.querySelector('[data-testid="map-pin"] span:first-child') as HTMLElement;
    expect(getComputedStyle(ripple).opacity).toBe('0');
    await expect.element(page.getByTestId('map')).toMatchScreenshot('animatedmapimage-settled');
  });

  it('skips the reveal animation and the pin under prefers-reduced-motion', async () => {
    setReducedMotion(true);
    render(<AnimatedMapImage lat={BERLIN.lat} lng={BERLIN.lng} width={240} height={160} alt="Berlin" data-testid="map" />);
    await expect.element(page.getByTestId('map-loading'), { timeout: 15000 }).not.toBeInTheDocument();
    const el = page.getByTestId('map').element() as HTMLElement;
    expect(el.querySelector('[data-testid="map-pin"]')).not.toBeInTheDocument();
    expect(getComputedStyle(el).clipPath).toBe('none');
    setReducedMotion(false);
    await expect.element(page.getByTestId('map')).toMatchScreenshot('animatedmapimage-reduced-motion');
  });

  it('shows the same error fallback as MapImage for out-of-range coordinates', async () => {
    render(<AnimatedMapImage lat={999} lng={13.4} width={240} height={160} data-testid="map" />);
    await expect.element(page.getByText('Map unavailable'), { timeout: 15000 }).toBeInTheDocument();
    const el = page.getByTestId('map').element() as HTMLElement;
    expect(el.querySelector('[data-testid="map-pin"]')).not.toBeInTheDocument();
    await expect.element(page.getByTestId('map')).toMatchScreenshot('animatedmapimage-error');
  });
});
