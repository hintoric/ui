import { FormControl, FormHelperText, FormLabel, Input, Textarea } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

export function FormControlPage() {
  return (
    <>
      <h1>FormControl</h1>
      <p className="docs-lede">
        Groups a label, a field and its helper text into one labelled block, and shares{' '}
        <code>disabled</code>/<code>error</code>/<code>required</code> with the label and helper
        text through context. This build&apos;s context reaches those two only — the field itself
        still needs its own props.
      </p>

      <h2>Label, field, helper text</h2>
      <Demo>
        <FormControl style={{ maxWidth: 320 }}>
          <FormLabel>Email address</FormLabel>
          <Input type="email" placeholder="you@example.com" />
          <FormHelperText>We only use this for delivery updates.</FormHelperText>
        </FormControl>
      </Demo>
      <Code>{`<FormControl>
  <FormLabel>Email address</FormLabel>
  <Input type="email" placeholder="you@example.com" />
  <FormHelperText>We only use this for delivery updates.</FormHelperText>
</FormControl>`}</Code>

      <h2>Required</h2>
      <p>
        <code>required</code> on the FormControl reaches <code>FormLabel</code> through context,
        which appends the asterisk. Setting <code>required</code> directly on the label wins over
        the context value.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 320 }}>
          <FormControl required>
            <FormLabel>Full name</FormLabel>
            <Input placeholder="Ada Lovelace" required />
          </FormControl>
          <FormControl>
            <FormLabel required>Marked on the label itself</FormLabel>
            <Input placeholder="…" />
          </FormControl>
        </div>
      </Demo>
      <Code>{`<FormControl required>
  <FormLabel>Full name</FormLabel>
  <Input placeholder="Ada Lovelace" required />
</FormControl>`}</Code>

      <h2>Error and disabled states</h2>
      <p>
        Because the context stops at the label and helper text, pass <code>error</code> and{' '}
        <code>disabled</code> to the field as well — on Input that means{' '}
        <code>color=&quot;danger&quot;</code> for the error look.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 320 }}>
          <FormControl error>
            <FormLabel>Password</FormLabel>
            <Input type="password" color="danger" defaultValue="abc" />
            <FormHelperText>Must be at least 12 characters.</FormHelperText>
          </FormControl>
          <FormControl disabled>
            <FormLabel>Account ID</FormLabel>
            <Input defaultValue="ACC-40219" disabled />
            <FormHelperText>Assigned automatically.</FormHelperText>
          </FormControl>
        </div>
      </Demo>

      <h2>Horizontal orientation</h2>
      <Demo>
        <FormControl orientation="horizontal">
          <FormLabel>Notes</FormLabel>
          <Textarea rows={2} placeholder="Anything we should know?" />
        </FormControl>
      </Demo>
      <Code>{`<FormControl orientation="horizontal">
  <FormLabel>Notes</FormLabel>
  <Textarea rows={2} />
</FormControl>`}</Code>

      <h2>FormControl props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'Label, field and helper text.' },
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'vertical'", description: 'Stacks the children or lays them out in a row.' },
          { name: 'required', type: 'boolean', default: 'false', description: 'Shared with FormLabel, which then renders an asterisk.' },
          { name: 'error', type: 'boolean', default: 'false', description: 'Shared with descendants through context.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Shared with descendants through context. Does not disable the field.' },
        ]}
      />

      <h2>FormLabel props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The label text.' },
          { name: 'required', type: 'boolean', default: 'inherited from FormControl', description: 'Appends a red asterisk. Overrides the context value when set.' },
        ]}
      />

      <h2>FormHelperText props</h2>
      <p>
        <code>FormHelperText</code> takes no props of its own beyond the standard{' '}
        <code>&lt;div&gt;</code> attributes — it is a styled container for the text below a field.
      </p>

      <h2>Differences from Joy UI</h2>
      <p>
        Joy UI&apos;s FormControl cascades <code>size</code>, <code>disabled</code> and{' '}
        <code>error</code> into the field itself (Input, Checkbox and the rest read its context) and
        wires up <code>id</code>/<code>aria-describedby</code> automatically. This build&apos;s
        context is limited to FormLabel and FormHelperText.
      </p>
    </>
  );
}
