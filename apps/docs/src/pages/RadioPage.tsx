import { Radio, RadioGroup } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function RadioPage() {
  return (
    <>
      <h1>Radio</h1>
      <p className="docs-lede">
        A single choice out of several, built on Base UI&apos;s <code>Radio.Root</code>. Like
        Checkbox, an unset <code>color</code> follows Joy UI&apos;s own switching logic: unchecked is{' '}
        <code>neutral</code>, checked is <code>primary</code>. <code>RadioGroup</code> owns the
        selected value and drives every child&apos;s checked state.
      </p>

      <h2>A group of radios</h2>
      <Demo>
        <RadioGroup defaultValue="standard" name="shipping">
          <Radio value="standard" label="Standard (3–5 days)" />
          <Radio value="express" label="Express (next day)" />
          <Radio value="pickup" label="Local pickup" />
          <Radio value="freight" label="Freight (unavailable)" disabled />
        </RadioGroup>
      </Demo>
      <Code>{`<RadioGroup defaultValue="standard" name="shipping" onChange={(value) => console.log(value)}>
  <Radio value="standard" label="Standard (3–5 days)" />
  <Radio value="express" label="Express (next day)" />
</RadioGroup>`}</Code>

      <h2>Orientation</h2>
      <p>
        <code>RadioGroup</code> stacks vertically by default — the opposite of a plain flex row, and
        the same default Joy UI uses.
      </p>
      <Demo>
        <RadioGroup defaultValue="md" orientation="horizontal" name="size-demo">
          <Radio value="sm" label="Small" />
          <Radio value="md" label="Medium" />
          <Radio value="lg" label="Large" />
        </RadioGroup>
      </Demo>
      <Code>{`<RadioGroup orientation="horizontal" defaultValue="md">…</RadioGroup>`}</Code>

      <h2>Explicit variant &amp; colors</h2>
      <p>Passing a color pins it for both the checked and the unchecked state.</p>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <Radio aria-label={`${variant}-${color}`} variant={variant} color={color} defaultChecked />
          )}
        />
      </Demo>
      <Code>{`<Radio variant="soft" color="danger" value="a" />`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Radio aria-label="small" size="sm" defaultChecked />
          <Radio aria-label="medium" size="md" defaultChecked />
          <Radio aria-label="large" size="lg" defaultChecked />
        </div>
      </Demo>

      <h2>Without the dot</h2>
      <p>
        <code>disableIcon</code> drops the inner dot, leaving the variant background to carry the
        checked state — useful for card-style pickers.
      </p>
      <Demo>
        <RadioGroup defaultValue="b" orientation="horizontal" name="disable-icon">
          <Radio value="a" label="Option A" disableIcon variant="soft" />
          <Radio value="b" label="Option B" disableIcon variant="soft" />
        </RadioGroup>
      </Demo>

      <h2>Radio props</h2>
      <PropsTable
        rows={[
          { name: 'value', type: 'unknown', description: 'Identifies this radio inside its RadioGroup.' },
          { name: 'label', type: 'React.ReactNode', description: 'Wraps the radio and its text in a <label>.' },
          { name: 'checked', type: 'boolean', description: 'Controlled checked state. Usually left to RadioGroup.' },
          { name: 'defaultChecked', type: 'boolean', default: 'false', description: 'Initial checked state (uncontrolled).' },
          { name: 'onCheckedChange', type: '(checked: boolean) => void', description: 'Called when this radio becomes checked or unchecked.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'outlined'", description: 'Visual style of the circle.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: 'auto (neutral unchecked, primary checked)', description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Circle dimensions and label font size.' },
          { name: 'disableIcon', type: 'boolean', default: 'false', description: 'Hides the inner dot.' },
          { name: 'name', type: 'string', description: 'Form field name. Inherited from RadioGroup when unset.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables interaction.' },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'Prevents changes but keeps the radio focusable.' },
          { name: 'required', type: 'boolean', default: 'false', description: 'Marks the field as required for form validation.' },
        ]}
      />

      <h2>RadioGroup props</h2>
      <PropsTable
        rows={[
          { name: 'value', type: 'unknown', description: 'Selected value. Use when controlled.' },
          { name: 'defaultValue', type: 'unknown', description: 'Initially selected value (uncontrolled).' },
          { name: 'onChange', type: '(value: unknown) => void', description: 'Called with the newly selected value.' },
          { name: 'name', type: 'string', description: 'Form field name passed down to every child radio.' },
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'vertical'", description: 'Layout direction of the group.' },
        ]}
      />
    </>
  );
}
