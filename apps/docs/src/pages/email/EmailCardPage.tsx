import { EMAIL_COLORS, EMAIL_VARIANTS, Card } from '@hintoric/email';
import { Demo, Code } from '../../components/Demo';
import { PropsTable } from '../../components/PropsTable';
import { VariantColorGrid } from '../../components/VariantColorGrid';
import { COLOR_PROP, EmailPageIntro, VARIANT_PROP } from './shared';

export function EmailCardPage() {
  return (
    <>
      <EmailPageIntro name="Card" web="Card" lede="Card's surface for email: variant colours, radius md and 16px padding." />
      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={EMAIL_VARIANTS}
          colors={EMAIL_COLORS}
          renderCell={(variant, color) => (
            <Card variant={variant} color={color}>
              {color}
            </Card>
          )}
        />
      </Demo>
      <Code>{`<Card variant="soft" color="warning">
  <Typography level="title-sm">Hinweis</Typography>
</Card>`}</Code>
      <p>
        Card&rsquo;s <code>gap</code> has no email equivalent — space the children with their own margins.
      </p>
      <h2>Props</h2>
      <PropsTable rows={[{ ...VARIANT_PROP, default: "'outlined'" }, { ...COLOR_PROP, default: "'neutral'" }]} />
    </>
  );
}
