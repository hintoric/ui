import { Button } from '../../components/Button';
import { HintoricLogo } from '../../components/HintoricLogo';
import { Layout } from '../../components/Layout';
import { Typography } from '../../components/Typography';
import { renderEmail } from '../../render';
import { emailFonts } from '../../tokens';
import type { WaitlistWelcomeProps } from './types';

/**
 * Sent right after someone joins the waitlist: a thank-you, what happens
 * next, one button to the website. Centred, like the other single-purpose
 * mails — logo, heading, two short paragraphs, button, sign-off.
 */
export function WaitlistWelcomeEmail(props: WaitlistWelcomeProps) {
  const { messages } = props;
  return (
    <Layout
      lang={messages.lang}
      preview={messages.preview}
      colorScheme={props.colorScheme}
      footer={
        <Typography level="body-xs" component="p" textAlign="center" textColor="icon" style={{ fontWeight: 400 }}>
          {messages.footer}
          {props.legalNotice && (
            <>
              <br />
              {props.legalNotice}
            </>
          )}
        </Typography>
      }
    >
      <WaitlistWelcomeContent {...props} />
    </Layout>
  );
}

/** What goes inside the card, without the document — for in-app previews (render `ColorSchemeStyles` next to it). */
export function WaitlistWelcomeContent({ messages, websiteUrl }: WaitlistWelcomeProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      <HintoricLogo />
      <Typography level="body-xs" component="p" textAlign="center" textColor="icon" style={{ margin: '24px 0 8px', fontWeight: 400 }}>
        {messages.eyebrow}
      </Typography>
      <Typography level="h3" component="h1" style={{ margin: '0 0 16px', fontFamily: emailFonts.heading }}>
        {messages.heading}
      </Typography>
      <Typography level="body-sm" style={{ marginBottom: '12px' }}>
        {messages.body1}
      </Typography>
      <Typography level="body-sm" style={{ marginBottom: '24px' }}>
        {messages.body2}
      </Typography>
      <Button href={websiteUrl} size="lg" fullWidth>
        {messages.cta}
      </Button>
      <Typography level="body-xs" component="p" textAlign="center" textColor="icon" style={{ margin: '24px 0 0', fontWeight: 400 }}>
        {messages.signoff}
      </Typography>
    </div>
  );
}

export interface RenderedWaitlistWelcome {
  subject: string;
  html: string;
  text: string;
}

/** Subject, HTML and plain-text body in one call — what SES, Resend and the like take. */
export async function renderWaitlistWelcome(props: WaitlistWelcomeProps): Promise<RenderedWaitlistWelcome> {
  const { html, text } = await renderEmail(<WaitlistWelcomeEmail {...props} />);
  return { subject: props.messages.subject, html, text };
}
