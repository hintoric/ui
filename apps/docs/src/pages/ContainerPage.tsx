import { Container, Sheet, Typography } from '@hintoric/ui';
import type { ContainerMaxWidth } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

const MAX_WIDTHS: Exclude<ContainerMaxWidth, false>[] = ['xs', 'sm', 'md', 'lg', 'xl'];

export function ContainerPage() {
  return (
    <>
      <h1>Container</h1>
      <p className="docs-lede">
        Centres page content and caps its width. Each <code>maxWidth</code> is a real media query,
        not a flat value — below its breakpoint the cap is simply not applied, which is how Joy
        UI&apos;s own Container behaves.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <Container maxWidth="sm">
          <Sheet variant="soft" color="neutral" style={{ padding: 16 }}>
            <Typography level="body-md">
              Centred, gutters on the sides, capped at 600px once the viewport is that wide.
            </Typography>
          </Sheet>
        </Container>
      </Demo>
      <Code>{`<Container maxWidth="sm">
  <Sheet variant="soft">…</Sheet>
</Container>`}</Code>

      <h2>Max widths</h2>
      <p>
        <code>sm</code> through <code>xl</code> cap at the breakpoint they are named after: 600,
        900, 1200 and 1536 pixels. <code>xs</code> is the exception — it is always active, and caps
        at 444px rather than at 0.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MAX_WIDTHS.map((maxWidth) => (
            <Container key={maxWidth} maxWidth={maxWidth} disableGutters>
              <Sheet variant="soft" color="primary" style={{ padding: 8 }}>
                <Typography level="body-sm">maxWidth=&quot;{maxWidth}&quot;</Typography>
              </Sheet>
            </Container>
          ))}
          <Container maxWidth={false} disableGutters>
            <Sheet variant="soft" color="neutral" style={{ padding: 8 }}>
              <Typography level="body-sm">maxWidth={'{false}'} — no cap at all</Typography>
            </Sheet>
          </Container>
        </div>
      </Demo>
      <Code>{`<Container maxWidth="md">…</Container>
<Container maxWidth={false}>…</Container>`}</Code>

      <h2>Gutters</h2>
      <p>
        Containers carry horizontal padding by default — 16px, widening to 24px from the{' '}
        <code>sm</code> breakpoint. <code>disableGutters</code> removes it.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Container maxWidth="sm">
            <Sheet variant="outlined" style={{ padding: 8 }}>
              <Typography level="body-sm">With gutters</Typography>
            </Sheet>
          </Container>
          <Container maxWidth="sm" disableGutters>
            <Sheet variant="outlined" style={{ padding: 8 }}>
              <Typography level="body-sm">disableGutters</Typography>
            </Sheet>
          </Container>
        </div>
      </Demo>

      <h2>Rendering as another element</h2>
      <Code>{`<Container component="main" maxWidth="lg">
  …
</Container>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The page content.' },
          { name: 'maxWidth', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | false", default: "'lg'", description: 'Width cap, applied from its own breakpoint upward. false removes the cap.' },
          { name: 'disableGutters', type: 'boolean', default: 'false', description: 'Removes the horizontal padding.' },
          { name: 'component', type: 'React.ElementType', default: "'div'", description: 'Element to render as.' },
          { name: 'fixed', type: 'boolean', default: 'false', description: 'Accepted for API parity but not implemented in this build.' },
        ]}
      />

      <h2>Differences from Joy UI</h2>
      <p>
        Joy UI&apos;s <code>fixed</code> switches the container from a fluid max-width to the
        breakpoint value itself. This build accepts the prop so the API matches, but ignores it.
      </p>
    </>
  );
}
