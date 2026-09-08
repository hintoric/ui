import { AddressAutofill, Form } from '@hintoric/ui';
import type { AddressSuggestion, JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const CONTENT_PROPS = {
  belowMinLengthContent: 'Mindestens 2 Zeichen eingeben.',
  loadingContent: 'Suche läuft…',
  noResultsContent: 'Keine Adresse gefunden.',
  errorContent: 'Adressen konnten nicht geladen werden.',
};

interface AddressFormValues {
  address: AddressSuggestion | null;
}

type GridFormValues = Record<string, AddressSuggestion | null>;

const GRID_DEFAULT_VALUES: GridFormValues = Object.fromEntries(
  VARIANTS.flatMap((variant) => COLORS.map((color) => [`address-${variant}-${color}`, null])),
);

function AddressAutofillDemo() {
  return (
    <Form<AddressFormValues> defaultValues={{ address: null }} onSubmit={() => {}}>
      {(form) => {
        const selected = form.watch('address');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
            <AddressAutofill
              name="address"
              label="Adresse"
              placeholder="Straße, PLZ oder Ort"
              {...CONTENT_PROPS}
            />
            <code>{selected ? JSON.stringify(selected) : 'null'}</code>
          </div>
        );
      }}
    </Form>
  );
}

export function AddressAutofillPage() {
  return (
    <>
      <h1>AddressAutofill</h1>
      <p className="docs-lede">
        A combobox that searches German addresses (postal code, city, street) against the free{' '}
        <code>autofill.api.hintoric.cloud</code> lookup as you type, and returns the matched
        address as a structured object on selection. It always binds to a <code>name</code> inside
        a <code>Form</code> — there is no standalone/uncontrolled mode.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <Form<AddressFormValues> defaultValues={{ address: null }} onSubmit={() => {}}>
          <AddressAutofill
            name="address"
            label="Adresse"
            placeholder="Straße, PLZ oder Ort"
            {...CONTENT_PROPS}
          />
        </Form>
      </Demo>
      <Code>{`<Form onSubmit={(values) => save(values)}>
  <AddressAutofill
    name="address"
    label="Adresse"
    placeholder="Straße, PLZ oder Ort"
    belowMinLengthContent="Mindestens 2 Zeichen eingeben."
    loadingContent="Suche läuft…"
    noResultsContent="Keine Adresse gefunden."
    errorContent="Adressen konnten nicht geladen werden."
  />
</Form>`}</Code>

      <h2>Watching the selected value</h2>
      <p>
        There is no <code>value</code>/<code>onChange</code> on the field itself — read the
        selection back with <code>form.watch(name)</code>, the same pattern used on the{' '}
        <a href="/forms">Forms</a> page.
      </p>
      <Demo>
        <AddressAutofillDemo />
      </Demo>
      <Code>{`const selected = form.watch('address');
// { postalCode, city, street, borough, suburb } | null`}</Code>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <Form<GridFormValues> defaultValues={GRID_DEFAULT_VALUES} onSubmit={() => {}}>
          <VariantColorGrid
            variants={VARIANTS}
            colors={COLORS}
            renderCell={(variant, color) => (
              <AddressAutofill
                name={`address-${variant}-${color}`}
                variant={variant}
                color={color}
                {...CONTENT_PROPS}
              />
            )}
          />
        </Form>
      </Demo>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'name', type: 'string', description: 'The react-hook-form field path. Required.' },
          { name: 'getOptionLabel', type: '(value: AddressSuggestion) => string', default: '`${street}, ${postalCode} ${city}`', description: 'Turns a suggestion into display text.' },
          { name: 'minQueryLength', type: 'number', default: '2', description: 'Characters typed before a search fires.' },
          { name: 'debounceMs', type: 'number', default: '300', description: 'Debounce between the last keystroke and the request.' },
          { name: 'limit', type: 'number', default: '10', description: 'Passed to the API as the result cap.' },
          { name: 'belowMinLengthContent', type: 'React.ReactNode', description: 'Shown below minQueryLength. Required, no default.' },
          { name: 'loadingContent', type: 'React.ReactNode', description: 'Shown while a search is in flight with no suggestions yet. Required, no default.' },
          { name: 'noResultsContent', type: 'React.ReactNode', description: 'Shown when a search found nothing. Required, no default.' },
          { name: 'errorContent', type: 'React.ReactNode', description: 'Shown when the search request failed. Required, no default.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'outlined'", description: 'Visual style of the input.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Input height, padding and font size.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input.' },
        ]}
      />
    </>
  );
}
