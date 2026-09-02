import { Button } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function ButtonPage() {
  return (
    <>
      <h1>Button</h1>
      <p className="docs-lede">Buttons trigger an action, styled with Joy UI&apos;s variant/color system.</p>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <Button variant={variant} color={color}>
              {color}
            </Button>
          )}
        />
      </Demo>
      <Code>{`<Button variant="solid" color="primary">Save</Button>`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </Demo>

      <h2>Loading &amp; disabled</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Demo>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'solid'", description: 'Visual style of the button.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'primary'", description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls height, padding and font size.' },
          { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a loading state and disables interaction.' },
          { name: 'startDecorator', type: 'React.ReactNode', description: 'Element rendered before the label.' },
          { name: 'endDecorator', type: 'React.ReactNode', description: 'Element rendered after the label.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Native disabled state.' },
        ]}
      />
    </>
  );
}
