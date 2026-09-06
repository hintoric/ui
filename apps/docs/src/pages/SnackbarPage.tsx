import * as React from 'react';
import { Button, IconButton, Snackbar } from '@hintoric/ui';
import type { JoyColor, JoyVariant, SnackbarAnchorOrigin } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const ORIGINS: SnackbarAnchorOrigin[] = [
  { vertical: 'top', horizontal: 'left' },
  { vertical: 'top', horizontal: 'center' },
  { vertical: 'top', horizontal: 'right' },
  { vertical: 'bottom', horizontal: 'left' },
  { vertical: 'bottom', horizontal: 'center' },
  { vertical: 'bottom', horizontal: 'right' },
];

function TriggerSnackbar({
  label,
  ...snackbarProps
}: { label: string } & Omit<React.ComponentProps<typeof Snackbar>, 'open' | 'onClose'>) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="outlined" color="neutral" size="sm" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        endDecorator={
          <IconButton size="sm" variant="plain" color="neutral" aria-label="Dismiss" onClick={() => setOpen(false)}>
            ✕
          </IconButton>
        }
        {...snackbarProps}
      />
    </>
  );
}

export function SnackbarPage() {
  return (
    <>
      <h1>Snackbar</h1>
      <p className="docs-lede">
        A brief message pinned to a corner of the viewport. It is always controlled through{' '}
        <code>open</code>; nothing dismisses it on its own unless you set{' '}
        <code>autoHideDuration</code>, which is <code>null</code> by default.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <TriggerSnackbar label="Show message">Your changes have been saved.</TriggerSnackbar>
          <TriggerSnackbar label="Auto-hide after 3s" autoHideDuration={3000}>
            This one closes itself.
          </TriggerSnackbar>
        </div>
      </Demo>
      <Code>{`const [open, setOpen] = React.useState(false);

<Snackbar open={open} onClose={() => setOpen(false)} autoHideDuration={3000}>
  Your changes have been saved.
</Snackbar>`}</Code>

      <h2>Position</h2>
      <p>
        <code>anchorOrigin</code> takes a vertical and a horizontal edge. It defaults to the bottom
        right.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {ORIGINS.map((origin) => (
            <TriggerSnackbar
              key={`${origin.vertical}-${origin.horizontal}`}
              label={`${origin.vertical} ${origin.horizontal}`}
              anchorOrigin={origin}
            >
              Anchored {origin.vertical} {origin.horizontal}.
            </TriggerSnackbar>
          ))}
        </div>
      </Demo>
      <Code>{`<Snackbar
  open={open}
  onClose={close}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  Saved.
</Snackbar>`}</Code>

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
                    <TriggerSnackbar label={color.slice(0, 4)} variant={variant} color={color}>
                      {variant} / {color}
                    </TriggerSnackbar>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Demo>
      <Code>{`<Snackbar open={open} onClose={close} variant="solid" color="success">
  Deployed.
</Snackbar>`}</Code>

      <h2>Sizes and decorators</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <TriggerSnackbar key={size} label={size} size={size} startDecorator="✓">
              Size {size}.
            </TriggerSnackbar>
          ))}
        </div>
      </Demo>
      <Code>{`<Snackbar open={open} onClose={close} startDecorator="✓" endDecorator={
  <IconButton size="sm" variant="plain" color="neutral" onClick={close}>✕</IconButton>
}>
  Copied to clipboard.
</Snackbar>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'open', type: 'boolean', description: 'Whether the message is shown. Required.' },
          { name: 'onClose', type: '() => void', description: 'Called when the auto-hide timer elapses. Wire your own dismiss control to it too.' },
          { name: 'children', type: 'React.ReactNode', description: 'The message content.' },
          { name: 'autoHideDuration', type: 'number | null', default: 'null', description: 'Milliseconds before onClose fires. null keeps it open indefinitely.' },
          { name: 'anchorOrigin', type: '{ vertical: "top" | "bottom"; horizontal: "left" | "center" | "right" }', default: "{ vertical: 'bottom', horizontal: 'right' }", description: 'Corner or edge the message is pinned to.' },
          { name: 'startDecorator', type: 'React.ReactNode', description: 'Content rendered before the message.' },
          { name: 'endDecorator', type: 'React.ReactNode', description: 'Content rendered after the message — usually a dismiss button.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'outlined'", description: 'Visual style of the surface.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Padding, font size and distance from the viewport edge.' },
        ]}
      />
    </>
  );
}
