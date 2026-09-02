import { Typography } from '@hintoric/ui';
import type { TypographyLevel } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

const LEVELS: TypographyLevel[] = [
  'h1',
  'h2',
  'h3',
  'h4',
  'title-lg',
  'title-md',
  'title-sm',
  'body-lg',
  'body-md',
  'body-sm',
  'body-xs',
];

export function TypographyPage() {
  return (
    <>
      <h1>Typography</h1>
      <p className="docs-lede">
        Renders text using Joy UI&apos;s type scale via the <code>level</code> prop.
      </p>

      <h2>Levels</h2>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {LEVELS.map((level) => (
            <Typography key={level} level={level}>
              {level} — The quick brown fox
            </Typography>
          ))}
        </div>
      </Demo>
      <Code>{`<Typography level="title-md">Section title</Typography>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: 'level',
            type: "'h1' | 'h2' | 'h3' | 'h4' | 'title-lg' | 'title-md' | 'title-sm' | 'body-lg' | 'body-md' | 'body-sm' | 'body-xs'",
            default: "'body-md'",
            description: 'Selects the type scale entry (font size, weight, line height).',
          },
          { name: 'component', type: 'React.ElementType', default: "'p'", description: 'Renders as a different element/component.' },
        ]}
      />
    </>
  );
}
