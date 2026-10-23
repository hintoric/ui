import { useEffect, useState } from 'react';
import { useColorScheme } from '@hintoric/ui';
import { CompanyDataFoundEmail, companyDataFoundMessagesDe, companyDataFoundMessagesEn, renderEmail } from '@hintoric/email';
import { Demo, Code } from '../../components/Demo';
import { EmailPreview } from '../../components/EmailPreview';
import { PropsTable } from '../../components/PropsTable';
import { SegmentedToggle } from '../../components/SegmentedToggle';

const shared = {
  website: 'muster-bau.de',
  reviewUrl: 'https://app.example.com/settings/company',
  workspaceName: 'Muster Bau',
  legalNotice: 'Muster GmbH · Musterstraße 1 · 79098 Freiburg',
};

export function CompanyDataFoundPage() {
  const { resolvedMode } = useColorScheme();
  const [lang, setLang] = useState<'de' | 'en'>('de');
  const [named, setNamed] = useState<'named' | 'unnamed'>('named');
  const [html, setHtml] = useState('');

  useEffect(() => {
    let current = true;
    renderEmail(
      <CompanyDataFoundEmail
        {...shared}
        companyName={named === 'named' ? 'Muster Bau GmbH' : undefined}
        messages={lang === 'de' ? companyDataFoundMessagesDe : companyDataFoundMessagesEn}
        colorScheme={resolvedMode}
      />,
    ).then((rendered) => {
      if (current) setHtml(rendered.html);
    });
    return () => {
      current = false;
    };
  }, [lang, named, resolvedMode]);

  return (
    <>
      <h1>Company data found</h1>
      <p className="docs-lede">
        Company details were found on the website behind the reader&rsquo;s mail domain and wait for review. One
        sentence, one button to the prefilled settings page, and the promise that nothing is taken over before the
        reader confirms. The fields themselves are not listed: the review page shows them.
      </p>

      <h2>Preview</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <SegmentedToggle<'named' | 'unnamed'>
            aria-label="Company name"
            value={named}
            options={[
              { value: 'named', label: 'With name' },
              { value: 'unnamed', label: 'Without name' },
            ]}
            onChange={setNamed}
          />
          <SegmentedToggle<'de' | 'en'>
            aria-label="Language"
            value={lang}
            options={[
              { value: 'de', label: 'Deutsch' },
              { value: 'en', label: 'English' },
            ]}
            onChange={setLang}
          />
        </div>
        {html && <EmailPreview key={html} html={html} title="Company data found preview" height={560} />}
      </Demo>

      <h2>Sending</h2>
      <p>
        The company name comes from a third-party page, so it is plain text and escaped like everything else; a
        blank or missing name makes the texts speak of &ldquo;your company&rdquo;. <code>website</code> is the
        domain, not a URL, and is not linked.
      </p>
      <Code>{`import { renderCompanyDataFound, companyDataFoundMessagesDe } from '@hintoric/email';

const { subject, html, text } = await renderCompanyDataFound({
  companyName: 'Muster Bau GmbH',
  website: 'muster-bau.de',
  reviewUrl: 'https://app.hintoric.com/settings/company',
  workspaceName: 'Muster Bau',
  messages: companyDataFoundMessagesDe,
});`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'companyName', type: 'string', description: 'Optional. The name found on the website. Without it the texts say “your company”.' },
          { name: 'website', type: 'string', description: 'The domain the details were read from, e.g. muster-bau.de.' },
          { name: 'reviewUrl', type: 'string', description: 'The prefilled company settings page. Unsafe schemes are dropped, which leaves the mail without a button.' },
          { name: 'workspaceName', type: 'string', description: 'The workspace the details are for, named in the footer.' },
          {
            name: 'messages',
            type: 'CompanyDataFoundMessages',
            description: 'Every string. Pass companyDataFoundMessagesDe / …En or spread one and override.',
          },
          { name: 'legalNotice', type: 'string', description: 'Optional line under the footer.' },
          { name: 'colorScheme', type: "'light' | 'dark'", description: 'Forces a scheme. Previews only.' },
        ]}
      />
    </>
  );
}
