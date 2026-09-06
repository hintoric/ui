import {
  List,
  ListDivider,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  ListSubheader,
  Typography,
} from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function ListPage() {
  return (
    <>
      <h1>List</h1>
      <p className="docs-lede">
        A vertical or horizontal list of items. <code>List</code> is the{' '}
        <code>&lt;ul&gt;</code>, <code>ListItem</code> a static row, and{' '}
        <code>ListItemButton</code> an interactive one. Decorators, content wrappers, dividers and
        subheaders fill out the rest.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <List variant="outlined" color="neutral" style={{ maxWidth: 280 }}>
          <ListItem>Inbox</ListItem>
          <ListItem>Drafts</ListItem>
          <ListItem>Sent</ListItem>
        </List>
      </Demo>
      <Code>{`<List variant="outlined" color="neutral">
  <ListItem>Inbox</ListItem>
  <ListItem>Drafts</ListItem>
</List>`}</Code>

      <h2>Surface styling is opt-in</h2>
      <p>
        <code>List</code> only paints a background when <strong>both</strong> <code>variant</code>{' '}
        and <code>color</code> are set. With neither, or only one, it is a transparent container —
        which is what you usually want inside a Card or a Sheet.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 24 }}>
          <List style={{ width: 160 }}>
            <ListItem>No surface</ListItem>
            <ListItem>Transparent</ListItem>
          </List>
          <List variant="soft" color="primary" style={{ width: 160 }}>
            <ListItem>Both set</ListItem>
            <ListItem>Painted</ListItem>
          </List>
        </div>
      </Demo>

      <h2>Interactive rows</h2>
      <p>
        <code>ListItemButton</code> renders a real <code>&lt;button&gt;</code>. Its{' '}
        <code>selected</code> flag applies the variant&apos;s persistent active background — it does
        not switch variant or colour, matching Joy UI.
      </p>
      <Demo>
        <List variant="outlined" color="neutral" style={{ maxWidth: 280 }}>
          <ListItem>
            <ListItemButton selected>Inbox</ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>Drafts</ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton disabled>Archive</ListItemButton>
          </ListItem>
        </List>
      </Demo>
      <Code>{`<ListItem>
  <ListItemButton selected onClick={() => open('inbox')}>Inbox</ListItemButton>
</ListItem>`}</Code>

      <h2>Decorators, content and dividers</h2>
      <p>
        <code>ListItemDecorator</code> holds the leading icon, <code>ListItemContent</code> takes
        the remaining space so trailing content stays right-aligned, and{' '}
        <code>ListSubheader</code> labels a group.
      </p>
      <Demo>
        <List variant="outlined" color="neutral" style={{ maxWidth: 320 }}>
          <ListSubheader>Mail</ListSubheader>
          <ListItem>
            <ListItemDecorator>✉</ListItemDecorator>
            <ListItemContent>
              <Typography level="title-sm">Inbox</Typography>
              <Typography level="body-xs">12 unread</Typography>
            </ListItemContent>
            <Typography level="body-xs">⌘1</Typography>
          </ListItem>
          <ListDivider />
          <ListSubheader>Storage</ListSubheader>
          <ListItem>
            <ListItemDecorator>🗄</ListItemDecorator>
            <ListItemContent>
              <Typography level="title-sm">Archive</Typography>
            </ListItemContent>
          </ListItem>
        </List>
      </Demo>
      <Code>{`<ListItem>
  <ListItemDecorator>✉</ListItemDecorator>
  <ListItemContent>
    <Typography level="title-sm">Inbox</Typography>
    <Typography level="body-xs">12 unread</Typography>
  </ListItemContent>
  <Typography level="body-xs">⌘1</Typography>
</ListItem>`}</Code>

      <h2>Horizontal orientation</h2>
      <Demo>
        <List orientation="horizontal" variant="outlined" color="neutral">
          <ListItem>
            <ListItemButton>Overview</ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>Activity</ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>Settings</ListItemButton>
          </ListItem>
        </List>
      </Demo>
      <Code>{`<List orientation="horizontal" variant="outlined" color="neutral">…</List>`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <List key={size} size={size} variant="outlined" color="neutral" style={{ width: 140 }}>
              <ListItem>{size} one</ListItem>
              <ListItem>{size} two</ListItem>
            </List>
          ))}
        </div>
      </Demo>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <List variant={variant} color={color} size="sm" style={{ width: 92 }}>
              <ListItem>One</ListItem>
              <ListItem>Two</ListItem>
            </List>
          )}
        />
      </Demo>

      <h2>List props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The list items.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: 'none', description: 'Surface style. Only applied when color is set too.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: 'none', description: 'Surface palette. Only applied when variant is set too.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Padding, gap and font size.' },
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'vertical'", description: 'Direction the items run in.' },
          { name: 'component', type: 'React.ElementType', default: "'ul'", description: 'Element to render as.' },
        ]}
      />

      <h2>ListItemButton props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The row content.' },
          { name: 'selected', type: 'boolean', default: 'false', description: 'Applies the variant’s persistent active background.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'plain'", description: 'Visual style of the row.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
        ]}
      />

      <h2>The remaining parts</h2>
      <p>
        <code>ListItem</code> (an <code>&lt;li&gt;</code>), <code>ListItemContent</code> (a
        flex-filling <code>&lt;div&gt;</code>), <code>ListItemDecorator</code> (an icon slot) and{' '}
        <code>ListSubheader</code> (a small uppercase label) take no props of their own beyond their
        element&apos;s attributes. <code>ListDivider</code> is <code>Divider</code> under a
        list-flavoured name and accepts the same props.
      </p>

      <h2>Differences from Joy UI</h2>
      <p>
        Joy UI&apos;s List cascades <code>--ListItem-*</code> CSS variables into its children, so a{' '}
        <code>size</code> on the list resizes every row. This build gives each item its own
        md-equivalent defaults instead; set <code>size</code> on the List for its own padding, and
        style rows directly where you need something else.
      </p>
    </>
  );
}
