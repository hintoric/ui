import { Select, Option } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function SelectPage() {
  return (
    <>
      <h1>Select</h1>
      <p className="docs-lede">
        A listbox trigger built on Base UI&apos;s <code>Select.Root</code>. Options are declared as{' '}
        <code>&lt;Option&gt;</code> children rather than a data prop, matching Joy UI&apos;s API — the
        value-to-label lookup is built from those children, so an option&apos;s label can be arbitrary
        JSX and not just a string.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Select defaultValue="berlin" aria-label="City">
            <Option value="berlin">Berlin</Option>
            <Option value="hamburg">Hamburg</Option>
            <Option value="freiburg">Freiburg</Option>
          </Select>
          <Select placeholder="Pick a city…" aria-label="City, empty">
            <Option value="berlin">Berlin</Option>
            <Option value="hamburg">Hamburg</Option>
          </Select>
          <Select placeholder="Disabled" disabled aria-label="City, disabled">
            <Option value="berlin">Berlin</Option>
          </Select>
        </div>
      </Demo>
      <Code>{`<Select defaultValue="berlin" onChange={(value) => console.log(value)}>
  <Option value="berlin">Berlin</Option>
  <Option value="hamburg">Hamburg</Option>
</Select>`}</Code>

      <h2>Variants &amp; colors</h2>
      <p>
        The trigger carries the variant and color. <code>Option</code> has its own{' '}
        <code>variant</code>/<code>color</code> pair, defaulting to <code>plain</code>/
        <code>neutral</code> — it is not inherited from the trigger.
      </p>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <Select variant={variant} color={color} defaultValue="a" aria-label={`${variant}-${color}`}>
              <Option value="a">Option A</Option>
              <Option value="b">Option B</Option>
            </Select>
          )}
        />
      </Demo>
      <Code>{`<Select variant="soft" color="primary" defaultValue="a">
  <Option value="a">Option A</Option>
</Select>`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Select size="sm" defaultValue="sm" aria-label="small">
            <Option value="sm">Small</Option>
          </Select>
          <Select size="md" defaultValue="md" aria-label="medium">
            <Option value="md">Medium</Option>
          </Select>
          <Select size="lg" defaultValue="lg" aria-label="large">
            <Option value="lg">Large</Option>
          </Select>
        </div>
      </Demo>

      <h2>Decorators</h2>
      <p>
        <code>startDecorator</code> and <code>endDecorator</code> sit inside the trigger, beside the
        selected label. <code>indicator</code> replaces the unfold arrow.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Select defaultValue="eur" startDecorator="€" aria-label="Currency">
            <Option value="eur">Euro</Option>
            <Option value="usd">Dollar</Option>
          </Select>
          <Select defaultValue="asc" indicator="↕" aria-label="Sort order">
            <Option value="asc">Ascending</Option>
            <Option value="desc">Descending</Option>
          </Select>
        </div>
      </Demo>
      <Code>{`<Select defaultValue="eur" startDecorator="€" indicator="↕">
  <Option value="eur">Euro</Option>
</Select>`}</Code>

      <h2>Disabled options</h2>
      <Demo>
        <Select defaultValue="free" aria-label="Plan">
          <Option value="free">Free</Option>
          <Option value="pro">Pro</Option>
          <Option value="enterprise" disabled>
            Enterprise (contact sales)
          </Option>
        </Select>
      </Demo>

      <h2>Controlling the listbox</h2>
      <p>
        Open state is separate from value. <code>defaultListboxOpen</code> opens it initially;{' '}
        <code>listboxOpen</code> plus <code>onListboxOpenChange</code> control it fully. Both names
        match Joy UI rather than Base UI&apos;s <code>open</code>/<code>onOpenChange</code>.
      </p>
      <Code>{`const [open, setOpen] = React.useState(false);

<Select listboxOpen={open} onListboxOpenChange={setOpen} defaultValue="a">
  <Option value="a">Option A</Option>
</Select>`}</Code>

      <h2>Select props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The <Option> elements that make up the listbox.' },
          { name: 'value', type: 'Value | null', description: 'Selected value. Use when controlled.' },
          { name: 'defaultValue', type: 'Value | null', description: 'Initial selected value (uncontrolled).' },
          { name: 'onChange', type: '(value: Value | null) => void', description: 'Called with the new value when the selection changes.' },
          { name: 'placeholder', type: 'React.ReactNode', description: 'Shown in the trigger while nothing is selected.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'outlined'", description: 'Visual style of the trigger.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the trigger variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Trigger height, padding and font size.' },
          { name: 'startDecorator', type: 'React.ReactNode', description: 'Content rendered before the selected label.' },
          { name: 'endDecorator', type: 'React.ReactNode', description: 'Content rendered after the selected label, before the indicator.' },
          { name: 'indicator', type: 'React.ReactNode', default: 'unfold arrow', description: 'Replaces the default open/close indicator icon.' },
          { name: 'multiple', type: 'boolean', default: 'false', description: 'Allows selecting several options. Handled at runtime; value stays typed as a single Value.' },
          { name: 'listboxOpen', type: 'boolean', description: 'Controlled open state of the listbox popup.' },
          { name: 'defaultListboxOpen', type: 'boolean', default: 'false', description: 'Whether the listbox is open on first render.' },
          { name: 'onListboxOpenChange', type: '(open: boolean) => void', description: 'Called when the listbox opens or closes.' },
          { name: 'required', type: 'boolean', default: 'false', description: 'Marks the field as required for form validation.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the trigger.' },
        ]}
      />

      <h2>Option props</h2>
      <PropsTable
        rows={[
          { name: 'value', type: 'Value', description: 'The value reported to Select when this option is picked. Required.' },
          { name: 'children', type: 'React.ReactNode', description: 'The option label. Also used as the trigger label for the selected value.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'plain'", description: 'Visual style of the row.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the row variant.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Makes the option unselectable.' },
        ]}
      />

      <h2>Differences from Joy UI</h2>
      <p>
        Joy UI&apos;s Popper force-matches the listbox width to the trigger. This build uses{' '}
        <code>min-width: max-content</code> instead, so a listbox is never clipped narrower than its
        content but may be wider than the trigger. <code>value</code>/<code>onChange</code> are also
        typed as a single <code>Value</code> rather than Joy&apos;s overloaded{' '}
        <code>Value | Value[]</code>.
      </p>
    </>
  );
}
