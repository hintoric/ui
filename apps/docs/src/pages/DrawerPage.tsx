import * as React from 'react';
import { Button, Drawer, DialogTitle, ModalClose, Typography } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

function AnchoredDrawer({ anchor }: { anchor: 'left' | 'right' | 'top' | 'bottom' }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="outlined" color="neutral" onClick={() => setOpen(true)}>
        {anchor}
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} anchor={anchor}>
        <ModalClose onClick={() => setOpen(false)} />
        <DialogTitle>Anchored {anchor}</DialogTitle>
        <Typography level="body-md">The panel slides in from the {anchor} edge.</Typography>
      </Drawer>
    </>
  );
}

function SizedDrawer({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="outlined" color="neutral" onClick={() => setOpen(true)}>
        {size}
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} size={size}>
        <ModalClose onClick={() => setOpen(false)} />
        <DialogTitle>Size {size}</DialogTitle>
        <Typography level="body-md">Size controls the panel width, not its typography.</Typography>
      </Drawer>
    </>
  );
}

function StyledDrawer({ variant, color }: { variant: JoyVariant; color: JoyColor }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button size="sm" variant="plain" color="neutral" onClick={() => setOpen(true)}>
        {color.slice(0, 4)}
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} variant={variant} color={color}>
        <ModalClose onClick={() => setOpen(false)} />
        <DialogTitle>
          {variant} / {color}
        </DialogTitle>
      </Drawer>
    </>
  );
}

export function DrawerPage() {
  return (
    <>
      <h1>Drawer</h1>
      <p className="docs-lede">
        A panel that slides in from an edge of the screen, over a backdrop. It is a sibling of{' '}
        <code>Modal</code> rather than a wrapper around it: same dialog behaviour, different
        geometry. Unlike Modal, the visible surface is the Drawer itself — there is no separate
        dialog child.
      </p>

      <h2>Anchors</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {(['left', 'right', 'top', 'bottom'] as const).map((anchor) => (
            <AnchoredDrawer key={anchor} anchor={anchor} />
          ))}
        </div>
      </Demo>
      <Code>{`const [open, setOpen] = React.useState(false);

<Drawer open={open} onClose={() => setOpen(false)} anchor="right">
  <ModalClose onClick={() => setOpen(false)} />
  <DialogTitle>Filters</DialogTitle>
  …
</Drawer>`}</Code>

      <h2>Sizes</h2>
      <p>
        <code>size</code> sets how far the panel extends from its edge — a width for{' '}
        <code>left</code>/<code>right</code>, a height for <code>top</code>/<code>bottom</code>.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 16 }}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <SizedDrawer key={size} size={size} />
          ))}
        </div>
      </Demo>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <table className="docs-grid-table">
          <thead>
            <tr>
              <th />
              {COLORS.map((color) => (
                <th key={color}>{color}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VARIANTS.map((variant) => (
              <tr key={variant}>
                <th scope="row">{variant}</th>
                {COLORS.map((color) => (
                  <td key={color}>
                    <StyledDrawer variant={variant} color={color} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Demo>
      <Code>{`<Drawer open={open} onClose={close} variant="soft" color="primary">…</Drawer>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'open', type: 'boolean', description: 'Whether the drawer is shown. Required — Drawer is always controlled.' },
          { name: 'onClose', type: '() => void', description: 'Called on backdrop click, Escape, or any other dismissal.' },
          { name: 'children', type: 'React.ReactNode', description: 'The panel content.' },
          { name: 'anchor', type: "'left' | 'right' | 'top' | 'bottom'", default: "'left'", description: 'Edge the panel slides in from.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'plain'", description: 'Visual style of the panel surface.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Width (left/right) or height (top/bottom) of the panel.' },
        ]}
      />
    </>
  );
}
