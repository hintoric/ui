import type * as React from 'react';
import { Grid, Sheet, Typography } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <Sheet variant="soft" color="primary" style={{ padding: 12, textAlign: 'center' }}>
      <Typography level="body-sm">{children}</Typography>
    </Sheet>
  );
}

export function GridPage() {
  return (
    <>
      <h1>Grid</h1>
      <p className="docs-lede">
        A twelve-column layout. One <code>Grid</code> with <code>container</code> opens the grid;
        the children set how many of the twelve columns they span through <code>xs</code>. This
        build uses real CSS Grid rather than Joy UI&apos;s flexbox-and-negative-margins approach.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <Grid container spacing={8}>
          <Grid xs={6}>
            <Cell>xs=6</Cell>
          </Grid>
          <Grid xs={6}>
            <Cell>xs=6</Cell>
          </Grid>
          <Grid xs={4}>
            <Cell>xs=4</Cell>
          </Grid>
          <Grid xs={4}>
            <Cell>xs=4</Cell>
          </Grid>
          <Grid xs={4}>
            <Cell>xs=4</Cell>
          </Grid>
        </Grid>
      </Demo>
      <Code>{`<Grid container spacing={8}>
  <Grid xs={6}>…</Grid>
  <Grid xs={6}>…</Grid>
</Grid>`}</Code>

      <h2>Column spans</h2>
      <Demo>
        <Grid container spacing={8}>
          {[12, 8, 4, 6, 6, 3, 3, 3, 3].map((span, index) => (
            <Grid key={index} xs={span}>
              <Cell>{span}</Cell>
            </Grid>
          ))}
        </Grid>
      </Demo>

      <h2>Filling the remaining width</h2>
      <p>
        <code>xs={'{true}'}</code> stretches an item across the full row — it maps to{' '}
        <code>grid-column: 1 / -1</code> rather than to a share of the leftover space.
      </p>
      <Demo>
        <Grid container spacing={8}>
          <Grid xs={4}>
            <Cell>xs=4</Cell>
          </Grid>
          <Grid xs>
            <Cell>xs (full row)</Cell>
          </Grid>
        </Grid>
      </Demo>
      <Code>{`<Grid xs>…</Grid>`}</Code>

      <h2>Spacing</h2>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[0, 8, 24].map((spacing) => (
            <Grid key={spacing} container spacing={spacing}>
              {[4, 4, 4].map((span, index) => (
                <Grid key={index} xs={span}>
                  <Cell>spacing={spacing}</Cell>
                </Grid>
              ))}
            </Grid>
          ))}
        </div>
      </Demo>
      <Code>{`<Grid container spacing={24}>…</Grid>
<Grid container spacing="1.5rem">…</Grid>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'Grid items, or the item content.' },
          { name: 'container', type: 'boolean', default: 'false', description: 'Makes this element the twelve-column grid.' },
          { name: 'spacing', type: 'number | string', default: '0', description: 'Gap between items. Only meaningful on a container.' },
          { name: 'xs', type: 'number | boolean', description: 'Columns to span out of twelve. true spans the whole row.' },
        ]}
      />

      <h2>Differences from Joy UI</h2>
      <p>
        Joy UI&apos;s Grid supports a span per breakpoint (<code>sm</code>, <code>md</code>,{' '}
        <code>lg</code>, <code>xl</code>) on top of <code>xs</code>. This build implements the
        single non-responsive <code>xs</code> span only. For responsive layouts, use CSS Grid or
        Flexbox directly through <code>Box</code> or <code>Stack</code>.
      </p>
    </>
  );
}
