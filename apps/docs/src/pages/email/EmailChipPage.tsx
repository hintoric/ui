import { EMAIL_COLORS, EMAIL_VARIANTS, Chip } from '@hintoric/email';
import { Demo, Code } from '../../components/Demo';
import { PropsTable } from '../../components/PropsTable';
import { VariantColorGrid } from '../../components/VariantColorGrid';
import { COLOR_PROP, EmailPageIntro, VARIANT_PROP } from './shared';

export function EmailChipPage() {
  return (
    <>
      <EmailPageIntro name="Chip" web="Chip" lede="Chip for email — a label such as “Sicherheitswarnung”." />
      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={EMAIL_VARIANTS}
          colors={EMAIL_COLORS}
          renderCell={(variant, color) => (
            <Chip variant={variant} color={color} size="sm">
              {color}
            </Chip>
          )}
        />
      </Demo>
      <Code>{`<Chip color="danger">Sicherheitswarnung</Chip>`}</Code>
      <h2>Props</h2>
      <PropsTable
        rows={[
          { ...VARIANT_PROP, default: "'soft'" },
          { ...COLOR_PROP, default: "'neutral'" },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: '20 / 24 / 28px high.' },
        ]}
      />
    </>
  );
}
