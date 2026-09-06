import { Breadcrumbs, Link, Typography } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

export function BreadcrumbsPage() {
  return (
    <>
      <h1>Breadcrumbs</h1>
      <p className="docs-lede">
        Shows where a page sits in a hierarchy. Each child becomes one{' '}
        <code>&lt;li&gt;</code> in an ordered list inside a labelled <code>&lt;nav&gt;</code>, with
        an <code>aria-hidden</code> separator injected between them — so the separator never reaches
        a screen reader.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <Breadcrumbs>
          <Link href="#home" color="neutral">
            Home
          </Link>
          <Link href="#components" color="neutral">
            Components
          </Link>
          <Typography>Breadcrumbs</Typography>
        </Breadcrumbs>
      </Demo>
      <Code>{`<Breadcrumbs>
  <Link href="/" color="neutral">Home</Link>
  <Link href="/components" color="neutral">Components</Link>
  <Typography>Breadcrumbs</Typography>
</Breadcrumbs>`}</Code>

      <h2>Custom separator</h2>
      <p>
        The default separator is a slash. Any node works — a character, an icon, or a styled
        element.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Breadcrumbs separator="›">
            <Link href="#a" color="neutral">
              Home
            </Link>
            <Link href="#b" color="neutral">
              Library
            </Link>
            <Typography>Data</Typography>
          </Breadcrumbs>
          <Breadcrumbs separator="•">
            <Link href="#a" color="neutral">
              Home
            </Link>
            <Link href="#b" color="neutral">
              Library
            </Link>
            <Typography>Data</Typography>
          </Breadcrumbs>
          <Breadcrumbs separator="→">
            <Link href="#a" color="neutral">
              Home
            </Link>
            <Typography>Data</Typography>
          </Breadcrumbs>
        </div>
      </Demo>
      <Code>{`<Breadcrumbs separator="›">…</Breadcrumbs>`}</Code>

      <h2>Sizes</h2>
      <p>
        Breadcrumbs maps its size straight onto the body scale — <code>sm</code> is 14px,{' '}
        <code>md</code> 16px, <code>lg</code> 18px. Chip, Alert and Badge shift that mapping down a
        step; this one does not.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Breadcrumbs size="sm">
            <Link href="#sm" color="neutral">
              Home
            </Link>
            <Typography>Small</Typography>
          </Breadcrumbs>
          <Breadcrumbs size="md">
            <Link href="#md" color="neutral">
              Home
            </Link>
            <Typography>Medium</Typography>
          </Breadcrumbs>
          <Breadcrumbs size="lg">
            <Link href="#lg" color="neutral">
              Home
            </Link>
            <Typography>Large</Typography>
          </Breadcrumbs>
        </div>
      </Demo>

      <h2>With decorators</h2>
      <Demo>
        <Breadcrumbs separator="›">
          <Link href="#home" color="neutral" startDecorator="⌂">
            Home
          </Link>
          <Link href="#settings" color="neutral">
            Settings
          </Link>
          <Typography>Billing</Typography>
        </Breadcrumbs>
      </Demo>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'One node per crumb. Separators are inserted between them.' },
          { name: 'separator', type: 'React.ReactNode', default: "'/'", description: 'Node drawn between crumbs. Rendered aria-hidden.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Font size and padding of the whole trail.' },
        ]}
      />
    </>
  );
}
