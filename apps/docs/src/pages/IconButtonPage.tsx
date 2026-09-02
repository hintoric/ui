import { IconButton } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function IconButtonPage() {
  return (
    <>
      <h1>IconButton</h1>
      <p className="docs-lede">A square button for a single icon, sharing Button&apos;s variant/color/size API.</p>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <IconButton variant={variant} color={color} aria-label={color}>
              +
            </IconButton>
          )}
        />
      </Demo>
      <Code>{`<IconButton variant="soft" color="danger" aria-label="Delete">
  <TrashIcon />
</IconButton>`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <IconButton size="sm" aria-label="small">+</IconButton>
          <IconButton size="md" aria-label="medium">+</IconButton>
          <IconButton size="lg" aria-label="large">+</IconButton>
        </div>
      </Demo>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'solid'", description: 'Visual style of the button.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'primary'", description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls the square dimensions.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Native disabled state.' },
        ]}
      />
    </>
  );
}
