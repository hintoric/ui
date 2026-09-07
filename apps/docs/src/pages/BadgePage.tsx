import { Avatar, Badge, Button, IconButton } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function BadgePage() {
  return (
    <>
      <h1>Badge</h1>
      <p className="docs-lede">
        A small count or dot pinned to the corner of whatever it wraps. Its defaults break the
        library&apos;s usual pattern: <code>solid</code>/<code>primary</code>, not{' '}
        <code>outlined</code>/<code>neutral</code>.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <Badge badgeContent={4}>
            <Avatar>JW</Avatar>
          </Badge>
          <Badge badgeContent={12} color="danger">
            <IconButton variant="outlined" color="neutral" aria-label="Inbox">
              ✉
            </IconButton>
          </Badge>
          <Badge badgeContent="new" color="success">
            <Button variant="outlined" color="neutral">
              Releases
            </Button>
          </Badge>
        </div>
      </Demo>
      <Code>{`<Badge badgeContent={4}>
  <Avatar>JW</Avatar>
</Badge>`}</Code>

      <h2>A bare dot</h2>
      <p>
        Without <code>badgeContent</code> the badge is invisible entirely. Pass an empty string for
        a dot with no number in it.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <Badge badgeContent="" color="danger">
            <Avatar>AL</Avatar>
          </Badge>
          <Badge badgeContent="" color="success">
            <Avatar>BK</Avatar>
          </Badge>
        </div>
      </Demo>
      <Code>{`<Badge badgeContent="" color="danger">
  <Avatar>AL</Avatar>
</Badge>`}</Code>

      <h2>Capping the number</h2>
      <p>
        Counts above <code>max</code> are rendered as <code>{'{max}'}+</code>. The default cap is
        99.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <Badge badgeContent={99}>
            <Avatar>1</Avatar>
          </Badge>
          <Badge badgeContent={100}>
            <Avatar>2</Avatar>
          </Badge>
          <Badge badgeContent={1200} max={999}>
            <Avatar>3</Avatar>
          </Badge>
        </div>
      </Demo>
      <Code>{`<Badge badgeContent={1200} max={999}>…</Badge>`}</Code>

      <h2>Zero and invisible</h2>
      <p>
        A count of zero hides the badge unless <code>showZero</code> is set.{' '}
        <code>invisible</code> hides it regardless of the content.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <Badge badgeContent={0}>
            <Avatar>0</Avatar>
          </Badge>
          <Badge badgeContent={0} showZero>
            <Avatar>0</Avatar>
          </Badge>
          <Badge badgeContent={7} invisible>
            <Avatar>7</Avatar>
          </Badge>
        </div>
      </Demo>
      <Code>{`<Badge badgeContent={0} showZero>…</Badge>
<Badge badgeContent={7} invisible>…</Badge>`}</Code>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <Badge badgeContent={8} variant={variant} color={color}>
              <Avatar size="sm">A</Avatar>
            </Badge>
          )}
        />
      </Demo>
      <Code>{`<Badge badgeContent={8} variant="soft" color="warning">…</Badge>`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <Badge badgeContent={5} size="sm">
            <Avatar size="sm">S</Avatar>
          </Badge>
          <Badge badgeContent={5} size="md">
            <Avatar size="md">M</Avatar>
          </Badge>
          <Badge badgeContent={5} size="lg">
            <Avatar size="lg">L</Avatar>
          </Badge>
        </div>
      </Demo>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The element the badge is anchored to.' },
          { name: 'badgeContent', type: 'React.ReactNode', description: 'What the badge shows. Omitting it hides the badge.' },
          { name: 'max', type: 'number', default: '99', description: 'Numbers above this render as "max+".' },
          { name: 'showZero', type: 'boolean', default: 'false', description: 'Keeps the badge visible when the content is 0.' },
          { name: 'invisible', type: 'boolean', default: 'false', description: 'Hides the badge without unmounting it.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'solid'", description: 'Visual style of the badge itself.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'primary'", description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Badge diameter and font size.' },
        ]}
      />
    </>
  );
}
