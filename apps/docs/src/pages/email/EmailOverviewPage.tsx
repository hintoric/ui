import { Code } from '../../components/Demo';

export function EmailOverviewPage() {
  return (
    <>
      <h1>@hintoric/email</h1>
      <p className="docs-lede">
        Email components with the same props and look as <code>@hintoric/ui</code>, plus ready-made
        templates. Built on react-email; renders to HTML and plain text that every common mail client
        displays.
      </p>

      <h2>Install</h2>
      <Code>{`npm install @hintoric/email`}</Code>

      <h2>Render and send</h2>
      <Code>{`import { Layout, Typography, Button, renderEmail } from '@hintoric/email';

const { html, text } = await renderEmail(
  <Layout lang="de" preview="Neue Anmeldung" footer="Muster GmbH · Musterstraße 1">
    <Typography level="h3" component="h1" textAlign="center">Neue Anmeldung</Typography>
    <Typography level="body-sm" style={{ margin: '24px 0' }}>
      Dein Konto wurde soeben auf einem neuen Gerät verwendet.
    </Typography>
    <Button href="https://app.example.com/security" size="lg" fullWidth>Aktivität prüfen</Button>
  </Layout>,
);

await mailer.send({ to, subject, html, text });`}</Code>
      <p>
        <code>renderEmail</code> returns the HTML and the plain-text part; send both.
      </p>

      <h2>Layout</h2>
      <p>
        <code>Layout</code> is the whole message: a 440px card on the page background with the fine print
        from <code>footer</code> underneath, and <code>preview</code> as the line inbox lists show after the
        subject. On phones the card fills the screen.
      </p>

      <h2>Components</h2>
      <p>
        <code>Typography</code>, <code>Button</code>, <code>Link</code>, <code>Divider</code>,{' '}
        <code>Card</code>, <code>Avatar</code> and <code>Chip</code> take the same <code>variant</code>,{' '}
        <code>color</code> and <code>size</code> as in <code>@hintoric/ui</code> and look the same. There are
        no hover or focus states, and spacing goes on each element through <code>style</code>.{' '}
        <code>HintoricLogo</code> is the wordmark.
      </p>

      <h2>Dark mode</h2>
      <p>
        Light is the default and works everywhere. Apple Mail, Outlook for Mac and Thunderbird switch to the
        dark colours with the reader&rsquo;s system setting; Gmail and Outlook.com apply their own dark
        mode. The examples here follow the docs&rsquo; colour scheme.
      </p>

      <h2>Links and images</h2>
      <p>
        All text is escaped. Links render only for <code>https:</code>, <code>http:</code> and{' '}
        <code>mailto:</code>; anything else becomes plain text. Images render only from <code>https:</code>{' '}
        URLs.
      </p>
    </>
  );
}
