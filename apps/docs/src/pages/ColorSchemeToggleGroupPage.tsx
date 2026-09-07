import { ColorSchemeToggleGroup } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

export function ColorSchemeToggleGroupPage() {
  return (
    <>
      <h1>ColorSchemeToggleGroup</h1>
      <p className="docs-lede">
        All three colour scheme states side by side, each one click away — the form for a settings
        page rather than a header corner.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <ColorSchemeToggleGroup />
      </Demo>
      <Code>{`import { ColorSchemeToggleGroup } from '@hintoric/ui';

<ColorSchemeToggleGroup />`}</Code>

      <h2>The active segment follows the chosen mode</h2>
      <p>
        “System” stays active while it resolves to Dark, for the same reason the other forms mark{' '}
        <code>mode</code> rather than <code>resolvedMode</code>.
      </p>
      <p>
        Clicking the already-active segment does nothing. There is no such thing as “no colour
        scheme”, so deselection is not a state a user can reach.
      </p>

      <h2>Translated labels</h2>
      <Demo>
        <ColorSchemeToggleGroup labels={{ system: 'Automatisch', light: 'Hell', dark: 'Dunkel' }} />
      </Demo>
      <Code>{`<ColorSchemeToggleGroup labels={{ system: 'Automatisch', light: 'Hell', dark: 'Dunkel' }} />`}</Code>

      <h2>Text only</h2>
      <Demo>
        <ColorSchemeToggleGroup icons={false} />
      </Demo>
      <Code>{`<ColorSchemeToggleGroup icons={false} />`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <ColorSchemeToggleGroup size="sm" />
      </Demo>
      <Demo>
        <ColorSchemeToggleGroup size="md" />
      </Demo>
      <Demo>
        <ColorSchemeToggleGroup size="lg" />
      </Demo>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: 'variant',
            type: "'solid' | 'soft' | 'outlined' | 'plain'",
            default: "'outlined'",
            description: 'Applied to the group and every segment.',
          },
          {
            name: 'color',
            type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'",
            default: "'neutral'",
            description: 'Applied to the group and every segment.',
          },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'sm'",
            description: 'Applied to every segment.',
          },
          {
            name: 'labels',
            type: '{ system?: ReactNode; light?: ReactNode; dark?: ReactNode }',
            description: 'Partially overrides the English defaults System / Light / Dark.',
          },
          {
            name: 'icons',
            type: 'boolean',
            default: 'true',
            description: 'Show the glyph beside each label. false leaves text only.',
          },
          {
            name: '…div props',
            type: "React.ComponentProps<'div'>",
            description:
              'Anything else is forwarded to the group element. aria-label is worth setting: the segments are labelled, the group is not.',
          },
        ]}
      />
    </>
  );
}
