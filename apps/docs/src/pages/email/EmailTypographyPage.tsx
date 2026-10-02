import { Typography, type TypographyLevel } from '@hintoric/email';
import { Demo, Code } from '../../components/Demo';
import { PropsTable } from '../../components/PropsTable';
import { EmailPageIntro } from './shared';

const LEVELS: TypographyLevel[] = ['h1', 'h2', 'h3', 'h4', 'title-lg', 'title-md', 'title-sm', 'body-lg', 'body-md', 'body-sm', 'body-xs'];

export function EmailTypographyPage() {
  return (
    <>
      <EmailPageIntro name="Typography" web="Typography" lede="Typography's levels, sizes and ink colours for email." />
      <h2>Levels</h2>
      <Demo>
        {LEVELS.map((level) => (
          <Typography key={level} level={level} component="div" style={{ marginBottom: 8 }}>
            {level}: Bankverbindung geändert
          </Typography>
        ))}
      </Demo>
      <Code>{`<Typography level="h3" component="h1" textAlign="center">Bankverbindung geändert</Typography>
<Typography level="body-sm" style={{ marginBottom: 24 }}>…</Typography>`}</Code>
      <h2>Spacing</h2>
      <p>
        There is no Stack in email, so spacing goes on the text through <code>style</code>. Margins default
        to 0, as on the web.
      </p>
      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'level', type: 'TypographyLevel', default: "'body-md'", description: 'h1–h4, title-lg/md/sm, body-lg/md/sm/xs.' },
          { name: 'component', type: "'h1' … 'h6' | 'p' | 'span' | 'div'", description: 'Defaults to the tag the web Typography picks.' },
          { name: 'textAlign', type: "'left' | 'center' | 'right'", description: 'Alignment.' },
          { name: 'style', type: 'CSSProperties', description: 'Merged last — margins and the like.' },
        ]}
      />
    </>
  );
}
