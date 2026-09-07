import { useState } from 'react';
import { AnimatedMapImage, Button, MapImage, Typography } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

const CITIES = [
  { label: 'Berlin', lat: 52.520008, lng: 13.404954 },
  { label: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { label: 'New York', lat: 40.7128, lng: -74.006 },
  { label: 'Cape Town', lat: -33.9249, lng: 18.4241 },
];

export function MapImagePage() {
  const [city, setCity] = useState(CITIES[0]);
  const [replayKey, setReplayKey] = useState(0);

  return (
    <>
      <h1>MapImage</h1>
      <p className="docs-lede">
        Renders a static map centered on a latitude/longitude, fetched from{' '}
        <code>map-image.api.hintoric.cloud</code>. Handles the loading and error states itself,
        so you only ever pass coordinates.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <MapImage lat={52.520008} lng={13.404954} width={360} height={240} alt="Berlin" />
      </Demo>
      <Code>{`<MapImage lat={52.520008} lng={13.404954} width={360} height={240} alt="Berlin" />`}</Code>

      <h2>Zoom and size</h2>
      <p>
        <code>zoom</code> ranges 1–19, <code>width</code>/<code>height</code> 64–2048px. The box
        is sized to exactly those pixels — the image is requested at that resolution rather than
        scaled by CSS.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <MapImage lat={52.520008} lng={13.404954} width={160} height={160} zoom={11} alt="Berlin, zoom 11" />
          <MapImage lat={52.520008} lng={13.404954} width={160} height={160} zoom={16} alt="Berlin, zoom 16" />
        </div>
      </Demo>
      <Code>{`<MapImage lat={52.520008} lng={13.404954} width={160} height={160} zoom={11} />
<MapImage lat={52.520008} lng={13.404954} width={160} height={160} zoom={16} />`}</Code>

      <h2>Error fallback</h2>
      <p>Out-of-range or otherwise rejected coordinates show a fallback instead of a broken image.</p>
      <Demo>
        <MapImage lat={999} lng={13.4} width={280} height={160} errorLabel="Standort nicht verfügbar" />
      </Demo>
      <Code>{`<MapImage lat={999} lng={13.4} errorLabel="Standort nicht verfügbar" />`}</Code>

      <h1>AnimatedMapImage</h1>
      <p className="docs-lede">
        Same component, with a one-time entrance once the map loads: the frame irises open from
        the center while a pin drops onto the coordinate and an ink ring ripples out from under
        it. Respects <code>prefers-reduced-motion</code> automatically.
      </p>

      <h2>Pick a location</h2>
      <p>Switching city remounts the image, so the loading state and entrance play again.</p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CITIES.map((c) => (
              <Button
                key={c.label}
                size="sm"
                variant={c.label === city.label ? 'solid' : 'outlined'}
                onClick={() => setCity(c)}
              >
                {c.label}
              </Button>
            ))}
            <Button size="sm" variant="plain" onClick={() => setReplayKey((k) => k + 1)}>
              Replay
            </Button>
          </div>
          <AnimatedMapImage
            key={`${city.label}-${replayKey}`}
            lat={city.lat}
            lng={city.lng}
            width={360}
            height={240}
            alt={city.label}
          />
          <Typography level="body-xs">{city.label}</Typography>
        </div>
      </Demo>
      <Code>{`<AnimatedMapImage lat={city.lat} lng={city.lng} width={360} height={240} alt={city.label} />`}</Code>

      <h2>Props</h2>
      <p>
        <code>AnimatedMapImage</code> takes the exact same props as <code>MapImage</code> — it
        wraps the same fetch/loading logic and only adds the entrance effect.
      </p>
      <PropsTable
        rows={[
          { name: 'lat', type: 'number', description: 'Latitude of the map center, -90 to 90.' },
          { name: 'lng', type: 'number', description: 'Longitude of the map center, -180 to 180.' },
          { name: 'zoom', type: 'number', default: '15', description: 'Zoom level, 1-19.' },
          { name: 'width', type: 'number', default: '480', description: 'Image width in pixels, 64-2048.' },
          { name: 'height', type: 'number', default: '320', description: 'Image height in pixels, 64-2048.' },
          { name: 'alt', type: 'string', description: 'Accessible alt text. Defaults to a description including the coordinates.' },
          { name: 'errorLabel', type: 'string', default: "'Map unavailable'", description: 'Text shown when the map image fails to load.' },
          { name: 'onLoad', type: '() => void', description: 'Called once the map image has finished loading.' },
          { name: 'onError', type: '() => void', description: 'Called if the map image fails to load.' },
        ]}
      />
    </>
  );
}
