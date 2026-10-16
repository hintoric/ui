import { Button } from '../../components/Button';
import { Divider } from '../../components/Divider';
import { HintoricLogo } from '../../components/HintoricLogo';
import { Layout } from '../../components/Layout';
import { Typography } from '../../components/Typography';
import { renderEmail } from '../../render';
import { emailFonts } from '../../tokens';
import type { RenderedEmail } from '../SecurityActivityAlert';
import type { AuthLinkContext, AuthLinkProps } from './types';

function contextOf({ purpose, url, email }: AuthLinkProps): AuthLinkContext {
  return { purpose, url, email };
}

/**
 * A link from a sign-in flow that has no code: confirming an address or
 * recovering an account. Heading, one sentence and the button — the link is
 * the whole mail, so it is the one thing on it.
 */
export function AuthLinkEmail(props: AuthLinkProps) {
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
      <AuthLinkContent {...props} />
    </Layout>
  );
}

/** What goes inside the card, without the document — for in-app previews (render `ColorSchemeStyles` next to it). */
export function AuthLinkContent(props: AuthLinkProps) {
  const { messages, url, expiresInMinutes } = props;
  const ctx = contextOf(props);
  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <HintoricLogo />
        <Typography level="h3" component="h1" style={{ margin: '16px 0 12px', fontFamily: emailFonts.heading }}>
          {messages.heading(ctx)}
        </Typography>
        <Typography level="body-sm" style={{ marginBottom: '24px' }}>
          {messages.intro(ctx)}
        </Typography>
      </div>
      <Button href={url} size="lg" fullWidth>
        {messages.button(ctx)}
      </Button>
      {expiresInMinutes !== undefined && (
        <Typography level="body-xs" component="p" textAlign="center" textColor="icon" style={{ margin: '12px 0 0', fontWeight: 400 }}>
          {messages.expiry(expiresInMinutes)}
        </Typography>
      )}
      <Divider style={{ margin: '32px 0 24px' }} />
      <Typography level="body-xs" component="p" textAlign="center" style={{ margin: 0, fontWeight: 400 }}>
        {messages.ignore(ctx)}
      </Typography>
    </>
  );
}

/** Subject, HTML and plain-text body in one call — what a mail API's send() takes. */
export async function renderAuthLink(props: AuthLinkProps): Promise<RenderedEmail> {
  const { html, text } = await renderEmail(<AuthLinkEmail {...props} />);
  return { subject: props.messages.subject(contextOf(props)), html, text };
}
