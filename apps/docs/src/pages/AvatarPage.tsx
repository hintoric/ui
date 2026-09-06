import { Avatar, AvatarGroup } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function AvatarPage() {
  return (
    <>
      <h1>Avatar</h1>
      <p className="docs-lede">
        A circular image, icon, or initials representing a person or entity. Unlike Sheet/Chip/Card,{' '}
        <code>outlined</code> and <code>plain</code> render fully transparent, not surface-filled.
      </p>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <Avatar variant={variant} color={color}>
              {color.slice(0, 2).toUpperCase()}
            </Avatar>
          )}
        />
      </Demo>
      <Code>{`<Avatar variant="soft" color="primary">JW</Avatar>`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Avatar size="sm">SM</Avatar>
          <Avatar size="md">MD</Avatar>
          <Avatar size="lg">LG</Avatar>
        </div>
      </Demo>

      <h2>Image source</h2>
      <Demo>
        <Avatar
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%236b5bd6'/%3E%3C/svg%3E"
          alt="Placeholder"
        />
      </Demo>
      <Code>{`<Avatar src="/photo.jpg" alt="Johannes Waigel" />`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'soft'", description: 'Visual style of the avatar.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls the circle diameter and font size.' },
          { name: 'src', type: 'string', description: 'Image source; when set, replaces children.' },
          { name: 'srcSet', type: 'string', description: 'Responsive image source set.' },
          { name: 'alt', type: 'string', description: 'Alt text for the image.' },
          { name: 'component', type: 'React.ElementType', default: "'div'", description: 'Renders as a different element/component.' },
        ]}
      />

      <h2>Grouping avatars</h2>
      <p>
        <code>AvatarGroup</code> overlaps its children and applies a shared <code>size</code>. A
        trailing avatar is the usual way to show the overflow count.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <AvatarGroup>
            <Avatar>JW</Avatar>
            <Avatar>AL</Avatar>
            <Avatar>BK</Avatar>
            <Avatar>+3</Avatar>
          </AvatarGroup>
          <AvatarGroup size="sm">
            <Avatar color="primary">JW</Avatar>
            <Avatar color="success">AL</Avatar>
            <Avatar color="warning">BK</Avatar>
          </AvatarGroup>
          <AvatarGroup size="lg">
            <Avatar variant="solid" color="primary">
              JW
            </Avatar>
            <Avatar variant="solid" color="neutral">
              AL
            </Avatar>
          </AvatarGroup>
        </div>
      </Demo>
      <Code>{`<AvatarGroup>
  <Avatar>JW</Avatar>
  <Avatar>AL</Avatar>
  <Avatar>+3</Avatar>
</AvatarGroup>`}</Code>

      <h2>AvatarGroup props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The avatars to overlap.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Shared size for the group. Set it here rather than on each avatar.' },
        ]}
      />
    </>
  );
}
