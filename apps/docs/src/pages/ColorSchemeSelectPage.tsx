import { ColorSchemeSelect } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

export function ColorSchemeSelectPage() {
  return (
    <>
      <h1>ColorSchemeSelect</h1>
      <p className="docs-lede">
        The form-control colour scheme form, for a settings page that already has select fields
        beside it.
      </p>

      <h2>Basic usage</h2>
      <p>
        Like <code>Select</code> itself, it fills the width of its container — put it in a sized
        wrapper or a <code>FormControl</code>.
      </p>
      <Demo>
        <div style={{ width: 240 }}>
          <ColorSchemeSelect />
        </div>
      </Demo>
      <Code>{`import { ColorSchemeSelect } from '@hintoric/ui';

<div style={{ width: 240 }}>
  <ColorSchemeSelect />
</div>`}</Code>

      <h2>The chosen option follows the chosen mode</h2>
      <p>
        The trigger reads “System” while the page is dark, for the same reason the other forms show{' '}
        <code>mode</code> rather than <code>resolvedMode</code>.
      </p>
      <p>
        The options carry no glyphs: <code>Select</code> renders the chosen option&apos;s content
        into the trigger, and an icon there duplicates what the label already says. The forms that do
        show icons are the ones without a value display.
      </p>

      <h2>Translated labels</h2>
      <Demo>
        <div style={{ width: 240 }}>
          <ColorSchemeSelect labels={{ system: 'Automatisch', light: 'Hell', dark: 'Dunkel' }} />
        </div>
      </Demo>
      <Code>{`<ColorSchemeSelect labels={{ system: 'Automatisch', light: 'Hell', dark: 'Dunkel' }} />`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ width: 240 }}>
          <ColorSchemeSelect size="sm" />
        </div>
      </Demo>
      <Demo>
        <div style={{ width: 240 }}>
          <ColorSchemeSelect size="lg" />
        </div>
      </Demo>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: 'variant',
            type: "'solid' | 'soft' | 'outlined' | 'plain'",
            default: "'outlined'",
            description: 'Passed through to Select.',
          },
          {
            name: 'color',
            type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'",
            default: "'neutral'",
            description: 'Passed through to Select.',
          },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: 'Passed through to Select.',
          },
          {
            name: 'labels',
            type: '{ system?: ReactNode; light?: ReactNode; dark?: ReactNode }',
            description: 'Partially overrides the English defaults System / Light / Dark.',
          },
          {
            name: '…button props',
            type: "React.ComponentProps<'button'>",
            description:
              'Anything else is forwarded to the trigger. aria-label or a FormLabel is worth adding: the trigger reads as its current value alone.',
          },
        ]}
      />
    </>
  );
}
