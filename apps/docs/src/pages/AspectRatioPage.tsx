import { AspectRatio, Card, Sheet, Typography } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

const PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%230b6bcb"/><stop offset="1" stop-color="%23a5d8ff"/></linearGradient></defs><rect width="640" height="360" fill="url(%23g)"/><text x="320" y="196" font-family="sans-serif" font-size="48" fill="white" text-anchor="middle">640 × 360</text></svg>`,
  );

export function AspectRatioPage() {
  return (
    <>
      <h1>AspectRatio</h1>
      <p className="docs-lede">
        Holds a fixed width-to-height ratio for whatever it contains, so an image or a video does
        not shift the layout while it loads. It uses the CSS <code>aspect-ratio</code> property
        rather than the padding-top hack Joy UI still relies on.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <div style={{ maxWidth: 320 }}>
          <AspectRatio>
            <img src={PHOTO} alt="A placeholder gradient" />
          </AspectRatio>
        </div>
      </Demo>
      <Code>{`<AspectRatio>
  <img src={photo} alt="" />
</AspectRatio>`}</Code>

      <h2>Ratios</h2>
      <p>
        The default is <code>16 / 9</code>. A number works too — <code>1</code> is a square.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {['16 / 9', '4 / 3', '1', '3 / 4'].map((ratio) => (
            <div key={ratio} style={{ width: 140 }}>
              <AspectRatio ratio={ratio}>
                <Sheet
                  variant="soft"
                  color="primary"
                  style={{ display: 'grid', placeItems: 'center', height: '100%' }}
                >
                  <Typography level="body-sm">{ratio}</Typography>
                </Sheet>
              </AspectRatio>
            </div>
          ))}
        </div>
      </Demo>
      <Code>{`<AspectRatio ratio="4 / 3">…</AspectRatio>
<AspectRatio ratio={1}>…</AspectRatio>`}</Code>

      <h2>Object fit</h2>
      <p>
        <code>objectFit</code> is applied to the child, defaulting to <code>cover</code> — the
        content fills the box and is cropped. <code>contain</code> fits it whole instead.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ width: 180 }}>
            <AspectRatio ratio="1">
              <img src={PHOTO} alt="Cover" />
            </AspectRatio>
            <Typography level="body-xs">cover (default)</Typography>
          </div>
          <div style={{ width: 180 }}>
            <AspectRatio ratio="1" objectFit="contain">
              <img src={PHOTO} alt="Contain" />
            </AspectRatio>
            <Typography level="body-xs">contain</Typography>
          </div>
        </div>
      </Demo>
      <Code>{`<AspectRatio ratio="1" objectFit="contain">
  <img src={photo} alt="" />
</AspectRatio>`}</Code>

      <h2>Height bounds</h2>
      <p>
        <code>minHeight</code> and <code>maxHeight</code> clamp the computed height, which keeps a
        wide ratio from collapsing on narrow screens or growing too tall on wide ones.
      </p>
      <Demo>
        <div style={{ maxWidth: 480 }}>
          <AspectRatio ratio="21 / 9" minHeight={80} maxHeight={140}>
            <Sheet
              variant="soft"
              color="success"
              style={{ display: 'grid', placeItems: 'center', height: '100%' }}
            >
              <Typography level="body-sm">21 / 9, clamped to 80–140px</Typography>
            </Sheet>
          </AspectRatio>
        </div>
      </Demo>
      <Code>{`<AspectRatio ratio="21 / 9" minHeight={80} maxHeight={140}>…</AspectRatio>`}</Code>

      <h2>Inside a Card</h2>
      <Demo>
        <Card style={{ maxWidth: 260 }}>
          <AspectRatio ratio="16 / 9">
            <img src={PHOTO} alt="Card media" />
          </AspectRatio>
          <Typography level="title-md">Card with media</Typography>
          <Typography level="body-sm">
            The ratio holds while the image loads, so nothing jumps.
          </Typography>
        </Card>
      </Demo>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The content to constrain — usually an img, video or iframe.' },
          { name: 'ratio', type: 'string | number', default: "'16 / 9'", description: 'Width-to-height ratio. A number is treated as width ÷ height.' },
          { name: 'objectFit', type: "React.CSSProperties['objectFit']", default: "'cover'", description: 'How the child fills the box.' },
          { name: 'minHeight', type: 'number | string', description: 'Lower bound on the computed height.' },
          { name: 'maxHeight', type: 'number | string', description: 'Upper bound on the computed height.' },
        ]}
      />
    </>
  );
}
