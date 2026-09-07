import { Dropdown, Menu, MenuButton, MenuItem, MenuList, ListDivider } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function MenuPage() {
  return (
    <>
      <h1>Menu</h1>
      <p className="docs-lede">
        A popup list of actions, built on Base UI&apos;s <code>Menu</code>. Four parts:{' '}
        <code>Dropdown</code> coordinates open state and renders no DOM of its own,{' '}
        <code>MenuButton</code> is the trigger, <code>Menu</code> is the popup surface, and{' '}
        <code>MenuItem</code> is one row.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <Dropdown>
          <MenuButton>Actions</MenuButton>
          <Menu>
            <MenuItem>Rename</MenuItem>
            <MenuItem>Duplicate</MenuItem>
            <MenuItem disabled>Move to…</MenuItem>
            <MenuItem>Delete</MenuItem>
          </Menu>
        </Dropdown>
      </Demo>
      <Code>{`<Dropdown>
  <MenuButton>Actions</MenuButton>
  <Menu>
    <MenuItem onClick={rename}>Rename</MenuItem>
    <MenuItem disabled>Move to…</MenuItem>
  </Menu>
</Dropdown>`}</Code>

      <h2>Controlling open state</h2>
      <p>
        <code>Dropdown</code> is the only part that knows whether the menu is open. It takes{' '}
        <code>open</code>, <code>defaultOpen</code> and <code>onOpenChange</code>; the trigger and
        the popup coordinate through it without an <code>anchorEl</code>.
      </p>
      <Code>{`const [open, setOpen] = React.useState(false);

<Dropdown open={open} onOpenChange={setOpen}>
  <MenuButton>Actions</MenuButton>
  <Menu>…</Menu>
</Dropdown>`}</Code>

      <h2>Variants &amp; colors</h2>
      <p>
        The grid below sets both on the <code>Menu</code>. Click a trigger to see its popup —{' '}
        <code>MenuItem</code> keeps its own <code>plain</code>/<code>neutral</code> default and does
        not inherit from the surrounding menu.
      </p>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <Dropdown>
              <MenuButton size="sm">{color.slice(0, 4)}</MenuButton>
              <Menu variant={variant} color={color}>
                <MenuItem>First</MenuItem>
                <MenuItem>Second</MenuItem>
              </Menu>
            </Dropdown>
          )}
        />
      </Demo>
      <Code>{`<Menu variant="soft" color="primary">…</Menu>`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Dropdown key={size}>
              <MenuButton size={size}>{size}</MenuButton>
              <Menu size={size}>
                <MenuItem>Rename</MenuItem>
                <MenuItem>Delete</MenuItem>
              </Menu>
            </Dropdown>
          ))}
        </div>
      </Demo>

      <h2>Selected items and dividers</h2>
      <p>
        <code>selected</code> gives a row the variant&apos;s persistent active background — the same
        mechanism <code>ListItemButton</code> and <code>Option</code> use. <code>ListDivider</code>{' '}
        separates groups.
      </p>
      <Demo>
        <Dropdown>
          <MenuButton>Sort by</MenuButton>
          <Menu>
            <MenuItem selected>Name</MenuItem>
            <MenuItem>Date modified</MenuItem>
            <MenuItem>Size</MenuItem>
            <ListDivider />
            <MenuItem>Reverse order</MenuItem>
          </Menu>
        </Dropdown>
      </Demo>
      <Code>{`<Menu>
  <MenuItem selected>Name</MenuItem>
  <ListDivider />
  <MenuItem>Reverse order</MenuItem>
</Menu>`}</Code>

      <h2>Grouping items with MenuList</h2>
      <p>
        <code>MenuList</code> is the list styling without the popup machinery — a{' '}
        <code>&lt;ul&gt;</code> with the surface treatment, meant for a nested or grouped block of
        items <em>inside</em> a Menu. It cannot stand on its own: <code>MenuItem</code> is a Base UI
        menu item and throws outside a <code>Dropdown</code>.
      </p>
      <Demo>
        <Dropdown>
          <MenuButton>Account</MenuButton>
          <Menu>
            <MenuList variant="plain">
              <MenuItem>Profile</MenuItem>
              <MenuItem>Preferences</MenuItem>
            </MenuList>
            <ListDivider />
            <MenuList variant="plain">
              <MenuItem>Sign out</MenuItem>
            </MenuList>
          </Menu>
        </Dropdown>
      </Demo>
      <Code>{`<Dropdown>
  <MenuButton>Account</MenuButton>
  <Menu>
    <MenuList variant="plain">
      <MenuItem>Profile</MenuItem>
    </MenuList>
    <ListDivider />
    <MenuList variant="plain">
      <MenuItem>Sign out</MenuItem>
    </MenuList>
  </Menu>
</Dropdown>`}</Code>

      <h2>Dropdown props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'A MenuButton and a Menu. Renders no DOM of its own.' },
          { name: 'open', type: 'boolean', description: 'Controlled open state.' },
          { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Whether the menu is open on first render.' },
          { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when the menu opens or closes.' },
        ]}
      />

      <h2>MenuButton props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The trigger label.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'outlined'", description: 'Visual style of the trigger.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Trigger height, padding and font size.' },
        ]}
      />

      <h2>Menu props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'MenuItems and dividers.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'outlined'", description: 'Visual style of the popup surface.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the surface.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Font size of the popup content.' },
        ]}
      />

      <h2>MenuItem props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The row content.' },
          { name: 'selected', type: 'boolean', default: 'false', description: 'Draws the row with the variant’s active background.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'plain'", description: 'Visual style of the row.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the row variant.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Makes the row unclickable.' },
        ]}
      />

      <h2>MenuList props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'MenuItems and dividers.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'plain'", description: 'Visual style of the list.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
        ]}
      />
    </>
  );
}
