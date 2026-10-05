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
      <p>
        That stylesheet contains only the utilities our components use. A class in your own markup
        works only if a component happens to use it too, and responsive variants such as{' '}
        <code>md:</code> are never included.
      </p>

      <h2>Running Tailwind yourself? Use the Tailwind entry instead</h2>
      <p>
        If your app has its own Tailwind CSS v4 (4.1 or later), import{' '}
        <code>@hintoric/ui/tailwind.css</code> in your Tailwind stylesheet <em>instead of</em>{' '}
        <code>styles.css</code>. It contains our theme tokens, the <code>dark:</code> variant
        described below, and a <code>@source</code> for our bundle. Your build then generates the
        utilities for our components and for your own markup, all with the same tokens.
      </p>
      <Code>{`/* app.css */
@import "tailwindcss";
@import "@hintoric/ui/tailwind.css";`}</Code>
      <Code>{`<div className="flex flex-col gap-2 md:flex-row bg-surface-1 md:bg-primary-soft-bg text-ink-primary">…</div>`}</Code>
      <p>
        Do not load both files. A second Tailwind build next to <code>styles.css</code> outputs some
        of our utilities again, later in the same <code>utilities</code> layer. That changes which
        rule wins: a component element with <code>p-2 px-4</code> gets 8px of horizontal padding
        instead of 16px when your markup also uses <code>p-2</code>.
      </p>
      <p>
        The token names (<code>--color-primary-soft-bg</code>, <code>surface-1</code>,{' '}
        <code>ink-primary</code> and the rest of <code>theme.css</code>) are public API. Renaming or
        removing a token is a breaking change.
      </p>

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

      <h2>Optional: provide your own reduced-motion setting</h2>
      <p>
        Components that animate read <code>prefers-reduced-motion</code> by default. If your app
        already owns an accessibility setting, pass it through{' '}
        <a href="/reduced-motion-provider">ReducedMotionProvider</a>.
      </p>
      <Code>{`import { ReducedMotionProvider } from '@hintoric/ui';

<ReducedMotionProvider reducedMotion={settings.reducedMotion}>
  <App />
</ReducedMotionProvider>`}</Code>
    </>
  );
}
