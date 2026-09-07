import * as React from 'react';
import { Autocomplete } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const CITIES = ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Freiburg', 'Leipzig'];

interface Country {
  code: string;
  name: string;
}

const COUNTRIES: Country[] = [
  { code: 'de', name: 'Germany' },
  { code: 'at', name: 'Austria' },
  { code: 'ch', name: 'Switzerland' },
];

function ControlledAutocomplete() {
  const [value, setValue] = React.useState<string | null>('Berlin');
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Autocomplete options={CITIES} value={value} onChange={setValue} placeholder="City" />
      <code>{value ?? 'null'}</code>
    </div>
  );
}

export function AutocompletePage() {
  return (
    <>
      <h1>Autocomplete</h1>
      <p className="docs-lede">
        A text input that filters a list as you type, built on Base UI&apos;s{' '}
        <code>Combobox</code>. Options come from the <code>options</code> array rather than from
        children, and any non-string value is turned into a label by{' '}
        <code>getOptionLabel</code>.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Autocomplete options={CITIES} placeholder="Pick a city…" aria-label="City" />
          <Autocomplete options={CITIES} defaultValue="Munich" aria-label="City, preselected" />
          <Autocomplete options={CITIES} placeholder="Disabled" disabled aria-label="City, disabled" />
        </div>
      </Demo>
      <Code>{`<Autocomplete
  options={['Berlin', 'Hamburg', 'Munich']}
  placeholder="Pick a city…"
  onChange={(value) => console.log(value)}
/>`}</Code>

      <h2>Controlled</h2>
      <p>
        <code>value</code>/<code>onChange</code> track the committed selection.{' '}
        <code>inputValue</code>/<code>onInputChange</code> track the raw text, which is a separate
        piece of state.
      </p>
      <Demo>
        <ControlledAutocomplete />
      </Demo>
      <Code>{`const [value, setValue] = React.useState<string | null>('Berlin');

<Autocomplete options={CITIES} value={value} onChange={setValue} />`}</Code>

      <h2>Object options</h2>
      <p>
        With non-string options, <code>getOptionLabel</code> supplies both the list label and the
        text written into the input on selection.
      </p>
      <Demo>
        <Autocomplete
          options={COUNTRIES}
          getOptionLabel={(country) => country.name}
          placeholder="Country"
          aria-label="Country"
        />
      </Demo>
      <Code>{`<Autocomplete
  options={[{ code: 'de', name: 'Germany' }]}
  getOptionLabel={(country) => country.name}
/>`}</Code>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <Autocomplete
              options={CITIES}
              variant={variant}
              color={color}
              defaultValue="Berlin"
              aria-label={`${variant}-${color}`}
            />
          )}
        />
      </Demo>
      <Code>{`<Autocomplete options={CITIES} variant="soft" color="primary" />`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Autocomplete options={CITIES} size="sm" defaultValue="Berlin" aria-label="small" />
          <Autocomplete options={CITIES} size="md" defaultValue="Berlin" aria-label="medium" />
          <Autocomplete options={CITIES} size="lg" defaultValue="Berlin" aria-label="large" />
        </div>
      </Demo>

      <h2>Decorator and clear button</h2>
      <p>
        A clear (&ldquo;×&rdquo;) button appears once something is selected.{' '}
        <code>disableClearable</code> removes it.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Autocomplete options={CITIES} defaultValue="Leipzig" startDecorator="🔍" aria-label="With decorator" />
          <Autocomplete options={CITIES} defaultValue="Leipzig" disableClearable aria-label="Not clearable" />
        </div>
      </Demo>
      <Code>{`<Autocomplete options={CITIES} startDecorator="🔍" disableClearable />`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'options', type: 'readonly Value[]', description: 'The selectable values. Required.' },
          { name: 'getOptionLabel', type: '(value: Value) => string', default: 'String(value)', description: 'Turns an option into its display label.' },
          { name: 'value', type: 'Value | null', description: 'Selected option. Use when controlled.' },
          { name: 'defaultValue', type: 'Value | null', description: 'Initially selected option (uncontrolled).' },
          { name: 'onChange', type: '(value: Value | null) => void', description: 'Called when an option is picked or cleared.' },
          { name: 'inputValue', type: 'string', description: 'Raw text in the input. Use when controlled.' },
          { name: 'onInputChange', type: '(value: string) => void', description: 'Called as the typed text changes.' },
          { name: 'placeholder', type: 'string', description: 'Placeholder text for the input.' },
          { name: 'startDecorator', type: 'React.ReactNode', description: 'Content rendered before the input.' },
          { name: 'disableClearable', type: 'boolean', default: 'false', description: 'Hides the built-in clear button.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'outlined'", description: 'Visual style of the input.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Input height, padding and font size.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input.' },
        ]}
      />

      <h2>AutocompleteOption</h2>
      <p>
        The rows are rendered as <code>AutocompleteOption</code>, exported for custom option
        rendering. It matches <code>Option</code> from Select, except that a selected row also gets
        a font-weight bump — a rule Joy UI applies here but not in Select&apos;s listbox.
      </p>
      <PropsTable
        rows={[
          { name: 'value', type: 'Value', description: 'The value this row represents. Required.' },
          { name: 'children', type: 'React.ReactNode', description: 'The row content.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'plain'", description: 'Visual style of the row.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the row variant.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Makes the row unselectable.' },
        ]}
      />
    </>
  );
}
