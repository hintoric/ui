import { EMAIL_COLORS, Link } from '@hintoric/email';
import { Demo, Code } from '../../components/Demo';
import { PropsTable } from '../../components/PropsTable';
import { COLOR_PROP, EmailPageIntro } from './shared';

export function EmailLinkPage() {
  return (
    <>
      <EmailPageIntro name="Link" web="Link" lede="Link's colours for email, underlined by default." />
      <h2>Colors</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {EMAIL_COLORS.map((color) => (
            <Link key={color} href="https://example.com" color={color}>
              {color}
            </Link>
          ))}
        </div>
      </Demo>
      <Code>{`<Link href="https://app.example.com/activity">Aktivitätsprotokoll</Link>`}</Code>
      <p>
        The web Link underlines on hover; email has no hover, so the default is <code>always</code>. Unsafe
        URLs (<code>javascript:</code>, <code>data:</code>, relative) render as plain text.
      </p>
      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'href', type: 'string', description: 'http(s) and mailto only.' },
          { ...COLOR_PROP, default: "'primary'" },
          { name: 'underline', type: "'none' | 'always'", default: "'always'", description: 'No hover in email.' },
        ]}
      />
    </>
  );
}
