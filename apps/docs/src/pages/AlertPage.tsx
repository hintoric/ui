import { Alert, AlertTitle } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function AlertPage() {
  return (
    <>
      <h1>Alert</h1>
      <p className="docs-lede">
        A banner-style callout for a message, warning, or status — renders with{' '}
        <code>role=&quot;alert&quot;</code> by default, and with the icon for its colour on the left.
      </p>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <Alert variant={variant} color={color}>
              {color}
            </Alert>
          )}
        />
      </Demo>
      <Code>{`<Alert variant="soft" color="danger">
  Something went wrong.
</Alert>`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Alert size="sm">Small</Alert>
          <Alert size="md">Medium</Alert>
          <Alert size="lg">Large</Alert>
        </div>
      </Demo>

      <h2>Icons</h2>
      <p>
        Every alert shows the icon for its colour unless told otherwise, so its kind reads without relying on colour
        alone: info for <code>primary</code> and <code>neutral</code>, report for <code>danger</code>, a check for{' '}
        <code>success</code> and a warning sign for <code>warning</code> — the icons Joy&rsquo;s own demos use. It is
        20px up to <code>md</code> and 24px at <code>lg</code>, in the alert&rsquo;s text colour, and stays on the first
        line. A <code>startDecorator</code> replaces it; <code>startDecorator={'{null}'}</code> leaves it out.{' '}
        <code>AlertIcon</code> renders one on its own.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {COLORS.map((color) => (
            <Alert key={color} color={color}>
              {color}
            </Alert>
          ))}
          <Alert color="warning" startDecorator={null}>
            Without an icon
          </Alert>
        </div>
      </Demo>
      <Code>{`<Alert color="warning">Your session is about to expire.</Alert>
<Alert color="warning" startDecorator={null}>Without an icon</Alert>
<Alert color="primary" startDecorator={<CalendarIcon />}>Your own icon</Alert>`}</Code>

      <h2>Title and multi-line content</h2>
      <p>
        Decorators are top-aligned: the icon sits on the first line, so it stays next to the title however long the
        content gets. <code>AlertTitle</code> is 16px / semibold; body text below it keeps the alert&apos;s size, with{' '}
        <code>font-normal</code> for a regular weight. <code>Snackbar</code> aligns its decorators the same way.
      </p>
      <Demo>
        <Alert color="primary" className="px-4 py-1.5 rounded">
          <AlertTitle>Heads up</AlertTitle>
          <div className="font-normal">First line of text.</div>
          <div className="font-normal">Second line of text.</div>
        </Alert>
      </Demo>
      <Code>{`<Alert color="primary">
  <AlertTitle>Heads up</AlertTitle>
  <div className="font-normal">First line of text.</div>
  <div className="font-normal">Second line of text.</div>
</Alert>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'soft'", description: 'Visual style of the alert.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls padding, gap and font size.' },
          {
            name: 'startDecorator',
            type: 'React.ReactNode',
            default: '<AlertIcon color={color} />',
            description: 'Element rendered before the content, aligned to the first line. Replaces the default icon; null shows none.',
          },
          { name: 'endDecorator', type: 'React.ReactNode', description: 'Element rendered after the content (e.g. a close button).' },
          { name: 'role', type: 'string', default: "'alert'", description: 'ARIA role of the element.' },
          { name: 'component', type: 'React.ElementType', default: "'div'", description: 'Renders as a different element/component.' },
        ]}
      />
    </>
  );
}
