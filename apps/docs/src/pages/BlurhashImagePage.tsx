import * as React from 'react';
import { BlurhashImage, Button, FileInput, Typography, encodeBlurhash } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

/**
 * Draws a small landscape so the page needs no image host and no network.
 * In a real app the picture comes from your CDN and the hash from your API.
 */
function drawDemoImage(): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const context = canvas.getContext('2d')!;

  const sky = context.createLinearGradient(0, 0, 0, 360);
  sky.addColorStop(0, '#1e3a8a');
  sky.addColorStop(0.6, '#f97316');
  sky.addColorStop(1, '#fbbf24');
  context.fillStyle = sky;
  context.fillRect(0, 0, 640, 360);

  context.fillStyle = '#fde68a';
  context.beginPath();
  context.arc(470, 150, 46, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#14532d';
  context.beginPath();
  context.moveTo(0, 360);
  context.lineTo(180, 210);
  context.lineTo(360, 360);
  context.closePath();
  context.fill();

  context.fillStyle = '#166534';
  context.beginPath();
  context.moveTo(240, 360);
  context.lineTo(460, 240);
  context.lineTo(640, 360);
  context.closePath();
  context.fill();

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9));
}

/** The demo picture plus its hash, both made once when the page mounts. */
function useDemoImage() {
  const [state, setState] = React.useState<{ url: string; hash: string } | null>(null);

  React.useEffect(() => {
    let url: string | undefined;
    void (async () => {
      const blob = await drawDemoImage();
      url = URL.createObjectURL(blob);
      setState({ url, hash: await encodeBlurhash(blob) });
    })();
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  return state;
}

function LoadOnDemandDemo({ withHash = false }: { withHash?: boolean }) {
  const demo = useDemoImage();
  const [src, setSrc] = React.useState<string | null>(null);

  // A local blob loads instantly, which would hide the very thing this
  // component is for. The delay stands in for a real network.
  function load() {
    setSrc(null);
    window.setTimeout(() => setSrc(demo?.url ?? null), 1500);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
      <BlurhashImage
        src={src ?? undefined}
        hash={withHash ? demo?.hash : undefined}
        alt="Sonnenuntergang über zwei Hügeln"
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="sm" onClick={load} disabled={!demo}>
          Bild laden
        </Button>
        <Button size="sm" variant="outlined" onClick={() => setSrc(null)}>
          Zurücksetzen
        </Button>
      </div>
    </div>
  );
}

function EncodeDemo() {
  const [result, setResult] = React.useState<{ url: string; hash: string } | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function handle(files: File[]) {
    setBusy(true);
    try {
      const file = files[0];
      setResult({ url: URL.createObjectURL(file), hash: await encodeBlurhash(file) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
      <FileInput accept="image/*" onFiles={(files) => void handle(files)}>
        Bild wählen oder hierher ziehen
      </FileInput>
      {busy && <Typography level="body-sm">Wird kodiert …</Typography>}
      {result && (
        <>
          <Typography level="body-sm" component="code">
            {result.hash}
          </Typography>
          <BlurhashImage src={result.url} hash={result.hash} alt="Gewähltes Bild" />
        </>
      )}
    </div>
  );
}

export function BlurhashImagePage() {
  return (
    <>
      <h1>BlurhashImage</h1>
      <p className="docs-lede">
        A picture that holds its own place: the{' '}
        <a href="https://github.com/woltapp/blurhash">BlurHash</a> paints immediately, the real
        image fades in over it. There is no Joy UI counterpart — this is the <code>Skeleton</code>{' '}
        role, reserve the space and say &ldquo;something is coming&rdquo;, filled with the colours
        of the actual picture instead of a grey rectangle. Without a <code>hash</code> it really is
        a <code>Skeleton</code>, so a missing hash degrades rather than breaks.
      </p>

      <h2>Basic usage</h2>
      <p>
        The hash is a short string you store next to the image and send with your API response.
        Press <em>Bild laden</em> to watch the swap — the demo delays the picture by 1.5s, because
        a locally generated image would otherwise arrive before you could see the point.
      </p>
      <Demo>
        <LoadOnDemandDemo withHash />
      </Demo>
      <Code>{`<BlurhashImage
  src="https://cdn.example.com/hero.jpg"
  hash="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
  alt="Sonnenuntergang über zwei Hügeln"
  ratio="16 / 9"
/>`}</Code>

      <h2>Without a hash</h2>
      <p>
        Same component, no <code>hash</code> prop: the placeholder is a pulsing{' '}
        <code>Skeleton</code>. Useful for images that predate your hash column, and the reason you
        can adopt this component before the backend is ready.
      </p>
      <Demo>
        <LoadOnDemandDemo />
      </Demo>
      <Code>{`<BlurhashImage src={photo.url} hash={photo.blurhash} alt={photo.title} />`}</Code>

      <h2>When the image never arrives</h2>
      <p>
        On an error the blurred picture stays where it is. A blurred image is a better broken state
        than a broken-image icon, and nothing in the layout moves. Without a hash the skeleton stops
        pulsing instead — a pulse that never ends reads as &ldquo;still loading&rdquo;, which by
        then is a lie.
      </p>

      <h2>Making hashes</h2>
      <p>
        <code>encodeBlurhash</code> turns a <code>File</code>, <code>Blob</code>,{' '}
        <code>HTMLImageElement</code> or <code>ImageBitmap</code> into a hash in the browser —
        enough to compute one at upload time and send it along. It needs a canvas, so it is browser
        only. Encode on upload, never on render: the point of a hash is that the client does not
        have to see the full picture first.
      </p>
      <Demo>
        <EncodeDemo />
      </Demo>
      <Code>{`const hash = await encodeBlurhash(file);
await api.uploadPhoto({ file, blurhash: hash });`}</Code>

      <h2>The canvas on its own</h2>
      <p>
        <code>Blurhash</code> is the decoded gradient by itself, absolutely positioned to fill its
        nearest positioned ancestor. Reach for it when you are building your own image container
        and only want the placeholder. A malformed hash renders nothing rather than throwing —
        decoration must never take the page down.
      </p>
      <Code>{`<AspectRatio ratio="4 / 3">
  <Blurhash hash={photo.blurhash} />
  <video src={photo.preview} className="absolute inset-0 size-full" />
</AspectRatio>`}</Code>

      <h2>Props</h2>
      <h3>BlurhashImage</h3>
      <PropsTable
        rows={[
          { name: 'src', type: 'string', description: 'The image URL. Required.' },
          { name: 'alt', type: 'string', description: 'Alternative text. Required.' },
          {
            name: 'hash',
            type: 'string',
            description:
              'The BlurHash. Without one — or with one that does not decode — the placeholder is a Skeleton.',
          },
          {
            name: 'ratio',
            type: 'string | number',
            default: "'16 / 9'",
            description: 'Passed to AspectRatio. The box keeps this shape while loading.',
          },
          {
            name: 'punch',
            type: 'number',
            default: '1',
            description: 'Contrast of the decoded gradient.',
          },
          {
            name: 'resolution',
            type: 'number',
            default: '32',
            description: 'Edge length in pixels the hash is decoded to.',
          },
          {
            name: 'objectFit',
            type: 'CSSProperties["objectFit"]',
            default: "'cover'",
            description: 'How the loaded image fills the box.',
          },
          {
            name: 'onLoad / onError',
            type: '(event) => void',
            description: 'Forwarded from the underlying image.',
          },
          {
            name: '…the rest',
            type: "ComponentProps<'img'>",
            description:
              'Everything else reaches the image itself, so loading="lazy", srcSet, sizes and crossOrigin behave as they would on a plain <img>. className and style stay on the frame.',
          },
        ]}
      />

      <h3>Blurhash</h3>
      <PropsTable
        rows={[
          { name: 'hash', type: 'string', description: 'A BlurHash string. Required.' },
          { name: 'punch', type: 'number', default: '1', description: 'Contrast of the gradient.' },
          {
            name: 'resolution',
            type: 'number',
            default: '32',
            description:
              'Decode size. The canvas is stretched over its container, so past about 32 the difference stops being visible.',
          },
        ]}
      />

      <h3>encodeBlurhash(source, options?)</h3>
      <PropsTable
        rows={[
          {
            name: 'source',
            type: 'Blob | HTMLImageElement | ImageBitmap',
            description: 'The picture to encode.',
          },
          {
            name: 'options.componentX',
            type: 'number',
            default: '4',
            description: 'Horizontal detail, 1–9.',
          },
          {
            name: 'options.componentY',
            type: 'number',
            default: '3',
            description: 'Vertical detail, 1–9.',
          },
          {
            name: 'options.maxSize',
            type: 'number',
            default: '64',
            description:
              'Longest edge the picture is scaled down to first. A larger source is only slower, never sharper.',
          },
        ]}
      />
    </>
  );
}
