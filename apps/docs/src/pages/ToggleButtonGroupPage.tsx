import * as React from 'react';
import { Button, ToggleButtonGroup } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

function ControlledFormatting() {
  const [formats, setFormats] = React.useState<unknown[]>(['bold']);
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <ToggleButtonGroup value={formats} onChange={(_event, next) => setFormats(next)}>
        <Button value="bold" variant="outlined" color="neutral">
          Bold
        </Button>
        <Button value="italic" variant="outlined" color="neutral">
          Italic
        </Button>
        <Button value="underline" variant="outlined" color="neutral">
          Underline
        </Button>
      </ToggleButtonGroup>
      <code>{JSON.stringify(formats)}</code>
    </div>
  );
}

export function ToggleButtonGroupPage() {
  return (
    <>
      <h1>ToggleButtonGroup</h1>
      <p className="docs-lede">
        A connected group of buttons that stay pressed. Each child carries its own{' '}
        <code>value</code>; the group&apos;s <code>value</code> is the array of values currently
        selected. Selection is drawn with the variant&apos;s persistent &ldquo;active&rdquo;
        background — the same mechanism <code>ListItemButton</code> uses for its selected state.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <ToggleButtonGroup defaultValue={['left']}>
          <Button value="left" variant="outlined" color="neutral">
            Left
          </Button>
          <Button value="center" variant="outlined" color="neutral">
            Center
          </Button>
          <Button value="right" variant="outlined" color="neutral">
            Right
          </Button>
        </ToggleButtonGroup>
      </Demo>
      <Code>{`<ToggleButtonGroup defaultValue={['left']}>
  <Button value="left" variant="outlined" color="neutral">Left</Button>
  <Button value="center" variant="outlined" color="neutral">Center</Button>
</ToggleButtonGroup>`}</Code>

      <h2>Controlled</h2>
      <p>
        <code>onChange</code> receives the click event first and the next value array second,
        matching Joy UI&apos;s signature.
      </p>
      <Demo>
        <ControlledFormatting />
      </Demo>
      <Code>{`const [formats, setFormats] = React.useState<unknown[]>(['bold']);

<ToggleButtonGroup value={formats} onChange={(_event, next) => setFormats(next)}>
  <Button value="bold" variant="outlined" color="neutral">Bold</Button>
</ToggleButtonGroup>`}</Code>

      <h2>Variants &amp; colors</h2>
      <p>
        The group&apos;s <code>variant</code>/<code>color</code> choose the <em>selected</em>{' '}
        background only. The buttons&apos; own resting look still comes from the props you pass to
        each button.
      </p>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <ToggleButtonGroup variant={variant} color={color} defaultValue={['on']}>
              <Button value="on" variant="outlined" color="neutral">
                On
              </Button>
              <Button value="off" variant="outlined" color="neutral">
                Off
              </Button>
            </ToggleButtonGroup>
          )}
        />
      </Demo>
      <Code>{`<ToggleButtonGroup variant="soft" color="primary" defaultValue={['on']}>…</ToggleButtonGroup>`}</Code>

      <h2>Spacing and orientation</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <ToggleButtonGroup spacing={8} defaultValue={['b']}>
            <Button value="a" variant="soft" color="neutral">
              A
            </Button>
            <Button value="b" variant="soft" color="neutral">
              B
            </Button>
            <Button value="c" variant="soft" color="neutral">
              C
            </Button>
          </ToggleButtonGroup>
          <ToggleButtonGroup orientation="vertical" defaultValue={['top']}>
            <Button value="top" variant="outlined" color="neutral">
              Top
            </Button>
            <Button value="bottom" variant="outlined" color="neutral">
              Bottom
            </Button>
          </ToggleButtonGroup>
        </div>
      </Demo>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'Buttons to toggle. Each needs its own value prop.' },
          { name: 'value', type: 'unknown[]', description: 'Values currently selected. Use when controlled.' },
          { name: 'defaultValue', type: 'unknown[]', default: '[]', description: 'Initially selected values (uncontrolled).' },
          { name: 'onChange', type: '(event: React.MouseEvent, value: unknown[]) => void', description: 'Called with the click event and the next selection.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'outlined'", description: 'Variant whose active background marks a selected button.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette of that selected background.' },
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction of the group.' },
          { name: 'spacing', type: 'number | string', default: '0', description: 'Gap between children. 0 renders them connected with dividers.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every child button.' },
        ]}
      />

      <h2>Differences from Joy UI</h2>
      <p>
        Joy UI&apos;s ToggleButtonGroup also supports an exclusive single-value mode through the
        same <code>value</code> prop. This build implements the multi-select array mode only; for a
        single choice, reach for <code>RadioGroup</code> instead.
      </p>
    </>
  );
}
