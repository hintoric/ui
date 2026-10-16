import * as React from 'react';
import { Form, NumberInput, Typography } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { z } from 'zod';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

function ControlledDemo() {
  const [guests, setGuests] = React.useState<number | null>(2);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 240 }}>
      <NumberInput label="Personen" value={guests} onChange={setGuests} min={1} max={8} />
      <Typography level="body-sm">Wert: {guests === null ? 'leer' : guests}</Typography>
    </div>
  );
}

export function NumberInputPage() {
  return (
    <>
      <h1>NumberInput</h1>
      <p className="docs-lede">
        A number field with − / + buttons, in Input&rsquo;s look. Built on Base UI&rsquo;s Number
        Field: it parses and formats with <code>Intl</code> (so <code>1.234,5</code> is understood in
        German), <kbd>↑</kbd>/<kbd>↓</kbd> step, <kbd>Shift</kbd> and <kbd>Alt</kbd> step large and
        small, and the value is a <code>number | null</code> — never a string. There is no Joy UI
        counterpart; the pill is compared against a Joy <code>Input</code> with two{' '}
        <code>IconButton</code>s, which is what a Joy app builds by hand.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <ControlledDemo />
      </Demo>
      <Code>{`const [guests, setGuests] = React.useState<number | null>(2);

<NumberInput label="Personen" value={guests} onChange={setGuests} min={1} max={8} />`}</Code>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <NumberInput variant={variant} color={color} defaultValue={3} aria-label={`${variant} ${color}`} />
          )}
        />
      </Demo>

      <h2>Formatting and units</h2>
      <p>
        <code>format</code> takes <code>Intl.NumberFormatOptions</code>. For a unit that is not a
        currency, an <code>endDecorator</code> reads better than a formatted suffix — it stays out of
        the text the user edits.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 240 }}>
          <NumberInput
            label="Preis"
            defaultValue={1499.5}
            step={0.5}
            locale="de-DE"
            format={{ style: 'currency', currency: 'EUR' }}
          />
          <NumberInput label="Gewicht" defaultValue={20} endDecorator="kg" />
          <NumberInput label="Ohne Buttons" defaultValue={7} stepper={false} />
        </div>
      </Demo>
      <Code>{`<NumberInput label="Preis" defaultValue={1499.5} step={0.5} locale="de-DE"
  format={{ style: 'currency', currency: 'EUR' }} />
<NumberInput label="Gewicht" defaultValue={20} endDecorator="kg" />
<NumberInput label="Ohne Buttons" defaultValue={7} stepper={false} />`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', maxWidth: 560 }}>
          <NumberInput size="sm" defaultValue={1} aria-label="Klein" />
          <NumberInput size="md" defaultValue={1} aria-label="Mittel" />
          <NumberInput size="lg" defaultValue={1} aria-label="Groß" />
        </div>
      </Demo>

      <h2>Inside a Form</h2>
      <p>
        Give it a <code>name</code> and it binds like every other field. The form value is a number,
        so the schema is <code>z.number()</code>, not a string that has to be coerced.
      </p>
      <Demo>
        <Form
          schema={z.object({ guests: z.number({ message: 'Bitte eine Zahl eingeben.' }).max(8, 'Höchstens 8 Personen.') })}
          defaultValues={{ guests: 9 }}
          mode="onChange"
          onSubmit={() => {}}
        >
          <div style={{ maxWidth: 240 }}>
            <NumberInput name="guests" label="Personen" helperText="Höchstens 8" />
          </div>
        </Form>
      </Demo>
      <Code>{`<Form schema={z.object({ guests: z.number().max(8, 'Höchstens 8 Personen.') })} …>
  <NumberInput name="guests" label="Personen" helperText="Höchstens 8" />
</Form>`}</Code>

      <h2>Keyboard</h2>
      <p>
        The buttons are left out of the tab order, as the browser&rsquo;s own number spinner is:
        the field already steps with the arrow keys, and two extra tab stops per field would only
        slow a keyboard user down. Their labels default to English — pass{' '}
        <code>incrementLabel</code> and <code>decrementLabel</code> to translate them.
      </p>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'value', type: 'number | null', description: 'The controlled value. `null` is an empty field.' },
          { name: 'defaultValue', type: 'number', description: 'The uncontrolled starting value.' },
          { name: 'onChange', type: '(value: number | null) => void', description: 'Every change: typing, buttons, arrow keys.' },
          { name: 'onChangeCommitted', type: '(value: number | null) => void', description: 'Once a change is done: on blur after typing, on release after a button press.' },
          { name: 'min / max', type: 'number', description: 'Bounds. Stepping clamps to them; typed values are clamped on blur.' },
          { name: 'step', type: 'number', default: '1', description: 'What the buttons and ↑/↓ add or remove.' },
          { name: 'smallStep / largeStep', type: 'number', default: '0.1 / 10', description: 'The step with Alt / with Shift held.' },
          { name: 'format', type: 'Intl.NumberFormatOptions', description: 'How the value is displayed.' },
          { name: 'locale', type: 'Intl.LocalesArgument', description: 'Locale for formatting and parsing. Defaults to the runtime locale.' },
          { name: 'stepper', type: 'boolean', default: 'true', description: 'Shows the − / + buttons.' },
          { name: 'incrementLabel / decrementLabel', type: 'string', default: "'Increase' / 'Decrease'", description: 'Accessible names of the buttons.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'outlined'", description: 'Visual style, as on Input.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Colour palette; also drives the focus ring.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height, padding and button size.' },
          { name: 'startDecorator / endDecorator', type: 'React.ReactNode', description: 'Rendered inside the pill; the end one sits before the buttons.' },
          { name: 'label / helperText / error', type: '…', description: 'As on Input.' },
          { name: 'disabled / readOnly / required / name', type: '…', description: 'As on a native input. `disabled` falls back to the surrounding FormControl.' },
        ]}
      />
    </>
  );
}
