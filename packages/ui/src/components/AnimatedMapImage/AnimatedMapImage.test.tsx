import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AnimatedMapImage } from './AnimatedMapImage';

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

describe('AnimatedMapImage', () => {
  afterEach(() => {
    setReducedMotion(false);
  });

  it('renders an img whose src is built from lat/lng', () => {
    render(<AnimatedMapImage lat={52.52} lng={13.4} width={300} height={200} zoom={12} alt="Berlin" />);
    const img = screen.getByRole('img', { name: 'Berlin', hidden: true });
    const url = new URL(img.getAttribute('src')!);
    expect(url.searchParams.get('lat')).toBe('52.52');
    expect(url.searchParams.get('lng')).toBe('13.4');
  });

  it('shows a loading indicator before the image has loaded', () => {
    render(<AnimatedMapImage lat={52.52} lng={13.4} data-testid="map" />);
    expect(screen.getByTestId('map-loading')).toBeInTheDocument();
  });

  it('plays the reveal animation and shows a pin once the image loads', () => {
    render(<AnimatedMapImage lat={52.52} lng={13.4} alt="Berlin" data-testid="map" />);
    fireEvent.load(screen.getByRole('img', { name: 'Berlin', hidden: true }));
    expect(screen.getByTestId('map')).toHaveClass('animate-map-reveal');
    expect(screen.getByTestId('map-pin')).toBeInTheDocument();
  });

  it('skips the reveal animation and the pin when the user prefers reduced motion', () => {
    setReducedMotion(true);
    render(<AnimatedMapImage lat={52.52} lng={13.4} alt="Berlin" data-testid="map" />);
    fireEvent.load(screen.getByRole('img', { name: 'Berlin', hidden: true }));
    expect(screen.getByTestId('map')).not.toHaveClass('animate-map-reveal');
    expect(screen.queryByTestId('map-pin')).not.toBeInTheDocument();
  });

  it('calls onLoad when the image loads', () => {
    const onLoad = vi.fn();
    render(<AnimatedMapImage lat={52.52} lng={13.4} alt="Berlin" onLoad={onLoad} />);
    fireEvent.load(screen.getByRole('img', { name: 'Berlin', hidden: true }));
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('shows an error fallback when loading fails', () => {
    render(<AnimatedMapImage lat={52.52} lng={13.4} alt="Berlin" />);
    fireEvent.error(screen.getByRole('img', { name: 'Berlin', hidden: true }));
    expect(screen.getByText('Map unavailable')).toBeInTheDocument();
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
  });

  it('forwards a ref to the container div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<AnimatedMapImage lat={52.52} lng={13.4} ref={ref} data-testid="map" />);
    expect(ref.current).toBe(screen.getByTestId('map'));
  });

  it('merges a custom className with its own classes', () => {
    render(<AnimatedMapImage lat={52.52} lng={13.4} className="custom-class" data-testid="map" />);
    expect(screen.getByTestId('map')).toHaveClass('custom-class');
  });
});
