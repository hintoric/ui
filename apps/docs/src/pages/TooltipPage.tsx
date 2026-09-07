import { Button, IconButton, Tooltip, Typography } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function TooltipPage() {
  return (
    <>
      <h1>Tooltip</h1>
      <p className="docs-lede">
        A label that appears on hover or keyboard focus, built on Base UI&apos;s{' '}
        <code>Tooltip</code>. It wraps exactly one child element and attaches the trigger behaviour
        to it, so the child has to forward a ref and spread props — every component in this library
        does.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Tooltip title="Saves without closing the editor">
            <Button variant="outlined" color="neutral">
              Save
            </Button>
          </Tooltip>
          <Tooltip title="Delete this record permanently">
            <IconButton variant="soft" color="danger" aria-label="Delete">
              ✕
            </IconButton>
          </Tooltip>
        </div>
      </Demo>
      <Code>{`<Tooltip title="Saves without closing the editor">
  <Button variant="outlined" color="neutral">Save</Button>
</Tooltip>`}</Code>

      <h2>Placement</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
            <Tooltip key={placement} title={`Placed ${placement}`} placement={placement}>
              <Button variant="outlined" color="neutral">
                {placement}
              </Button>
            </Tooltip>
          ))}
        </div>
      </Demo>
      <Code>{`<Tooltip title="Placed top" placement="top">…</Tooltip>`}</Code>

      <h2>Variants &amp; colors</h2>
      <p>
        Tooltip defaults to <code>solid</code>/<code>neutral</code> — a dark chip, matching Joy UI.
        The tooltips below are forced open so the grid is readable at a glance.
      </p>
      <Demo>
        <div style={{ paddingBottom: 48 }}>
          <VariantColorGrid
            variants={VARIANTS}
            colors={COLORS}
            renderCell={(variant, color) => (
              <Tooltip title={`${variant} ${color}`} variant={variant} color={color}>
                <Button size="sm" variant="plain" color="neutral">
                  hover
                </Button>
              </Tooltip>
            )}
          />
        </div>
      </Demo>
      <Code>{`<Tooltip title="Copied" variant="soft" color="success">…</Tooltip>`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Tooltip key={size} title={`Size ${size}`} size={size}>
              <Button variant="outlined" color="neutral">
                {size}
              </Button>
            </Tooltip>
          ))}
        </div>
      </Demo>

      <h2>Rich content</h2>
      <p>
        <code>title</code> is any node, not just a string.
      </p>
      <Demo>
        <Tooltip
          title={
            <div>
              <Typography level="title-sm">Keyboard shortcut</Typography>
              <Typography level="body-xs">⌘ + S</Typography>
            </div>
          }
        >
          <Button variant="outlined" color="neutral">
            Save
          </Button>
        </Tooltip>
      </Demo>
      <Code>{`<Tooltip title={<><Typography level="title-sm">Shortcut</Typography>…</>}>…</Tooltip>`}</Code>

      <h2>Open by default</h2>
      <p>
        <code>defaultOpen</code> renders the tooltip immediately, bypassing hover and focus. It
        exists mainly for tests and screenshots.
      </p>
      <Code>{`<Tooltip title="Always visible" defaultOpen>…</Tooltip>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactElement', description: 'The single element that triggers the tooltip. Required.' },
          { name: 'title', type: 'React.ReactNode', description: 'Tooltip content. An empty title disables the tooltip. Required.' },
          { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: "'bottom'", description: 'Side of the trigger the tooltip appears on.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'solid'", description: 'Visual style of the tooltip surface.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Padding and font size of the tooltip.' },
          { name: 'disableInteractive', type: 'boolean', default: 'false', description: 'Prevents the pointer from entering the tooltip itself.' },
          { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Renders the tooltip open from the start.' },
        ]}
      />
    </>
  );
}
