import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Divider } from '../../components/Divider';
import { Layout } from '../../components/Layout';
import { Link } from '../../components/Link';
import { Typography } from '../../components/Typography';
import { HintoricLogo } from '../../components/HintoricLogo';
import { renderEmail } from '../../render';
import { emailFonts } from '../../tokens';
import type { SecurityActivityAlertContext, SecurityActivityAlertProps } from './types';

function contextOf(props: SecurityActivityAlertProps): SecurityActivityAlertContext {
  return {
    activity: props.activity,
    target: props.target,
    targetName: targetNameOf(props),
    occurredAt: props.messages.formatDateTime(props.activity.occurredAt, props.timeZone),
  };
}

function targetNameOf({ target }: SecurityActivityAlertProps): string {
  return target.type === 'workspace' ? target.workspaceName : target.email;
}

/**
 * The first letter of the first two words that have one: "Müller & Söhne"
 * is MS, not M&, and a quote or dash in front of a word does not count.
 */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word.match(/\p{L}/u)?.[0])
    .filter((letter): letter is string => letter !== undefined)
    .slice(0, 2)
    .map((letter) => letter.toUpperCase())
    .join('');
}

/**
 * For security-relevant activity: a change in a workspace (sent to its
 * admins) or to an account (sent to its owner) — see `SecurityActivityTarget`.
 * Deliberately short: what happened as the heading, what it concerns, one
 * sentence, one button, one link.
 */
export function SecurityActivityAlertEmail(props: SecurityActivityAlertProps) {
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
      <SecurityActivityAlertContent {...props} />
    </Layout>
  );
}

/** What goes inside the card, without the document — for in-app previews (render `ColorSchemeStyles` next to it). */
export function SecurityActivityAlertContent(props: SecurityActivityAlertProps) {
  const { messages, activityLogUrl } = props;
  const ctx = contextOf(props);
  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <HintoricLogo />
        <Typography level="h3" component="h1" style={{ margin: '16px 0 12px', fontFamily: emailFonts.heading }}>
          {props.activity.title}
        </Typography>
        {/* primary, not the default neutral: in dark the layout card is surface-1,
            exactly the soft-neutral avatar fill, which would make it vanish. */}
        <Avatar size="sm" color="primary">
          {initials(ctx.targetName)}
        </Avatar>
        <Typography level="title-sm" component="span" style={{ marginLeft: '8px', verticalAlign: 'middle' }}>
          {ctx.targetName}
        </Typography>
      </div>
      <Divider style={{ margin: '32px 0' }} />
      <Typography level="body-sm" style={{ marginBottom: '24px' }}>
        {props.activity.description?.trim() || messages.summary(ctx)} {messages.guidance(ctx)}
      </Typography>
      <Button href={props.reviewUrl} size="lg" fullWidth>
        {messages.reviewButton}
      </Button>
      {activityLogUrl && (
        <Typography level="body-xs" component="p" textAlign="center" style={{ marginTop: '24px', fontWeight: 400 }}>
          {messages.activityLogHint((label) => (
            <Link href={activityLogUrl} underline="none">
              {label}
            </Link>
          ))}
        </Typography>
      )}
    </>
  );
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/** Subject, HTML and plain-text body in one call — what a mail API's send() takes. */
export async function renderSecurityActivityAlert(props: SecurityActivityAlertProps): Promise<RenderedEmail> {
  const { html, text } = await renderEmail(<SecurityActivityAlertEmail {...props} />);
  return { subject: props.messages.subject(contextOf(props)), html, text };
}
