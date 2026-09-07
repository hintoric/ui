import { useState } from 'react';
import {
  ColorSchemeMenu,
  ColorSchemeMenuItems,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
} from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

export function ColorSchemeMenuPage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <h1>ColorSchemeMenu</h1>
      <p className="docs-lede">
        The recommended colour scheme form: a trigger showing the current mode, and three named
        entries behind it.
      </p>

      <h2>Basic usage</h2>
      <p>
        No props needed. It reads the mode from{' '}
        <a href="/color-scheme-provider">ColorSchemeProvider</a> and throws without one. Every stop
        is labelled and reachable in one step, where{' '}
        <a href="/color-scheme-toggle">ColorSchemeToggle</a> makes the user cycle through unlabelled
        ones.
      </p>
      <Demo>
        <ColorSchemeMenu />
      </Demo>
      <Code>{`import { ColorSchemeMenu } from '@hintoric/ui';

<ColorSchemeMenu />`}</Code>

      <h2>The marked entry follows the chosen mode</h2>
      <p>
        “System” stays marked while it resolves to Dark. The tick belongs beside what the user
        chose, not beside what is currently painted — otherwise “follows my system” would be
        indistinguishable from “pinned to dark”.
      </p>

      <h2>Translated labels</h2>
      <p>
        The defaults are English and the library ships no translations. <code>labels</code>{' '}
        overrides them one at a time — translating one does not mean restating the other two.
      </p>
      <Demo>
        <ColorSchemeMenu labels={{ system: 'Automatisch', light: 'Hell', dark: 'Dunkel' }} />
      </Demo>
      <Code>{`<ColorSchemeMenu labels={{ system: 'Automatisch', light: 'Hell', dark: 'Dunkel' }} />`}</Code>

      <h2>Variants and sizes</h2>
      <Demo>
        <ColorSchemeMenu variant="plain" />
        <ColorSchemeMenu variant="outlined" />
        <ColorSchemeMenu variant="soft" />
        <ColorSchemeMenu variant="solid" />
      </Demo>
      <Demo>
        <ColorSchemeMenu size="sm" />
        <ColorSchemeMenu size="md" />
        <ColorSchemeMenu size="lg" />
      </Demo>

      <h2>Hanging the entries in your own menu</h2>
      <p>
        <code>ColorSchemeMenuItems</code> is the same three entries without a trigger or a popup, for
        an application that already has a user menu and does not want a second button beside it. The
        enclosing <code>Menu</code> is yours.
      </p>
      <Demo>
        <Dropdown open={open} onOpenChange={setOpen}>
          <MenuButton>Account</MenuButton>
          <Menu>
            <MenuItem>Profile</MenuItem>
            <MenuItem>Settings</MenuItem>
            <ColorSchemeMenuItems />
          </Menu>
        </Dropdown>
      </Demo>
      <Code>{`import { ColorSchemeMenuItems, Dropdown, Menu, MenuButton, MenuItem } from '@hintoric/ui';

<Dropdown>
  <MenuButton>Account</MenuButton>
  <Menu>
    <MenuItem>Profile</MenuItem>
    <MenuItem>Settings</MenuItem>
    <ColorSchemeMenuItems />
  </Menu>
</Dropdown>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: 'variant',
            type: "'solid' | 'soft' | 'outlined' | 'plain'",
            default: "'outlined'",
            description: 'Applied to the trigger.',
          },
          {
            name: 'color',
            type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'",
            default: "'neutral'",
            description: 'Applied to the trigger and the entries alike.',
          },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'sm'",
            description: 'Passed through to the trigger and the menu.',
          },
          {
            name: 'labels',
            type: '{ system?: ReactNode; light?: ReactNode; dark?: ReactNode }',
            description:
              'Partially overrides the English defaults System / Light / Dark. Applies to the trigger as well as the entries.',
          },
          {
            name: '…button props',
            type: "React.ComponentProps<'button'>",
            description: 'Anything else is forwarded to the trigger button.',
          },
        ]}
      />

      <h2>ColorSchemeMenuItems props</h2>
      <PropsTable
        rows={[
          {
            name: 'labels',
            type: '{ system?: ReactNode; light?: ReactNode; dark?: ReactNode }',
            description: 'Partially overrides the English defaults.',
          },
          {
            name: 'color',
            type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'",
            default: "'neutral'",
            description: 'Applied to each entry.',
          },
          {
            name: 'icons',
            type: 'boolean',
            default: 'true',
            description: 'Show the glyph beside each label. false leaves text only.',
          },
        ]}
      />
    </>
  );
}
