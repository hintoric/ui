import { Textarea } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function TextareaPage() {
  return (
    <>
      <h1>Textarea</h1>
      <p className="docs-lede">
        A multi-line text field sharing Input&apos;s styling. Like Joy UI&apos;s, it starts at one
        row and grows with its content; the resize handle is disabled.
      </p>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <Textarea variant={variant} color={color} placeholder={color} aria-label={`${variant}-${color}`} />
          )}
        />
      </Demo>
      <Code>{`<Textarea variant="outlined" color="neutral" placeholder="Message" />`}</Code>

      <h2>Rows</h2>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
          <Textarea placeholder="Grows as you type" aria-label="autosize" />
          <Textarea minRows={3} placeholder="At least three rows" aria-label="min rows" />
          <Textarea maxRows={3} defaultValue={'One\nTwo\nThree\nFour\nFive'} aria-label="max rows" />
        </div>
      </Demo>
      <Code>{`<Textarea minRows={3} maxRows={6} placeholder="Message" />`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'outlined'", description: 'Visual style of the field.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette; also drives the focus ring color.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls padding and font size.' },
          { name: 'minRows', type: 'number', default: '1', description: 'Smallest height, in rows. The field grows with its content from here. An existing rows prop is read as minRows.' },
          { name: 'maxRows', type: 'number', description: 'Largest height, in rows. Past it the content scrolls.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Native disabled state.' },
        ]}
      />
    </>
  );
}
