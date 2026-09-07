import { ColorSchemeSwitch } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

export function ColorSchemeSwitchPage() {
  return (
    <>
      <h1>ColorSchemeSwitch</h1>
      <p className="docs-lede">
        The two-position colour scheme form, for a settings row reading “Dark mode: off”.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <ColorSchemeSwitch />
      </Demo>
      <Code>{`import { ColorSchemeSwitch } from '@hintoric/ui';

<ColorSchemeSwitch />`}</Code>

      <h2>It cannot reach System, and that is the shape</h2>
      <p>
        A switch has two positions, so this form has no way to express “follow the operating
        system”. What it does at that third state is decided rather than accidental:
      </p>
      <ul>
        <li>
          Its checked state mirrors <code>resolvedMode</code>, so in System mode it shows what is
          actually on screen. A switch reading “off” on a dark screen would be plainly wrong.
        </li>
        <li>
          Toggling it writes a fixed mode and <strong>leaves System for good</strong>. The user made
          a decision; honouring it and then quietly continuing to follow the operating system would
          be the more surprising behaviour.
        </li>
        <li>
          There is no hidden way back — no long press, no double click. If System has to stay
          reachable, use <a href="/color-scheme-menu">ColorSchemeMenu</a>,{' '}
          <a href="/color-scheme-toggle">ColorSchemeToggle</a>,{' '}
          <a href="/color-scheme-toggle-group">ColorSchemeToggleGroup</a> or{' '}
          <a href="/color-scheme-select">ColorSchemeSelect</a>.
        </li>
      </ul>

      <h2>Without the decorators</h2>
      <Demo>
        <ColorSchemeSwitch icons={false} />
      </Demo>
      <Code>{`<ColorSchemeSwitch icons={false} />`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <ColorSchemeSwitch size="sm" />
        <ColorSchemeSwitch size="md" />
        <ColorSchemeSwitch size="lg" />
      </Demo>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: 'color',
            type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'",
            description:
              'Passed through to Switch. Left unset, the track is neutral unchecked and primary checked, matching Joy UI.',
          },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: 'Passed through to Switch.',
          },
          {
            name: 'icons',
            type: 'boolean',
            default: 'true',
            description: 'Show the sun and moon either side of the track.',
          },
          {
            name: 'aria-label',
            type: 'string',
            description:
              'Defaults to the effect of a click — “Switch to dark mode” — rather than the current state. Override for a translated interface.',
          },
          {
            name: '…span props',
            type: "React.ComponentProps<'span'>",
            description: 'Anything else is forwarded to the switch.',
          },
        ]}
      />
    </>
  );
}
