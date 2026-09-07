import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MapImage } from './MapImage';

describe('MapImage', () => {
  it('renders an img whose src is built from lat/lng/width/height/zoom', () => {
    render(<MapImage lat={52.520008} lng={13.404954} width={300} height={200} zoom={12} alt="Berlin" />);
    const img = screen.getByRole('img', { name: 'Berlin', hidden: true });
    const url = new URL(img.getAttribute('src')!);
    expect(url.origin + url.pathname).toBe('https://map-image.api.hintoric.cloud/api/map');
    expect(url.searchParams.get('lat')).toBe('52.520008');
    expect(url.searchParams.get('lng')).toBe('13.404954');
    expect(url.searchParams.get('width')).toBe('300');
    expect(url.searchParams.get('height')).toBe('200');
    expect(url.searchParams.get('zoom')).toBe('12');
  });

  it('defaults width/height/zoom when not provided', () => {
    render(<MapImage lat={52.52} lng={13.4} alt="Default" />);
    const img = screen.getByRole('img', { name: 'Default', hidden: true });
    const url = new URL(img.getAttribute('src')!);
    expect(url.searchParams.get('width')).toBe('480');
    expect(url.searchParams.get('height')).toBe('320');
    expect(url.searchParams.get('zoom')).toBe('15');
  });

  it('defaults alt text to the coordinates when alt is not provided', () => {
    render(<MapImage lat={52.52} lng={13.4} />);
    expect(screen.getByRole('img', { name: 'Map centered at 52.52, 13.4', hidden: true })).toBeInTheDocument();
  });

  it('sizes the container to width/height', () => {
    render(<MapImage lat={52.52} lng={13.4} width={300} height={200} data-testid="map" />);
    expect(screen.getByTestId('map')).toHaveStyle({ width: '300px', height: '200px' });
  });

  it('shows a loading indicator before the image has loaded', () => {
    render(<MapImage lat={52.52} lng={13.4} data-testid="map" />);
    expect(screen.getByTestId('map')).toHaveTextContent('');
    expect(screen.getByTestId('map-loading')).toBeInTheDocument();
  });

  it('hides the loading indicator once the image loads', () => {
    render(<MapImage lat={52.52} lng={13.4} alt="Berlin" data-testid="map" />);
    fireEvent.load(screen.getByRole('img', { name: 'Berlin', hidden: true }));
    expect(screen.queryByTestId('map-loading')).not.toBeInTheDocument();
  });

  it('calls onLoad when the image loads', () => {
    const onLoad = vi.fn();
    render(<MapImage lat={52.52} lng={13.4} alt="Berlin" onLoad={onLoad} />);
    fireEvent.load(screen.getByRole('img', { name: 'Berlin', hidden: true }));
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('shows an error fallback and removes the img when loading fails', () => {
    render(<MapImage lat={52.52} lng={13.4} alt="Berlin" data-testid="map" />);
    fireEvent.error(screen.getByRole('img', { name: 'Berlin', hidden: true }));
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
    expect(screen.getByText('Map unavailable')).toBeInTheDocument();
  });

  it('calls onError when loading fails', () => {
    const onError = vi.fn();
    render(<MapImage lat={52.52} lng={13.4} alt="Berlin" onError={onError} />);
    fireEvent.error(screen.getByRole('img', { name: 'Berlin', hidden: true }));
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('allows overriding the error fallback text', () => {
    render(<MapImage lat={52.52} lng={13.4} alt="Berlin" errorLabel="Keine Karte verfügbar" />);
    fireEvent.error(screen.getByRole('img', { name: 'Berlin', hidden: true }));
    expect(screen.getByText('Keine Karte verfügbar')).toBeInTheDocument();
  });

  it('resets to the loading state when the coordinates change', () => {
    const { rerender } = render(<MapImage lat={52.52} lng={13.4} alt="Berlin" data-testid="map" />);
    fireEvent.load(screen.getByRole('img', { name: 'Berlin', hidden: true }));
    expect(screen.queryByTestId('map-loading')).not.toBeInTheDocument();

    rerender(<MapImage lat={48.1351} lng={11.582} alt="Munich" data-testid="map" />);
    expect(screen.getByTestId('map-loading')).toBeInTheDocument();
  });

  it('merges a custom className with its own classes', () => {
    render(<MapImage lat={52.52} lng={13.4} className="custom-class" data-testid="map" />);
    expect(screen.getByTestId('map')).toHaveClass('custom-class');
  });

  it('forwards a ref to the container div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<MapImage lat={52.52} lng={13.4} ref={ref} data-testid="map" />);
    expect(ref.current).toBe(screen.getByTestId('map'));
  });
});
