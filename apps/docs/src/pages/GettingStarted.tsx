import { Code } from '../components/Demo';

export function GettingStarted() {
  return (
    <>
      <h1>Installation</h1>
      <p className="docs-lede">Add the package and its peer dependencies.</p>
      <Code>{`npm install @hintoric/ui @base-ui/react react react-dom`}</Code>

      <h2>Import the stylesheet once</h2>
      <p>
        @hintoric/ui ships a pre-built Tailwind stylesheet. Import it once at your app&apos;s entry
        point.
      </p>
      <Code>{`import '@hintoric/ui/styles.css';`}</Code>

      <h2>Wrap your app in a ColorSchemeProvider</h2>
      <p>
        Components read light/dark tokens from a <code>data-color-scheme</code> attribute set by{' '}
        <code>ColorSchemeProvider</code>. See{' '}
        <a href="/color-scheme-provider">ColorSchemeProvider</a> for details.
      </p>
      <Code>{`import { ColorSchemeProvider, Button } from '@hintoric/ui';

export function App() {
  return (
    <ColorSchemeProvider>
      <Button>Hello</Button>
    </ColorSchemeProvider>
  );
}`}</Code>
    </>
  );
}
