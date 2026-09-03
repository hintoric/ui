import { Checkbox } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function CheckboxPage() {
  return (
    <>
      <h1>Checkbox</h1>
      <p className="docs-lede">
        A binary control, built on Base UI&apos;s <code>Checkbox.Root</code>. Leave <code>variant</code>/
        <code>color</code> unset and Joy UI&apos;s own logic takes over: unchecked defaults to{' '}
        <code>outlined</code>/<code>neutral</code>, checked (or indeterminate) switches to{' '}
        <code>solid</code>/<code>primary</code>.
      </p>

      <h2>Default state switching</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Checkbox label="Unchecked" />
          <Checkbox label="Checked" defaultChecked />
          <Checkbox label="Indeterminate" indeterminate />
          <Checkbox label="Disabled" disabled />
        </div>
      </Demo>
      <Code>{`<Checkbox label="Accept terms" />`}</Code>

      <h2>Explicit variant &amp; colors</h2>
      <p>Passing a variant/color pins it for both checked and unchecked states.</p>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => <Checkbox aria-label={`${variant}-${color}`} variant={variant} color={color} defaultChecked />}
        />
      </Demo>
      <Code>{`<Checkbox variant="soft" color="danger" />`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Checkbox aria-label="small" size="sm" defaultChecked />
          <Checkbox aria-label="medium" size="md" defaultChecked />
          <Checkbox aria-label="large" size="lg" defaultChecked />
        </div>
      </Demo>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'checked', type: 'boolean', description: 'Controlled checked state.' },
          { name: 'defaultChecked', type: 'boolean', default: 'false', description: 'Initial checked state (uncontrolled).' },
          { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Shows a mixed/dash icon and switches to the active variant/color.' },
          { name: 'onCheckedChange', type: '(checked: boolean) => void', description: 'Called when the checkbox is ticked or unticked.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: 'auto (outlined unchecked, solid checked)', description: 'Visual style of the box.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: 'auto (neutral unchecked, primary checked)', description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls the box dimensions.' },
          { name: 'disableIcon', type: 'boolean', default: 'false', description: 'Hides the check/indeterminate icon.' },
          { name: 'label', type: 'React.ReactNode', description: 'Wraps the checkbox and label text in a <label>.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables interaction.' },
        ]}
      />
    </>
  );
}
