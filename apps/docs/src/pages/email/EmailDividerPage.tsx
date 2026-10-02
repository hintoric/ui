import { Divider, Typography } from '@hintoric/email';
import { Demo, Code } from '../../components/Demo';
import { EmailPageIntro } from './shared';

export function EmailDividerPage() {
  return (
    <>
      <EmailPageIntro name="Divider" web="Divider" lede="A 1px line in the divider token, with a solid fallback for Outlook." />
      <h2>Usage</h2>
      <Demo>
        <Typography level="body-sm">Above</Typography>
        <Divider style={{ margin: '16px 0' }} />
        <Typography level="body-sm">Below</Typography>
      </Demo>
      <Code>{`<Divider style={{ margin: '32px 0' }} />`}</Code>
    </>
  );
}
