import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { MapImage } from '../components/MapImage';
import { setColorScheme } from './helpers';

const BERLIN = { lat: 52.520008, lng: 13.404954 };

// MapImage has no @mui/joy equivalent — like HintoricIcon/HintoricLogo, this
// suite is exempt from the usual "compare against real @mui/joy" rule (see
// RelativeTime.visual.test.tsx). It fetches an actual PNG from
// map-image.api.hintoric.cloud, so these tests hit the real service rather
// than a stubbed src — a fake src would only prove the component draws *a*
// box, not that the integration itself renders a real map or reports a real
// failure.
describe('MapImage visual', () => {
  it('sizes the box and shows a loading state before the image resolves', () => {
    render(<MapImage lat={BERLIN.lat} lng={BERLIN.lng} width={240} height={160} data-testid="map" />);
    const el = page.getByTestId('map').element() as HTMLElement;
    const style = getComputedStyle(el);
    expect(style.width).toBe('240px');
    expect(style.height).toBe('160px');
    expect(style.borderRadius).toBe('8px');
    expect(style.backgroundColor).toBe('rgb(11, 13, 14)');
    expect(page.getByTestId('map-loading').element()).toBeInTheDocument();
  });

  it('renders the real map once it loads', async () => {
    render(<MapImage lat={BERLIN.lat} lng={BERLIN.lng} width={240} height={160} alt="Berlin" data-testid="map" />);
    await expect.element(page.getByTestId('map-loading'), { timeout: 15000 }).not.toBeInTheDocument();
    const img = page.getByRole('img', { name: 'Berlin' }).element() as HTMLImageElement;
    expect(getComputedStyle(img).opacity).toBe('1');
    expect(img.naturalWidth).toBeGreaterThan(0);
    await expect.element(page.getByTestId('map')).toMatchScreenshot('mapimage-loaded');
  });

  it('shows an error fallback for out-of-range coordinates', async () => {
    await setColorScheme('light');
    render(<MapImage lat={999} lng={13.4} width={240} height={160} data-testid="map" />);
    await expect.element(page.getByText('Map unavailable'), { timeout: 15000 }).toBeInTheDocument();
    const el = page.getByTestId('map').element() as HTMLElement;
    expect(el.querySelector('img')).not.toBeInTheDocument();
    expect(getComputedStyle(el.querySelector('div')!).backgroundColor).toBe('rgb(240, 244, 248)');
    await expect.element(page.getByTestId('map')).toMatchScreenshot('mapimage-error-light');
  });

  it('themes the error fallback for dark mode', async () => {
    await setColorScheme('dark');
    render(<MapImage lat={999} lng={13.4} width={240} height={160} data-testid="map" />);
    await expect.element(page.getByText('Map unavailable'), { timeout: 15000 }).toBeInTheDocument();
    const el = page.getByTestId('map').element() as HTMLElement;
    expect(getComputedStyle(el.querySelector('div')!).backgroundColor).toBe('rgb(23, 26, 28)');
    await expect.element(page.getByTestId('map')).toMatchScreenshot('mapimage-error-dark');
  });
});
