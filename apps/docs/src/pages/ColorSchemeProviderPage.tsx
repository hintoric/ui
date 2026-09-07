import { Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

export function ColorSchemeProviderPage() {
  return (
    <>
      <h1>ColorSchemeProvider</h1>
      <p className="docs-lede">
        Provides light/dark mode to every @hintoric/ui component, follows the operating system by
        default, and persists an explicit choice to <code>localStorage</code>. This docs site itself
        is wrapped in one — try the switcher in the top bar.
      </p>

      <h2>Usage</h2>
      <Code>{`import { ColorSchemeProvider, ColorSchemeMenu } from '@hintoric/ui';

export function App() {
  return (
    <ColorSchemeProvider>
      <ColorSchemeMenu />
    </ColorSchemeProvider>
  );
}`}</Code>
      <p>
        You rarely need to build the control yourself — six ready-made forms ship with the library:{' '}
        <a href="/color-scheme-menu">ColorSchemeMenu</a> (and its bare{' '}
        <code>ColorSchemeMenuItems</code>), <a href="/color-scheme-toggle">ColorSchemeToggle</a>,{' '}
        <a href="/color-scheme-toggle-group">ColorSchemeToggleGroup</a>,{' '}
        <a href="/color-scheme-switch">ColorSchemeSwitch</a> and{' '}
        <a href="/color-scheme-select">ColorSchemeSelect</a>.
      </p>

      <h2>Three modes, two schemes</h2>
      <p>
        <code>mode</code> is what the user chose and can be <code>&apos;system&apos;</code>.{' '}
        <code>resolvedMode</code> is what is actually painted and is only ever{' '}
        <code>&apos;light&apos;</code> or <code>&apos;dark&apos;</code>.
      </p>
      <p>
        In <code>&apos;system&apos;</code>, the resolved scheme comes from{' '}
        <code>prefers-color-scheme</code> and <strong>follows it live</strong> — change the setting
        in your operating system and the page follows without a reload.
      </p>

      <h2 id="migration">Migrating from the two-mode provider</h2>
      <p>
        Two things changed, and the first one compiles silently:
      </p>
      <ul>
        <li>
          <strong>
            Use <code>resolvedMode</code> wherever you compared <code>mode</code> against{' '}
            <code>&apos;dark&apos;</code>
          </strong>{' '}
          — picking a logo, an illustration, a chart palette. <code>mode === &apos;dark&apos;</code>{' '}
          still type-checks and is now wrong for anyone in System mode: it serves the light-mode
          asset on a dark page. This docs site&apos;s own sidebar logo was exactly that bug.
        </li>
        <li>
          <strong>
            <code>defaultMode</code> now defaults to <code>&apos;system&apos;</code>
          </strong>
          , not <code>&apos;light&apos;</code>. Pass <code>defaultMode=&quot;light&quot;</code> for
          the previous behaviour.
        </li>
      </ul>
      <Code>{`// before
const { mode } = useColorScheme();
<img src={mode === 'dark' ? white : black} />

// after
const { resolvedMode } = useColorScheme();
<img src={resolvedMode === 'dark' ? white : black} />`}</Code>

      <h2>How the mode is resolved</h2>
      <ol>
        <li>
          A stored value in <code>localStorage[&apos;hintoric-color-scheme&apos;]</code>, if it is
          one of the three modes.
        </li>
        <li>
          Otherwise <code>defaultMode</code>.
        </li>
      </ol>
      <p>
        Choosing System <em>writes</em> <code>&quot;system&quot;</code> rather than clearing the
        key. The two are not the same state: an absent key means “never chose”, which a
        consumer&apos;s <code>defaultMode</code> is entitled to answer — clearing it would let{' '}
        <code>defaultMode=&quot;light&quot;</code> overwrite an explicit choice on the next load.
      </p>
      <p>
        A change in another tab of the same origin is adopted automatically. Two open tabs
        disagreeing about the colour scheme reads as a bug.
      </p>

      <h2>Where the attribute lands</h2>
      <p>
        <code>data-color-scheme</code> is set on a wrapping <code>&lt;div&gt;</code> and mirrored
        onto <code>&lt;html&gt;</code>. It always carries the <em>resolved</em> scheme, never{' '}
        <code>&apos;system&apos;</code> — the theme defines tokens for light and dark only.
      </p>
      <p>
        The <code>&lt;html&gt;</code> mirror is what makes portalled surfaces work.{' '}
        <code>Menu</code>, <code>Select</code>&apos;s listbox, <code>Modal</code>,{' '}
        <code>Drawer</code>, <code>Tooltip</code> and <code>Snackbar</code> render into a portal on{' '}
        <code>document.body</code>, which is a <em>sibling</em> of the wrapper div and never a
        descendant — with the wrapper alone, every popup stayed light in a dark application.
      </p>
      <p>
        The trade-off: <code>&lt;html&gt;</code> is shared. Nesting providers that ask for different
        schemes is not supported.
      </p>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: 'defaultMode',
            type: "'light' | 'dark' | 'system'",
            default: "'system'",
            description:
              'Which mode applies when the user has never chosen one. A stored choice always wins over this.',
          },
          {
            name: 'children',
            type: 'React.ReactNode',
            description: 'Content that should react to the colour scheme.',
          },
        ]}
      />

      <h2>useColorScheme()</h2>
      <p>
        Returns <code>{'{ mode, resolvedMode, setMode }'}</code>. Must be called from inside a{' '}
        <code>ColorSchemeProvider</code> — it throws otherwise.
      </p>
      <PropsTable
        rows={[
          {
            name: 'mode',
            type: "'light' | 'dark' | 'system'",
            description: "What the user chose. 'system' is a real, persisted choice.",
          },
          {
            name: 'resolvedMode',
            type: "'light' | 'dark'",
            description:
              'What is actually painted. Use this for anything that has to match the visible scheme.',
          },
          {
            name: 'setMode',
            type: '(mode: ColorSchemeMode) => void',
            description: 'Sets and persists the mode.',
          },
        ]}
      />
    </>
  );
}
