import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Divider } from '../../components/Divider';
import { HintoricLogo } from '../../components/HintoricLogo';
import { Layout } from '../../components/Layout';
import { Typography } from '../../components/Typography';
import { renderEmail } from '../../render';
import { emailFonts } from '../../tokens';
import type { RenderedEmail } from '../SecurityActivityAlert';
import type { AuthCodeContext, AuthCodeProps } from './types';

function contextOf({ purpose, code, email }: AuthCodeProps): AuthCodeContext {
  return { purpose, code, email };
}

/**
 * A one-time code from a sign-in flow: verifying an address, registering,
 * signing in, recovering an account. Heading, one sentence, the code large
 * enough to type from a phone, and — when the flow has one — a button that
 * does the same as the code.
 */
export function AuthCodeEmail(props: AuthCodeProps) {
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
      <AuthCodeContent {...props} />
    </Layout>
  );
}

/** What goes inside the card, without the document — for in-app previews (render `ColorSchemeStyles` next to it). */
export function AuthCodeContent(props: AuthCodeProps) {
  const { messages, code, url, expiresInMinutes } = props;
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
      {/* Outlined, not soft: in dark the layout card is surface-1, exactly the
          soft-neutral fill, which would make the box vanish. */}
      <Card>
        {/* One text node, no spaces between the digits: a double-click selects
            the whole code and copies it as it is to be typed. The letter
            spacing trails the last digit too, so the indent re-centres it. */}
        <Typography
          level="h2"
          component="p"
          textAlign="center"
          style={{ margin: 0, fontFamily: emailFonts.code, letterSpacing: '0.25em', textIndent: '0.25em', fontWeight: 700 }}
        >
          <span data-auth-code="">{code}</span>
        </Typography>
      </Card>
      {expiresInMinutes !== undefined && (
        <Typography level="body-xs" component="p" textAlign="center" textColor="icon" style={{ margin: '12px 0 0', fontWeight: 400 }}>
          {messages.expiry(expiresInMinutes)}
        </Typography>
      )}
      {url && (
        <div style={{ marginTop: '24px' }}>
          <Button href={url} size="lg" fullWidth>
            {messages.button(ctx)}
          </Button>
        </div>
      )}
      <Divider style={{ margin: '32px 0 24px' }} />
      <Typography level="body-xs" component="p" textAlign="center" style={{ margin: 0, fontWeight: 400 }}>
        {messages.ignore(ctx)}
      </Typography>
    </>
  );
}

/** Subject, HTML and plain-text body in one call — what a mail API's send() takes. */
export async function renderAuthCode(props: AuthCodeProps): Promise<RenderedEmail> {
  const { html, text } = await renderEmail(<AuthCodeEmail {...props} />);
  return { subject: props.messages.subject(contextOf(props)), html, text };
}
