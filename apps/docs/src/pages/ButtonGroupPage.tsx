import { Button, ButtonGroup, IconButton } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

export function ButtonGroupPage() {
  return (
    <>
      <h1>ButtonGroup</h1>
      <p className="docs-lede">
        Lays out related buttons as one connected control. This is a layout wrapper only — unlike
        Joy UI, it does not push <code>variant</code>, <code>color</code> or <code>size</code> down
        to its children through context, so pass those to each button yourself.
      </p>

      <h2>Connected buttons</h2>
      <p>
        With the default <code>spacing={'{0}'}</code> the children sit flush against each other and
        the group clips their outer corners into a single rounded shape.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <ButtonGroup>
            <Button variant="outlined" color="neutral">
              Cut
            </Button>
            <Button variant="outlined" color="neutral">
              Copy
            </Button>
            <Button variant="outlined" color="neutral">
              Paste
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant="solid" color="primary">
              Save
            </Button>
            <Button variant="solid" color="primary">
              Save as…
            </Button>
          </ButtonGroup>
        </div>
      </Demo>
      <Code>{`<ButtonGroup>
  <Button variant="outlined" color="neutral">Cut</Button>
  <Button variant="outlined" color="neutral">Copy</Button>
</ButtonGroup>`}</Code>

      <h2>Spacing</h2>
      <p>
        Any non-zero <code>spacing</code> detaches the children: the dividers and corner clipping
        drop away and the value becomes a plain flex gap.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ButtonGroup spacing={8}>
            <Button variant="soft" color="neutral">
              One
            </Button>
            <Button variant="soft" color="neutral">
              Two
            </Button>
            <Button variant="soft" color="neutral">
              Three
            </Button>
          </ButtonGroup>
          <ButtonGroup spacing="1.5rem">
            <Button variant="plain" color="primary">
              One
            </Button>
            <Button variant="plain" color="primary">
              Two
            </Button>
          </ButtonGroup>
        </div>
      </Demo>
      <Code>{`<ButtonGroup spacing={8}>…</ButtonGroup>
<ButtonGroup spacing="1.5rem">…</ButtonGroup>`}</Code>

      <h2>Vertical orientation</h2>
      <Demo>
        <ButtonGroup orientation="vertical">
          <Button variant="outlined" color="neutral">
            Top
          </Button>
          <Button variant="outlined" color="neutral">
            Middle
          </Button>
          <Button variant="outlined" color="neutral">
            Bottom
          </Button>
        </ButtonGroup>
      </Demo>
      <Code>{`<ButtonGroup orientation="vertical">…</ButtonGroup>`}</Code>

      <h2>With icon buttons</h2>
      <Demo>
        <ButtonGroup>
          <IconButton variant="outlined" color="neutral" aria-label="Bold">
            B
          </IconButton>
          <IconButton variant="outlined" color="neutral" aria-label="Italic">
            I
          </IconButton>
          <IconButton variant="outlined" color="neutral" aria-label="Underline">
            U
          </IconButton>
        </ButtonGroup>
      </Demo>

      <h2>Disabling the whole group</h2>
      <p>
        <code>disabled</code> sets <code>aria-disabled</code> on the container for assistive
        technology. It does not disable the children — pass <code>disabled</code> to each button to
        actually block clicks.
      </p>
      <Demo>
        <ButtonGroup disabled>
          <Button variant="outlined" color="neutral" disabled>
            Cut
          </Button>
          <Button variant="outlined" color="neutral" disabled>
            Copy
          </Button>
        </ButtonGroup>
      </Demo>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The buttons to group.' },
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction of the group.' },
          { name: 'spacing', type: 'number | string', default: '0', description: 'Gap between children. 0 renders them connected with dividers.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Sets aria-disabled on the container. Does not disable the children.' },
        ]}
      />

      <h2>Differences from Joy UI</h2>
      <p>
        Joy UI&apos;s ButtonGroup shares a context that gives every child button its{' '}
        <code>variant</code>, <code>color</code>, <code>size</code> and <code>disabled</code>
        , and suppresses the inner border radii per child. This build keeps Button&apos;s contract
        untouched and approximates the connected look with <code>overflow: hidden</code> plus
        divider borders instead.
      </p>
    </>
  );
}
