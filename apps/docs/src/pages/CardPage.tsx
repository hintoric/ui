import { Card } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function CardPage() {
  return (
    <>
      <h1>Card</h1>
      <p className="docs-lede">
        A Sheet composition with its own border radius, padding and a vertical flex layout for its
        children.
      </p>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <Card variant={variant} color={color}>
              {color}
            </Card>
          )}
        />
      </Demo>
      <Code>{`<Card variant="outlined" color="neutral">
  <Typography level="title-md">Title</Typography>
  <Typography level="body-sm">Description text.</Typography>
</Card>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'outlined'", description: 'Visual style of the card.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
          { name: 'component', type: 'React.ElementType', default: "'div'", description: 'Renders as a different element/component.' },
        ]}
      />
    </>
  );
}
