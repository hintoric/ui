import * as React from 'react';
import { Form, OtpInput, Typography } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { z } from 'zod';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

function BasicDemo() {
  const [done, setDone] = React.useState<string | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <OtpInput
        label="Bestätigungscode"
        helperText="Wir haben dir den Code per SMS geschickt."
        onChange={() => setDone(null)}
        onComplete={setDone}
      />
      <Typography level="body-sm">{done ? `Vollständig: ${done}` : 'Noch nicht vollständig.'}</Typography>
    </div>
  );
}

export function OtpInputPage() {
  return (
    <>
      <h1>OtpInput</h1>
      <p className="docs-lede">
        A one-time-code field: one slot per character, each one an Input pill squared off. Built on
        Base UI&rsquo;s OTP Field, so focus moves on while typing, <kbd>Backspace</kbd> walks back, a
        pasted code spreads across the slots and an SMS code offered by the phone&rsquo;s keyboard
        fills all of them at once (<code>autocomplete=&quot;one-time-code&quot;</code>). The form
        receives one string. There is no Joy UI counterpart; each slot is compared against Joy&rsquo;s{' '}
        <code>Input</code>.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <BasicDemo />
      </Demo>
      <Code>{`<OtpInput
  label="Bestätigungscode"
  helperText="Wir haben dir den Code per SMS geschickt."
  onComplete={(code) => verify(code)}
/>`}</Code>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <OtpInput variant={variant} color={color} length={4} defaultValue="12" aria-label={`${variant} ${color}`} />
          )}
        />
      </Demo>

      <h2>Length, characters and masking</h2>
      <p>
        <code>validationType</code> decides what a slot accepts — anything else is dropped as it is
        typed or pasted. <code>mask</code> shows dots, for a PIN.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <OtpInput label="PIN" length={4} mask />
          <OtpInput label="Gutscheincode" length={8} validationType="alphanumeric" size="sm" />
        </div>
      </Demo>
      <Code>{`<OtpInput label="PIN" length={4} mask />
<OtpInput label="Gutscheincode" length={8} validationType="alphanumeric" size="sm" />`}</Code>

      <h2>Inside a Form</h2>
      <p>
        With a <code>name</code> it binds like every other field, and the schema decides when a code
        is valid. Base UI&rsquo;s hidden input normally carries a <code>pattern</code>, which would let
        the browser block the submit with its own bubble before the schema ever ran; bound fields
        leave it off so the form&rsquo;s message is the one the user sees.
      </p>
      <Demo>
        <Form
          schema={z.object({ code: z.string().length(6, 'Bitte alle 6 Ziffern eingeben.') })}
          defaultValues={{ code: '' }}
          onSubmit={() => {}}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <OtpInput name="code" label="Code" />
            <button type="submit">Prüfen</button>
          </div>
        </Form>
      </Demo>
      <Code>{`<Form schema={z.object({ code: z.string().length(6, 'Bitte alle 6 Ziffern eingeben.') })} …>
  <OtpInput name="code" label="Code" />
</Form>`}</Code>

      <h2>Accessibility</h2>
      <p>
        The <code>label</code> names the group and the first slot; the slots after it are announced
        as &ldquo;Character 2 of 6&rdquo; and so on. Pass <code>slotLabel</code> to translate that,
        e.g. <code>{'(i, n) => `Ziffer ${i + 1} von ${n}`'}</code>. Only one slot is a tab stop.
      </p>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'length', type: 'number', default: '6', description: 'Number of characters.' },
          { name: 'value / defaultValue', type: 'string', description: 'The code, controlled or uncontrolled.' },
          { name: 'onChange', type: '(value: string) => void', description: 'Every change, with the whole code so far.' },
          { name: 'onComplete', type: '(value: string) => void', description: 'Once every slot is filled — typed, pasted or autofilled.' },
          { name: 'validationType', type: "'numeric' | 'alpha' | 'alphanumeric' | 'none'", default: "'numeric'", description: 'Which characters are accepted. Numeric also brings up the number keyboard on phones.' },
          { name: 'mask', type: 'boolean', default: 'false', description: 'Shows dots instead of the characters.' },
          { name: 'autoSubmit', type: 'boolean', default: 'false', description: 'Submits the surrounding form as soon as the code is complete.' },
          { name: 'slotLabel', type: '(index: number, length: number) => string', description: 'Accessible name of the slots after the first.' },
          { name: 'variant / color / size', type: '…', default: "'outlined' / 'neutral' / 'md'", description: 'As on Input, applied to every slot.' },
          { name: 'label / helperText / error', type: '…', description: 'As on Input.' },
          { name: 'disabled / readOnly / required / name', type: '…', description: '`disabled` falls back to the surrounding FormControl.' },
        ]}
      />
    </>
  );
}
