import { Card, Skeleton, Typography } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

export function SkeletonPage() {
  return (
    <>
      <h1>Skeleton</h1>
      <p className="docs-lede">
        A placeholder shown while content loads. Its default variant is <code>overlay</code>: the
        skeleton covers its parent and takes that parent&apos;s shape, so you can wrap real content
        and let it define the size instead of measuring it yourself.
      </p>

      <h2>Shapes</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Skeleton variant="rectangular" width={120} height={48} />
          <Skeleton variant="text" width={160} />
        </div>
      </Demo>
      <Code>{`<Skeleton variant="circular" width={48} height={48} />
<Skeleton variant="rectangular" width={120} height={48} />
<Skeleton variant="text" width={160} />`}</Code>

      <h2>Overlay on real content</h2>
      <p>
        With <code>variant=&quot;overlay&quot;</code> the skeleton sits on top of its parent. Give
        the parent <code>position: relative</code> and it inherits the real layout — no guessed
        widths.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 24 }}>
          <Card style={{ position: 'relative', width: 220 }}>
            <Skeleton />
            <Typography level="title-md">Real heading</Typography>
            <Typography level="body-sm">
              The text underneath sets the size the skeleton covers.
            </Typography>
          </Card>
          <Card style={{ width: 220 }}>
            <Typography level="title-md">Real heading</Typography>
            <Typography level="body-sm">
              The text underneath sets the size the skeleton covers.
            </Typography>
          </Card>
        </div>
      </Demo>
      <Code>{`<Card style={{ position: 'relative' }}>
  <Skeleton />
  <Typography level="title-md">Real heading</Typography>
</Card>`}</Code>

      <h2>Animations</h2>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320 }}>
          <Skeleton variant="rectangular" height={24} animation="pulse" />
          <Skeleton variant="rectangular" height={24} animation="wave" />
          <Skeleton variant="rectangular" height={24} animation={false} />
        </div>
      </Demo>
      <Code>{`<Skeleton variant="rectangular" height={24} animation="wave" />
<Skeleton variant="rectangular" height={24} animation={false} />`}</Code>

      <h2>A loading list</h2>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
          {[0, 1, 2].map((row) => (
            <div key={row} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Skeleton variant="circular" width={36} height={36} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="90%" />
              </div>
            </div>
          ))}
        </div>
      </Demo>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'variant', type: "'text' | 'circular' | 'rectangular' | 'overlay'", default: "'overlay'", description: 'Shape of the placeholder. overlay covers the parent.' },
          { name: 'animation', type: "'pulse' | 'wave' | false", default: "'pulse'", description: 'Loading animation, or false for a static block.' },
          { name: 'width', type: 'number | string', description: 'Explicit width. Numbers are pixels.' },
          { name: 'height', type: 'number | string', description: 'Explicit height. Numbers are pixels.' },
        ]}
      />
    </>
  );
}
