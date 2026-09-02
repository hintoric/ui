import { Sheet } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function SheetPage() {
  return (
    <>
      <h1>Sheet</h1>
      <p className="docs-lede">
        The base surface primitive other layout components (like Card) build on. It carries no
        border radius or padding of its own.
      </p>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <Sheet variant={variant} color={color} style={{ padding: 12 }}>
              {color}
            </Sheet>
          )}
        />
      </Demo>
      <Code>{`<Sheet variant="soft" color="primary">Content</Sheet>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'plain'", description: 'Visual style of the surface.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
          { name: 'component', type: 'React.ElementType', default: "'div'", description: 'Renders as a different element/component.' },
        ]}
      />
    </>
  );
}
