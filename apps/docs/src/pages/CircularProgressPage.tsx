import { CircularProgress, Typography } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function CircularProgressPage() {
  return (
    <>
      <h1>CircularProgress</h1>
      <p className="docs-lede">
        A ring that either spins indefinitely or fills to a known percentage. It defaults to{' '}
        <code>soft</code>/<code>primary</code> — one of the few components whose colour is not{' '}
        <code>neutral</code> out of the box.
      </p>

      <h2>Indeterminate and determinate</h2>
      <p>
        Without <code>determinate</code> the ring spins and <code>value</code> is fixed at 25 to
        give the arc a visible length. With it, <code>value</code> is a percentage from 0 to 100.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <CircularProgress />
          <CircularProgress determinate value={25} />
          <CircularProgress determinate value={60} />
          <CircularProgress determinate value={100} />
        </div>
      </Demo>
      <Code>{`<CircularProgress />
<CircularProgress determinate value={60} />`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <CircularProgress size="sm" determinate value={70} />
          <CircularProgress size="md" determinate value={70} />
          <CircularProgress size="lg" determinate value={70} />
        </div>
      </Demo>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <CircularProgress variant={variant} color={color} determinate value={70} />
          )}
        />
      </Demo>
      <Code>{`<CircularProgress variant="outlined" color="success" determinate value={70} />`}</Code>

      <h2>Thickness</h2>
      <p>
        Each size ships a matching stroke width. <code>thickness</code> overrides it, in pixels.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <CircularProgress determinate value={65} thickness={2} />
          <CircularProgress determinate value={65} />
          <CircularProgress determinate value={65} thickness={8} />
        </div>
      </Demo>
      <Code>{`<CircularProgress determinate value={65} thickness={8} />`}</Code>

      <h2>With a label inside</h2>
      <p>Children render in the middle of the ring.</p>
      <Demo>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <CircularProgress size="lg" determinate value={42}>
            <Typography level="body-xs">42%</Typography>
          </CircularProgress>
          <CircularProgress size="lg" determinate value={88} color="success">
            <Typography level="body-xs">88%</Typography>
          </CircularProgress>
        </div>
      </Demo>
      <Code>{`<CircularProgress size="lg" determinate value={42}>
  <Typography level="body-xs">42%</Typography>
</CircularProgress>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'determinate', type: 'boolean', default: 'false', description: 'Switches from a spinning arc to a value-driven ring.' },
          { name: 'value', type: 'number', default: '25 (indeterminate) / 0 (determinate)', description: 'Percentage filled, 0 to 100. Only meaningful when determinate.' },
          { name: 'thickness', type: 'number', default: 'per size', description: 'Stroke width in pixels.' },
          { name: 'children', type: 'React.ReactNode', description: 'Content centred inside the ring.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'soft'", description: 'Visual style of the track and arc.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'primary'", description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Ring diameter and default stroke width.' },
        ]}
      />
    </>
  );
}
