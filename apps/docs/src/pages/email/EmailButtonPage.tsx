import { EMAIL_COLORS, EMAIL_VARIANTS, Button } from '@hintoric/email';
import { Demo, Code } from '../../components/Demo';
import { PropsTable } from '../../components/PropsTable';
import { VariantColorGrid } from '../../components/VariantColorGrid';
import { COLOR_PROP, EmailPageIntro, VARIANT_PROP } from './shared';

export function EmailButtonPage() {
  return (
    <>
      <EmailPageIntro name="Button" web="Button" lede="A link that looks like Button — the call to action of an email." />
      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={EMAIL_VARIANTS}
          colors={EMAIL_COLORS}
          renderCell={(variant, color) => (
            <Button href="https://example.com" variant={variant} color={color} size="sm">
              Button
            </Button>
          )}
        />
      </Demo>
      <h2>Sizes &amp; full width</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Button key={size} href="https://example.com" size={size}>
              size=&quot;{size}&quot;
            </Button>
          ))}
        </div>
        <div style={{ maxWidth: 344, marginTop: 16 }}>
          <Button href="https://example.com" size="lg" fullWidth>
            Aktivität prüfen
          </Button>
        </div>
      </Demo>
      <Code>{`<Button href="https://app.example.com/activity/4711" size="lg" fullWidth>
  Aktivität prüfen
</Button>`}</Code>
      <h2>Differences to Button</h2>
      <p>
        No hover, active or focus states — mail clients don&rsquo;t apply them reliably — and no{' '}
        <code>loading</code>, <code>disabled</code> or decorators. <code>href</code> is required and only
        http(s) URLs render; anything else renders nothing.
      </p>
      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'href', type: 'string', description: 'Required. Only http(s) URLs render.' },
          { ...VARIANT_PROP, default: "'solid'" },
          { ...COLOR_PROP, default: "'primary'" },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Same heights as Button: 32 / 36 / 44px.' },
          { name: 'pill', type: 'boolean', default: 'false', description: 'Fully rounded.' },
          { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Stretches to the container.' },
        ]}
      />
    </>
  );
}
