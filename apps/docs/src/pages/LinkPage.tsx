import { Link, Typography } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function LinkPage() {
  return (
    <>
      <h1>Link</h1>
      <p className="docs-lede">
        An anchor with Joy UI&apos;s typography and colour treatment. It differs from most
        components here in that <code>variant</code> is unset by default — a plain link is just
        coloured text — and its <code>color</code> defaults to <code>primary</code> rather than{' '}
        <code>neutral</code>.
      </p>

      <h2>Underline behaviour</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <Link href="#underline" underline="hover">
            Hover (default)
          </Link>
          <Link href="#underline" underline="always">
            Always
          </Link>
          <Link href="#underline" underline="none">
            None
          </Link>
        </div>
      </Demo>
      <Code>{`<Link href="/pricing" underline="always">Pricing</Link>`}</Code>

      <h2>Variants &amp; colors</h2>
      <p>
        Setting a <code>variant</code> gives the link a background and turns it into a chip-like
        target. Leave it unset for ordinary inline links.
      </p>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <Link href="#variants" variant={variant} color={color}>
              Link
            </Link>
          )}
        />
      </Demo>
      <Code>{`<Link href="/docs" variant="soft" color="success">Docs</Link>`}</Code>

      <h2>Inside a paragraph</h2>
      <Demo>
        <Typography level="body-md">
          Every token in this library was measured against the real{' '}
          <Link href="#inline">@mui/joy package</Link> rather than guessed — see the{' '}
          <Link href="#inline" color="neutral">
            design notes
          </Link>{' '}
          for the method.
        </Typography>
      </Demo>

      <h2>Decorators</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <Link href="#decorators" startDecorator="←">
            Back to overview
          </Link>
          <Link href="#decorators" endDecorator="↗">
            Open in new tab
          </Link>
        </div>
      </Demo>
      <Code>{`<Link href="https://example.com" endDecorator="↗">Open in new tab</Link>`}</Code>

      <h2>Disabled</h2>
      <Demo>
        <Link href="#disabled" disabled>
          Unavailable
        </Link>
      </Demo>

      <h2>Rendering as another element</h2>
      <p>
        <code>component</code> swaps the underlying element — useful for a router&apos;s own link
        component, which then receives <code>to</code> instead of <code>href</code>.
      </p>
      <Code>{`import { Link as RouterLink } from 'react-router-dom';

<Link component={RouterLink} to="/getting-started">
  Installation
</Link>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The link text.' },
          { name: 'href', type: 'string', description: 'Destination, as on a native anchor.' },
          { name: 'underline', type: "'none' | 'hover' | 'always'", default: "'hover'", description: 'When the underline is drawn.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: 'none', description: 'Optional background treatment. Unset renders plain coloured text.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'primary'", description: 'Text and background colour palette.' },
          { name: 'startDecorator', type: 'React.ReactNode', description: 'Content rendered before the text.' },
          { name: 'endDecorator', type: 'React.ReactNode', description: 'Content rendered after the text.' },
          { name: 'component', type: 'React.ElementType', default: "'a'", description: 'Element or component to render as.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims the link and blocks pointer events.' },
        ]}
      />
    </>
  );
}
