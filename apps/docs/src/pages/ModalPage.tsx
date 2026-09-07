import * as React from 'react';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  ModalOverflow,
  Typography,
} from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

function BasicModal() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="outlined" color="neutral" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog>
          <ModalClose onClick={() => setOpen(false)} />
          <DialogTitle>Delete this project?</DialogTitle>
          <DialogContent>
            Everything inside it goes too. This cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button variant="plain" color="neutral" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="solid" color="danger" onClick={() => setOpen(false)}>
              Delete
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </>
  );
}

function VariantModal({ variant, color }: { variant: JoyVariant; color: JoyColor }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button size="sm" variant="plain" color="neutral" onClick={() => setOpen(true)}>
        {color.slice(0, 4)}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog variant={variant} color={color}>
          <ModalClose onClick={() => setOpen(false)} />
          <DialogTitle>
            {variant} / {color}
          </DialogTitle>
          <DialogContent>The dialog surface carries the variant and colour.</DialogContent>
        </ModalDialog>
      </Modal>
    </>
  );
}

function OverflowModal() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="outlined" color="neutral" onClick={() => setOpen(true)}>
        Open long dialog
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalOverflow>
          <ModalDialog>
            <ModalClose onClick={() => setOpen(false)} />
            <DialogTitle>Terms</DialogTitle>
            <DialogContent>
              {Array.from({ length: 20 }, (_unused, index) => (
                <Typography key={index} level="body-md">
                  Paragraph {index + 1} of a document that is taller than the viewport.
                </Typography>
              ))}
            </DialogContent>
            <DialogActions>
              <Button variant="solid" color="primary" onClick={() => setOpen(false)}>
                Accept
              </Button>
            </DialogActions>
          </ModalDialog>
        </ModalOverflow>
      </Modal>
    </>
  );
}

function FullscreenModal() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="outlined" color="neutral" onClick={() => setOpen(true)}>
        Open fullscreen
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog layout="fullscreen">
          <ModalClose onClick={() => setOpen(false)} />
          <DialogTitle>Fullscreen layout</DialogTitle>
          <DialogContent>The dialog fills the viewport and drops its corner radius.</DialogContent>
        </ModalDialog>
      </Modal>
    </>
  );
}

export function ModalPage() {
  return (
    <>
      <h1>Modal</h1>
      <p className="docs-lede">
        A dialog layer built on Base UI&apos;s <code>Dialog</code>. <code>Modal</code> itself is
        only the portal, backdrop and focus trap — the visible box is <code>ModalDialog</code>,
        rendered as its child, with <code>DialogTitle</code>, <code>DialogContent</code> and{' '}
        <code>DialogActions</code> inside it.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <BasicModal />
      </Demo>
      <Code>{`const [open, setOpen] = React.useState(false);

<Modal open={open} onClose={() => setOpen(false)}>
  <ModalDialog>
    <ModalClose onClick={() => setOpen(false)} />
    <DialogTitle>Delete this project?</DialogTitle>
    <DialogContent>Everything inside it goes too.</DialogContent>
    <DialogActions>
      <Button variant="plain" color="neutral" onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="solid" color="danger">Delete</Button>
    </DialogActions>
  </ModalDialog>
</Modal>`}</Code>

      <h2>Variants &amp; colors</h2>
      <p>
        These live on <code>ModalDialog</code>, not on <code>Modal</code> — the backdrop layer has
        no visual props of its own.
      </p>
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
                    <VariantModal variant={variant} color={color} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Demo>
      <Code>{`<ModalDialog variant="soft" color="danger">…</ModalDialog>`}</Code>

      <h2>Fullscreen layout</h2>
      <Demo>
        <FullscreenModal />
      </Demo>
      <Code>{`<ModalDialog layout="fullscreen">…</ModalDialog>`}</Code>

      <h2>Content taller than the viewport</h2>
      <p>
        Wrap the dialog in <code>ModalOverflow</code> to scroll the whole box instead of clipping
        it.
      </p>
      <Demo>
        <OverflowModal />
      </Demo>
      <Code>{`<Modal open={open} onClose={close}>
  <ModalOverflow>
    <ModalDialog>…</ModalDialog>
  </ModalOverflow>
</Modal>`}</Code>

      <h2>Modal props</h2>
      <PropsTable
        rows={[
          { name: 'open', type: 'boolean', description: 'Whether the dialog is shown. Required — Modal is always controlled.' },
          { name: 'onClose', type: '() => void', description: 'Called on backdrop click, Escape, or any other dismissal.' },
          { name: 'children', type: 'React.ReactNode', description: 'Usually a single ModalDialog. Required.' },
          { name: 'keepMounted', type: 'boolean', default: 'false', description: 'Keeps the content in the DOM while closed.' },
        ]}
      />

      <h2>ModalDialog props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The dialog content.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'outlined'", description: 'Visual style of the dialog surface.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Padding and gap inside the dialog.' },
          { name: 'layout', type: "'center' | 'fullscreen'", default: "'center'", description: 'Centred box, or filling the whole viewport.' },
        ]}
      />

      <h2>DialogTitle props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The heading text. Renders an <h2>.' },
          { name: 'level', type: 'TypographyLevel', default: "'title-lg'", description: 'Typography level applied to the heading.' },
        ]}
      />

      <h2>The remaining parts</h2>
      <p>
        <code>DialogContent</code> (a <code>&lt;p&gt;</code>), <code>DialogActions</code> (a right-
        aligned button row), <code>ModalOverflow</code> (a scroll container) and{' '}
        <code>ModalClose</code> (a corner close button) take no props beyond their element&apos;s
        own attributes. <code>ModalClose</code> defaults its <code>aria-label</code> to{' '}
        <code>&quot;Close&quot;</code>; pass <code>onClick</code> to wire it to your close handler.
      </p>
    </>
  );
}
