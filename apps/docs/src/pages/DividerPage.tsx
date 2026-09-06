import { Chip, Divider, Sheet, Typography } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

export function DividerPage() {
  return (
    <>
      <h1>Divider</h1>
      <p className="docs-lede">
        A rule between sections. It renders an <code>&lt;hr&gt;</code>, and giving it children turns
        it into a labelled separator with the line running either side of the text.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <div style={{ maxWidth: 400 }}>
          <Typography level="body-md">Above the line.</Typography>
          <Divider />
          <Typography level="body-md">Below the line.</Typography>
        </div>
      </Demo>
      <Code>{`<Divider />`}</Code>

      <h2>With a label</h2>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 400 }}>
          <Divider>or</Divider>
          <Divider>
            <Chip variant="soft" color="neutral" size="sm">
              September
            </Chip>
          </Divider>
          <Divider>
            <Typography level="body-xs">END OF RESULTS</Typography>
          </Divider>
        </div>
      </Demo>
      <Code>{`<Divider>or</Divider>
<Divider><Chip variant="soft" size="sm">September</Chip></Divider>`}</Code>

      <h2>Vertical orientation</h2>
      <p>
        A vertical divider needs a parent that gives it a height — a flex row with a set height, or
        stretched items.
      </p>
      <Demo>
        <Sheet
          variant="outlined"
          style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, height: 64 }}
        >
          <Typography level="body-md">Drafts</Typography>
          <Divider orientation="vertical" />
          <Typography level="body-md">Sent</Typography>
          <Divider orientation="vertical" />
          <Typography level="body-md">Archive</Typography>
        </Sheet>
      </Demo>
      <Code>{`<Divider orientation="vertical" />`}</Code>

      <h2>Inside a list</h2>
      <p>
        <code>ListDivider</code> is the same component under a list-flavoured name, and takes the
        same props — reach for it inside <code>List</code> and <code>Menu</code> so the intent reads
        clearly.
      </p>
      <Code>{`<Menu>
  <MenuItem>Rename</MenuItem>
  <ListDivider />
  <MenuItem>Delete</MenuItem>
</Menu>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'Optional label rendered in the middle of the rule.' },
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Direction the rule runs in.' },
        ]}
      />
    </>
  );
}
