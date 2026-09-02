import { Stack, Sheet } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

function Swatch({ label }: { label: string }) {
  return (
    <Sheet variant="soft" color="primary" style={{ padding: '8px 12px' }}>
      {label}
    </Sheet>
  );
}

export function StackPage() {
  return (
    <>
      <h1>Stack</h1>
      <p className="docs-lede">A one-dimensional flexbox layout with a spacing scale.</p>

      <h2>Direction</h2>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Stack direction="row" spacing={2}>
            <Swatch label="row 1" />
            <Swatch label="row 2" />
            <Swatch label="row 3" />
          </Stack>
          <Stack direction="column" spacing={2}>
            <Swatch label="col 1" />
            <Swatch label="col 2" />
          </Stack>
        </div>
      </Demo>
      <Code>{`<Stack direction="row" spacing={2}>
  <Item />
  <Item />
</Stack>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'direction', type: "'row' | 'column'", default: "'column'", description: 'Flex direction of the children.' },
          { name: 'spacing', type: '0 | 1 | 2 | 3 | 4 | 5 | 6 | 8', default: '0', description: 'Gap between children, on the theme spacing scale.' },
          { name: 'component', type: 'React.ElementType', default: "'div'", description: 'Renders as a different element/component.' },
        ]}
      />
    </>
  );
}
