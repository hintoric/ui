import { Input } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function InputPage() {
  return (
    <>
      <h1>Input</h1>
      <p className="docs-lede">
        A single-line text field. <code>color</code> also controls the focus ring — click into any
        field below to see it (Joy UI maps <code>neutral</code>&apos;s focus ring to primary blue, same
        here).
      </p>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => <Input variant={variant} color={color} placeholder={color} />}
        />
      </Demo>
      <Code>{`<Input variant="outlined" color="neutral" placeholder="Email" />`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Input size="sm" placeholder="Small" />
          <Input size="md" placeholder="Medium" />
          <Input size="lg" placeholder="Large" />
        </div>
      </Demo>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'outlined'", description: 'Visual style of the field.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette; also drives the focus ring color.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls height and padding.' },
          { name: 'startDecorator', type: 'React.ReactNode', description: 'Element rendered before the input.' },
          { name: 'endDecorator', type: 'React.ReactNode', description: 'Element rendered after the input.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Native disabled state.' },
        ]}
      />
    </>
  );
}
