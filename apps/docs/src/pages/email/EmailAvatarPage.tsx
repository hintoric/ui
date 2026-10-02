import { EMAIL_COLORS, EMAIL_VARIANTS, Avatar } from '@hintoric/email';
import { Demo, Code } from '../../components/Demo';
import { PropsTable } from '../../components/PropsTable';
import { VariantColorGrid } from '../../components/VariantColorGrid';
import { COLOR_PROP, EmailPageIntro, VARIANT_PROP } from './shared';

export function EmailAvatarPage() {
  return (
    <>
      <EmailPageIntro name="Avatar" web="Avatar" lede="Avatar for email — initials centred in a table cell, or an https image." />
      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={EMAIL_VARIANTS}
          colors={EMAIL_COLORS}
          renderCell={(variant, color) => (
            <Avatar variant={variant} color={color} size="sm">
              MG
            </Avatar>
          )}
        />
      </Demo>
      <Code>{`<Avatar size="sm" color="primary">MG</Avatar>`}</Code>
      <h2>Props</h2>
      <PropsTable
        rows={[
          { ...VARIANT_PROP, default: "'soft'" },
          { ...COLOR_PROP, default: "'neutral'" },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: '32 / 40 / 48px.' },
          { name: 'src', type: 'string', description: 'https image; otherwise children are shown.' },
        ]}
      />
    </>
  );
}
