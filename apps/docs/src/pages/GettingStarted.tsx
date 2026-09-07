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
        <code>ColorSchemeProvider</code>. It follows the operating system&apos;s preference by
        default and persists an explicit choice. See{' '}
        <a href="/color-scheme-provider">ColorSchemeProvider</a> for details, and{' '}
        <a href="/color-scheme-menu">ColorSchemeMenu</a> for a ready-made control.
      </p>
      <Code>{`import { ColorSchemeProvider, ColorSchemeMenu, Button } from '@hintoric/ui';

export function App() {
  return (
    <ColorSchemeProvider>
      <ColorSchemeMenu />
      <Button>Hello</Button>
    </ColorSchemeProvider>
  );
}`}</Code>

      <h2>Your own dark: classes follow the switcher</h2>
      <p>
        The stylesheet redefines Tailwind&apos;s <code>dark:</code> variant to key off{' '}
        <code>data-color-scheme</code> instead of <code>prefers-color-scheme</code>. Anything you
        write in your own markup therefore follows the provider — including a user who overrode
        their operating system.
      </p>
      <Code>{`{/* dark when the switcher says dark, not when the OS does */}
<div className="bg-white dark:bg-neutral-900">…</div>`}</Code>
      <p>
        Our own components do not use <code>dark:</code> at all — they read the tokens directly.
        This exists purely for your markup.
      </p>
    </>
  );
}
