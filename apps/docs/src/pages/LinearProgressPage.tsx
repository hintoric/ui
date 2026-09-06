import { LinearProgress } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function LinearProgressPage() {
  return (
    <>
      <h1>LinearProgress</h1>
      <p className="docs-lede">
        A horizontal bar for the same job <code>CircularProgress</code> does in a ring: an
        indefinite wait, or a known percentage. It shares that component&apos;s{' '}
        <code>soft</code>/<code>primary</code> defaults and its prop names.
      </p>

      <h2>Indeterminate and determinate</h2>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 360 }}>
          <LinearProgress />
          <LinearProgress determinate value={25} />
          <LinearProgress determinate value={60} />
          <LinearProgress determinate value={100} />
        </div>
      </Demo>
      <Code>{`<LinearProgress />
<LinearProgress determinate value={60} />`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 360 }}>
          <LinearProgress size="sm" determinate value={70} />
          <LinearProgress size="md" determinate value={70} />
          <LinearProgress size="lg" determinate value={70} />
        </div>
      </Demo>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <div style={{ width: 84 }}>
              <LinearProgress variant={variant} color={color} determinate value={70} />
            </div>
          )}
        />
      </Demo>
      <Code>{`<LinearProgress variant="outlined" color="danger" determinate value={70} />`}</Code>

      <h2>Thickness</h2>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 360 }}>
          <LinearProgress determinate value={55} thickness={2} />
          <LinearProgress determinate value={55} />
          <LinearProgress determinate value={55} thickness={16} />
        </div>
      </Demo>
      <Code>{`<LinearProgress determinate value={55} thickness={16} />`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'determinate', type: 'boolean', default: 'false', description: 'Switches from a sliding bar to a value-driven fill.' },
          { name: 'value', type: 'number', default: '25 (indeterminate) / 0 (determinate)', description: 'Percentage filled, 0 to 100. Only meaningful when determinate.' },
          { name: 'thickness', type: 'number', default: 'per size', description: 'Bar height in pixels.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'soft'", description: 'Visual style of the track and fill.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'primary'", description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Default bar height.' },
        ]}
      />
    </>
  );
}
