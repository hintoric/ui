import { Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

export function ColorSchemeProviderPage() {
  return (
    <>
      <h1>ColorSchemeProvider</h1>
      <p className="docs-lede">
        Provides light/dark mode to every @hintoric/ui component by setting{' '}
        <code>data-color-scheme</code> on a wrapping element, and persists the choice to{' '}
        <code>localStorage</code>. This docs site itself is wrapped in one — try the toggle in the
        top bar.
      </p>

      <h2>Usage</h2>
      <Code>{`import { ColorSchemeProvider, useColorScheme, Button } from '@hintoric/ui';

function ModeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <Button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
      Toggle mode
    </Button>
  );
}

export function App() {
  return (
    <ColorSchemeProvider defaultMode="light">
      <ModeToggle />
    </ColorSchemeProvider>
  );
}`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'defaultMode', type: "'light' | 'dark'", default: "'light'", description: 'Initial mode when no value is stored yet.' },
          { name: 'children', type: 'React.ReactNode', description: 'Content that should react to the color scheme.' },
        ]}
      />

      <h2>useColorScheme()</h2>
      <p>
        Returns <code>{'{ mode, setMode }'}</code>. Must be called from inside a{' '}
        <code>ColorSchemeProvider</code> — it throws otherwise.
      </p>
    </>
  );
}
