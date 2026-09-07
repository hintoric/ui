import { ColorSchemeToggle } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

export function ColorSchemeTogglePage() {
  return (
    <>
      <h1>ColorSchemeToggle</h1>
      <p className="docs-lede">
        The most compact of the six colour scheme forms: one square button that cycles System →
        Light → Dark.
      </p>

      <h2>Basic usage</h2>
      <p>
        It needs no props. The current mode and the setter come from{' '}
        <a href="/color-scheme-provider">ColorSchemeProvider</a> — the toggle throws without one.
      </p>
      <Demo>
        <ColorSchemeToggle />
      </Demo>
      <Code>{`import { ColorSchemeToggle } from '@hintoric/ui';

<ColorSchemeToggle />`}</Code>

      <h2>The icon shows the chosen mode, not the applied one</h2>
      <p>
        In System mode on a light machine the button shows the display glyph, not a sun. A sun there
        would be indistinguishable from “pinned to Light”, and the user could no longer tell whether
        the app still follows their operating system.
      </p>
      <p>
        The same rule governs the other forms: the marked entry follows <code>mode</code>, never{' '}
        <code>resolvedMode</code>.
      </p>

      <h2>When to pick a different form</h2>
      <p>
        This form pays for its size with discoverability — three unlabelled stops have to be clicked
        through to be found. Where that matters, use{' '}
        <a href="/color-scheme-menu">ColorSchemeMenu</a>, whose stops are named and directly
        reachable. On a settings page,{' '}
        <a href="/color-scheme-toggle-group">ColorSchemeToggleGroup</a> shows all three at once.
      </p>

      <h2>Variants and sizes</h2>
      <p>
        It defaults to <code>outlined</code>, not <code>IconButton</code>&apos;s own{' '}
        <code>plain</code>: a control that renders as a bare glyph does not read as a control. Pass{' '}
        <code>variant=&quot;plain&quot;</code> for a borderless header corner.
      </p>
      <Demo>
        <ColorSchemeToggle variant="plain" />
        <ColorSchemeToggle variant="outlined" />
        <ColorSchemeToggle variant="soft" />
        <ColorSchemeToggle variant="solid" />
      </Demo>
      <Demo>
        <ColorSchemeToggle size="sm" />
        <ColorSchemeToggle size="md" />
        <ColorSchemeToggle size="lg" />
      </Demo>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: 'variant',
            type: "'solid' | 'soft' | 'outlined' | 'plain'",
            default: "'outlined'",
            description: 'Passed through to the underlying IconButton.',
          },
          {
            name: 'color',
            type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'",
            default: "'neutral'",
            description: 'Passed through to the underlying IconButton.',
          },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: 'Sizes the button and its icon together.',
          },
          {
            name: 'aria-label',
            type: 'string',
            description:
              'Defaults to the effect of a click — “Switch to light mode” — rather than the current state, so the button says what pressing it does. Override for a translated interface.',
          },
          {
            name: '…button props',
            type: "React.ComponentProps<'button'>",
            description:
              'Anything else is forwarded to the button. An onClick of your own runs alongside the mode change rather than replacing it.',
          },
        ]}
      />
    </>
  );
}
