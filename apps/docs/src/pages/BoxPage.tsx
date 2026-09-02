import { Box } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

export function BoxPage() {
  return (
    <>
      <h1>Box</h1>
      <p className="docs-lede">
        The most basic layout primitive — a plain <code>div</code> (or any element via{' '}
        <code>component</code>) that forwards every native prop, including <code>className</code>.
      </p>

      <h2>Demo</h2>
      <Demo>
        <Box style={{ padding: 16, border: '1px dashed var(--color-divider)' }}>I&apos;m a Box</Box>
      </Demo>
      <Code>{`<Box component="section" className="p-4">
  Content
</Box>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'component', type: 'React.ElementType', default: "'div'", description: 'Renders as a different element/component.' },
          { name: '...rest', type: "React.ComponentPropsWithoutRef<'div'>", description: 'All native div props, including className and style.' },
        ]}
      />
    </>
  );
}
