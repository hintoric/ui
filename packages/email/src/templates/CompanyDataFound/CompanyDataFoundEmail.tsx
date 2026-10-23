import { Img } from 'react-email';
import { Button } from '../../components/Button';
import { HintoricLogo } from '../../components/HintoricLogo';
import { Layout } from '../../components/Layout';
import { Typography } from '../../components/Typography';
import { renderEmail } from '../../render';
import { emailClass } from '../../styles';
import { emailFonts } from '../../tokens';
import type { RenderedEmail } from '../SecurityActivityAlert';
import type { CompanyDataFoundContext, CompanyDataFoundProps } from './types';

/*
 * The shop with a magnifier and a check badge, one PNG per scheme at twice
 * the 96px it is shown at — mail clients can't recolour an image, and Gmail
 * and desktop Outlook drop SVG. Clients without the dark stylesheet keep the
 * light one. Decorative, so it has no alt text: the heading says it all.
 */
export const COMPANY_DATA_FOUND_ICON = {
  light: 'https://cdn.hintoric.com/assets/icons/company-data-found/light-2x.png',
  dark: 'https://cdn.hintoric.com/assets/icons/company-data-found/dark-2x.png',
  size: 96,
};

function FoundIcon() {
  const { size } = COMPANY_DATA_FOUND_ICON;
  const img = (src: string, className: string, display: 'block' | 'none') => (
    // max-width: none against a host's `img { max-width: 100% }`, as in Alert's icon.
    <Img
      src={src}
      width={size}
      height={size}
      alt=""
      className={className}
      style={{ display, width: `${size}px`, height: `${size}px`, maxWidth: 'none', margin: '24px auto 0', border: 0 }}
    />
  );
  return (
    <>
      {img(COMPANY_DATA_FOUND_ICON.light, emailClass.lightOnly, 'block')}
      {img(COMPANY_DATA_FOUND_ICON.dark, emailClass.darkOnly, 'none')}
    </>
  );
}

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
        <FoundIcon />
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
