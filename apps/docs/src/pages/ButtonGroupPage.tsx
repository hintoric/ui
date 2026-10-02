import { Button, ButtonGroup, IconButton } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

export function ButtonGroupPage() {
  return (
    <>
      <h1>ButtonGroup</h1>
      <p className="docs-lede">
        Joins related buttons into one control. Like Joy UI, the group passes its{' '}
        <code>variant</code>, <code>color</code>, <code>size</code> and <code>disabled</code> down to
        every Button and IconButton inside it, so the buttons themselves usually need no props.
      </p>

      <h2>Connected buttons</h2>
      <p>
        With the default <code>spacing={'{0}'}</code> the buttons touch: the outer corners stay
        rounded, the inner ones go square, and a separator line sits between neighbours. Buttons
        default to <code>outlined</code> / <code>neutral</code> / <code>md</code>.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <ButtonGroup>
            <Button>Cut</Button>
            <Button>Copy</Button>
            <Button>Paste</Button>
          </ButtonGroup>
          <ButtonGroup variant="solid" color="primary">
            <Button>Save</Button>
            <Button>Save as…</Button>
          </ButtonGroup>
        </div>
      </Demo>
      <Code>{`<ButtonGroup>
  <Button>Cut</Button>
  <Button>Copy</Button>
</ButtonGroup>
<ButtonGroup variant="solid" color="primary">…</ButtonGroup>`}</Code>

      <h2>Variants and colors</h2>
      <p>A button that sets its own prop keeps it; the rest follow the group.</p>
      <Demo>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <ButtonGroup variant="soft" color="success">
            <Button>One</Button>
            <Button>Two</Button>
            <Button>Three</Button>
          </ButtonGroup>
          <ButtonGroup variant="plain" color="danger">
            <Button>One</Button>
            <Button>Two</Button>
          </ButtonGroup>
          <ButtonGroup variant="outlined" color="primary">
            <Button>Edit</Button>
            <Button variant="solid">Publish</Button>
          </ButtonGroup>
        </div>
      </Demo>
      <Code>{`<ButtonGroup variant="soft" color="success">…</ButtonGroup>
<ButtonGroup variant="outlined" color="primary">
  <Button>Edit</Button>
  <Button variant="solid">Publish</Button>
</ButtonGroup>`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <ButtonGroup key={size} size={size}>
              <Button>One</Button>
              <Button>Two</Button>
            </ButtonGroup>
          ))}
        </div>
      </Demo>
      <Code>{`<ButtonGroup size="sm">…</ButtonGroup>`}</Code>

      <h2>Spacing</h2>
      <p>
        Any non-zero <code>spacing</code> detaches the buttons and rounds every corner. A number is a
        multiple of 8px, as in Joy UI; a string is used as-is. Outlined buttons keep their border;
        the other variants lose the separator.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ButtonGroup spacing={1} variant="soft">
            <Button>One</Button>
            <Button>Two</Button>
            <Button>Three</Button>
          </ButtonGroup>
          <ButtonGroup spacing="1.5rem" variant="plain" color="primary">
            <Button>One</Button>
            <Button>Two</Button>
          </ButtonGroup>
        </div>
      </Demo>
      <Code>{`<ButtonGroup spacing={1}>…</ButtonGroup>      {/* 8px */}
<ButtonGroup spacing="1.5rem">…</ButtonGroup>`}</Code>

      <h2>Vertical orientation</h2>
      <Demo>
        <ButtonGroup orientation="vertical">
          <Button>Top</Button>
          <Button>Middle</Button>
          <Button>Bottom</Button>
        </ButtonGroup>
      </Demo>
      <Code>{`<ButtonGroup orientation="vertical">…</ButtonGroup>`}</Code>

      <h2>With icon buttons</h2>
      <Demo>
        <ButtonGroup>
          <IconButton aria-label="Bold">B</IconButton>
          <IconButton aria-label="Italic">I</IconButton>
          <IconButton aria-label="Underline">U</IconButton>
        </ButtonGroup>
      </Demo>

      <h2>Disabling the whole group</h2>
      <p>
        <code>disabled</code> disables every button in the group. A button can opt back in with{' '}
        <code>disabled={'{false}'}</code>.
      </p>
      <Demo>
        <ButtonGroup disabled>
          <Button>Cut</Button>
          <Button>Copy</Button>
        </ButtonGroup>
      </Demo>
      <Code>{`<ButtonGroup disabled>…</ButtonGroup>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The buttons to group.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'outlined'", description: 'Variant for every button that does not set its own.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color for every button that does not set its own.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size for every button that does not set its own.' },
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction of the group.' },
          { name: 'spacing', type: 'number | string', default: '0', description: 'Gap between buttons: a number is a multiple of 8px, a string is used as-is. 0 connects them.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every button that does not set its own disabled.' },
        ]}
      />

      <h2>Differences from Joy UI</h2>
      <p>
        Joy UI&apos;s <code>buttonFlex</code> prop, its special handling of <code>Divider</code>{' '}
        children, and responsive (breakpoint-object) <code>spacing</code> are not supported.
      </p>
    </>
  );
}
