import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { HintoricLogo } from '../../components/HintoricLogo';
import { Layout } from '../../components/Layout';
import { Typography } from '../../components/Typography';
import { renderEmail } from '../../render';
import { emailFonts } from '../../tokens';
import type { RenderedEmail } from '../SecurityActivityAlert';
import type { AuthNoAccountContext, AuthNoAccountProps } from './types';

function contextOf({ purpose, email }: AuthNoAccountProps): AuthNoAccountContext {
  return { purpose, email };
}

/**
 * The answer to a code request for an address without an account: no code,
 * only what was attempted, the fact itself in a warning alert, the likely
 * mix-up, and — when given — a way to create the account.
 */
export function AuthNoAccountEmail(props: AuthNoAccountProps) {
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
      <AuthNoAccountContent {...props} />
    </Layout>
  );
}

/** What goes inside the card, without the document — for in-app previews (render `ColorSchemeStyles` next to it). */
export function AuthNoAccountContent(props: AuthNoAccountProps) {
  const { messages, registrationUrl } = props;
  const ctx = contextOf(props);
  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <HintoricLogo />
        <Typography level="h3" component="h1" style={{ margin: '16px 0 12px', fontFamily: emailFonts.heading }}>
          {messages.heading(ctx)}
        </Typography>
        <Typography level="body-sm" style={{ marginBottom: '24px' }}>
          {messages.body(ctx)}
        </Typography>
      </div>
      <Alert color="warning">{messages.alert(ctx)}</Alert>
      <div style={{ textAlign: 'center' }}>
        <Typography level="body-sm" style={{ margin: registrationUrl ? '24px 0' : '24px 0 0' }}>
          {messages.hint(ctx)}
        </Typography>
        {registrationUrl && (
          <Button href={registrationUrl} variant="outlined" color="neutral" size="lg" fullWidth>
            {messages.registerButton}
          </Button>
        )}
      </div>
    </>
  );
}

/** Subject, HTML and plain-text body in one call — what a mail API's send() takes. */
export async function renderAuthNoAccount(props: AuthNoAccountProps): Promise<RenderedEmail> {
  const { html, text } = await renderEmail(<AuthNoAccountEmail {...props} />);
  return { subject: props.messages.subject(contextOf(props)), html, text };
}
