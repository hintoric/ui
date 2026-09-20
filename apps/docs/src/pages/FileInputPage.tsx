import * as React from 'react';
import { FileInput, FormControl, Typography } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

function BasicDemo() {
  const [chosen, setChosen] = React.useState<readonly string[]>([]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 480 }}>
      <FileInput accept=".docx,.pdf" onFiles={(files) => setChosen(files.map((file) => file.name))}>
        Datei wählen oder hierher ziehen
      </FileInput>
      <Typography level="body-sm">{chosen.length > 0 ? chosen.join(', ') : 'Nichts gewählt.'}</Typography>
    </div>
  );
}

export function FileInputPage() {
  return (
    <>
      <h1>FileInput</h1>
      <p className="docs-lede">
        A drop zone that also opens the file picker. There is no Joy UI counterpart: the reason for
        the component is that the native control renders as the browser&rsquo;s own grey widget,
        which looks foreign beside anything designed. The native{' '}
        <code>&lt;input type=&quot;file&quot;&gt;</code> stays underneath rather than being
        replaced, so the keyboard, screen readers and testing-library&rsquo;s <code>upload()</code>{' '}
        keep working — only the widget is hidden.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <BasicDemo />
      </Demo>
      <Code>{`const [chosen, setChosen] = React.useState<readonly string[]>([]);

<FileInput accept=".docx,.pdf" onFiles={(files) => setChosen(files.map((f) => f.name))}>
  Datei wählen oder hierher ziehen
</FileInput>`}</Code>

      <h2>Disabled</h2>
      <p>
        Also picked up from a surrounding <code>FormControl</code>, so a whole field group can be
        turned off in one place.
      </p>
      <Demo>
        <FormControl disabled>
          <FileInput onFiles={() => {}}>Datei wählen</FileInput>
        </FormControl>
      </Demo>
      <Code>{`<FormControl disabled>
  <FileInput onFiles={() => {}}>Datei wählen</FileInput>
</FormControl>`}</Code>

      <h2>The field clears itself</h2>
      <p>
        After every pick the underlying field is reset. Without that, choosing the same file twice
        fires no change event at all — which looks like nothing happened, and is exactly the case
        that matters after a failed upload.
      </p>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'onFiles', type: '(files: File[]) => void', description: 'What was chosen or dropped. Never called with an empty list. Required.' },
          { name: 'accept', type: 'string', description: 'As on the native element, e.g. `.docx,application/pdf`.' },
          { name: 'multiple', type: 'boolean', default: 'false', description: 'Allows more than one file per pick.' },
          { name: 'disabled', type: 'boolean', description: 'Falls back to the surrounding FormControl.' },
          { name: 'children', type: 'React.ReactNode', description: "The zone's caption, and the field's accessible name." },
          { name: 'className', type: 'string', description: 'Merged onto the zone.' },
        ]}
      />
    </>
  );
}
