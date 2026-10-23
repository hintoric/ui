import { Button } from '../../components/Button';
import { HintoricLogo } from '../../components/HintoricLogo';
import { Layout } from '../../components/Layout';
import { Typography } from '../../components/Typography';
import { renderEmail } from '../../render';
import { emailFonts } from '../../tokens';
import type { RenderedEmail } from '../SecurityActivityAlert';
import type { CompanyDataFoundContext, CompanyDataFoundProps } from './types';

function contextOf({ companyName, website, workspaceName }: CompanyDataFoundProps): CompanyDataFoundContext {
  // A blank name is no name: the texts fall back to "your company".
  return { companyName: companyName?.trim() || undefined, website, workspaceName };
}

/**
 * Company details were found on the website behind the reader's mail domain
 * and wait for review. Heading, one sentence, the button, and the promise
 * that nothing is taken over before the reader confirms. The fields
 * themselves are deliberately not listed: the review page shows them.
 */
export function CompanyDataFoundEmail(props: CompanyDataFoundProps) {
  const { messages } = props;
  const ctx = contextOf(props);
  return (
    <Layout
      lang={messages.lang}
      preview={messages.preview(ctx)}
      colorScheme={props.colorScheme}
      footer={
        <Typography level="body-xs" component="p" textAlign="center" textColor="icon" style={{ fontWeight: 400 }}>
          {messages.footer(ctx)}
          {props.legalNotice && (
            <>
              <br />
              {props.legalNotice}
            </>
          )}
        </Typography>
      }
    >
      <CompanyDataFoundContent {...props} />
    </Layout>
  );
}

/** What goes inside the card, without the document — for in-app previews (render `ColorSchemeStyles` next to it). */
export function CompanyDataFoundContent(props: CompanyDataFoundProps) {
  const { messages } = props;
  const ctx = contextOf(props);
  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <HintoricLogo />
        <Typography level="h3" component="h1" style={{ margin: '16px 0 12px', fontFamily: emailFonts.heading }}>
          {messages.heading}
        </Typography>
        <Typography level="body-sm" style={{ marginBottom: '24px' }}>
          {messages.intro(ctx)}
        </Typography>
      </div>
      <Button href={props.reviewUrl} size="lg" fullWidth>
        {messages.button}
      </Button>
      <Typography level="body-xs" component="p" textAlign="center" textColor="icon" style={{ margin: '12px 0 0', fontWeight: 400 }}>
        {messages.confirmHint}
      </Typography>
    </>
  );
}

/** Subject, HTML and plain-text body in one call — what a mail API's send() takes. */
export async function renderCompanyDataFound(props: CompanyDataFoundProps): Promise<RenderedEmail> {
  const { html, text } = await renderEmail(<CompanyDataFoundEmail {...props} />);
  return { subject: props.messages.subject(contextOf(props)), html, text };
}
