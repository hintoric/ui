import { Chip, ChipDelete } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function ChipPage() {
  return (
    <>
      <h1>Chip</h1>
      <p className="docs-lede">A compact element for a tag, filter, or attribute — a pill-shaped surface.</p>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <Chip variant={variant} color={color}>
              {color}
            </Chip>
          )}
        />
      </Demo>
      <Code>{`<Chip variant="soft" color="primary">Beta</Chip>`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Chip size="sm">Small</Chip>
          <Chip size="md">Medium</Chip>
          <Chip size="lg">Large</Chip>
        </div>
      </Demo>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'soft'", description: 'Visual style of the chip.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls height, padding and font size.' },
          { name: 'startDecorator', type: 'React.ReactNode', description: 'Element rendered before the label.' },
          { name: 'endDecorator', type: 'React.ReactNode', description: 'Element rendered after the label.' },
          { name: 'component', type: 'React.ElementType', default: "'div'", description: 'Renders as a different element/component.' },
        ]}
      />

      <h2>Deletable chips</h2>
      <p>
        <code>ChipDelete</code> is a button meant for a chip&apos;s <code>endDecorator</code>. It
        takes <code>onDelete</code> rather than <code>onClick</code>, and also fires on the
        Backspace and Delete keys while focused.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip endDecorator={<ChipDelete onDelete={() => undefined} />}>Design</Chip>
          <Chip
            variant="solid"
            color="primary"
            endDecorator={<ChipDelete variant="plain" color="primary" onDelete={() => undefined} />}
          >
            Frontend
          </Chip>
          <Chip
            variant="soft"
            color="danger"
            endDecorator={<ChipDelete variant="soft" color="danger" onDelete={() => undefined} />}
          >
            Blocked
          </Chip>
          <Chip endDecorator={<ChipDelete disabled onDelete={() => undefined} />}>Locked</Chip>
        </div>
      </Demo>
      <Code>{`<Chip endDecorator={<ChipDelete onDelete={() => remove(tag)} />}>
  Design
</Chip>`}</Code>

      <h2>ChipDelete props</h2>
      <PropsTable
        rows={[
          { name: 'onDelete', type: 'React.MouseEventHandler<HTMLButtonElement>', description: 'Called on click, and on Backspace or Delete while focused.' },
          { name: 'children', type: 'React.ReactNode', default: 'a cross icon', description: 'Replaces the default icon.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'plain'", description: 'Visual style of the delete button.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the button.' },
        ]}
      />
    </>
  );
}
