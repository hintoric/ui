import { EMAIL_COLORS, EMAIL_VARIANTS, Alert, AlertTitle } from '@hintoric/email';
import { Demo, Code } from '../../components/Demo';
import { PropsTable } from '../../components/PropsTable';
import { VariantColorGrid } from '../../components/VariantColorGrid';
import { COLOR_PROP, EmailPageIntro, VARIANT_PROP } from './shared';

export function EmailAlertPage() {
  return (
    <>
      <EmailPageIntro
        name="Alert"
        web="Alert"
        lede="Alert for email — the one sentence a mail must not be skimmed past, such as “Mit dieser Adresse gibt es kein Konto.”"
      />
      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={EMAIL_VARIANTS}
          colors={EMAIL_COLORS}
          renderCell={(variant, color) => (
            <Alert variant={variant} color={color} size="sm">
              {color}
            </Alert>
          )}
        />
      </Demo>
      <Code>{`<Alert color="warning">Mit max@muster.de gibt es kein hintoric-Konto.</Alert>`}</Code>

      <h2>Title</h2>
      <Demo>
        <Alert color="danger">
          <AlertTitle>Neue Anmeldung</AlertTitle>
          <span style={{ fontWeight: 400 }}>Von Chrome auf Windows in Berlin, am 28. September um 19:31.</span>
        </Alert>
      </Demo>
      <Code>{`<Alert color="danger">
  <AlertTitle>Neue Anmeldung</AlertTitle>
  <span style={{ fontWeight: 400 }}>Von Chrome auf Windows in Berlin …</span>
</Alert>`}</Code>
      <p>
        <code>AlertTitle</code> is 16px / 24px semibold in the alert&rsquo;s colour. The alert itself is medium
        weight, so body text under a title wants <code>fontWeight: 400</code>.
      </p>

      <h2>Decorators</h2>
      <p>
        <code>startDecorator</code> and <code>endDecorator</code> each get a cell of their own and sit centred
        on the first line, as on the web. Email has no icon font and Gmail drops SVG: use a PNG at twice its
        display size. The decorator&rsquo;s cell sets no line height of its own, so text there needs its own
        font size.
      </p>
      <Code>{`<Alert color="warning" startDecorator={<img src="https://cdn.example.com/warning@2x.png" width={16} height={16} alt="" />}>
  Der Code ist nur 15 Minuten gültig.
</Alert>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { ...VARIANT_PROP, default: "'soft'" },
          { ...COLOR_PROP, default: "'neutral'" },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: '8 / 12 / 16px padding, 12 / 14 / 16px text.' },
          { name: 'startDecorator', type: 'ReactNode', description: 'A box on the first line, before the text.' },
          { name: 'endDecorator', type: 'ReactNode', description: 'A box on the first line, after the text.' },
        ]}
      />
    </>
  );
}
