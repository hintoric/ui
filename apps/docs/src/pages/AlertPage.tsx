import { Alert } from '@hintoric/ui';
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
        <code>role=&quot;alert&quot;</code> by default.
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

      <h2>Decorators</h2>
      <Demo>
        <Alert startDecorator={<span>⚠️</span>} color="warning">
          Your session is about to expire.
        </Alert>
      </Demo>
      <Code>{`<Alert startDecorator={<WarningIcon />} color="warning">
  Your session is about to expire.
</Alert>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'soft'", description: 'Visual style of the alert.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls padding, gap and font size.' },
          { name: 'startDecorator', type: 'React.ReactNode', description: 'Element rendered before the content (e.g. an icon).' },
          { name: 'endDecorator', type: 'React.ReactNode', description: 'Element rendered after the content (e.g. a close button).' },
          { name: 'role', type: 'string', default: "'alert'", description: 'ARIA role of the element.' },
          { name: 'component', type: 'React.ElementType', default: "'div'", description: 'Renders as a different element/component.' },
        ]}
      />
    </>
  );
}
