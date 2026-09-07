import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown } from '../Dropdown';
import { Menu } from '../Menu';
import { MenuButton } from '../MenuButton';
import { ColorSchemeProvider, useColorScheme } from '../../theme/ColorSchemeProvider';
import { ColorSchemeMenuItems } from './ColorSchemeMenuItems';

function ModeProbe() {
  const { mode } = useColorScheme();
  return <span data-testid="mode">{mode}</span>;
}

// The items carry no popup of their own, so a host menu has to supply one —
// which is exactly the integration worth testing.
function renderInHostMenu(props: Record<string, unknown> = {}) {
  return render(
    <ColorSchemeProvider defaultMode="system">
      <ModeProbe />
      <Dropdown defaultOpen>
        <MenuButton>Account</MenuButton>
        <Menu>
          <ColorSchemeMenuItems {...props} />
        </Menu>
      </Dropdown>
    </ColorSchemeProvider>,
  );
}

describe('ColorSchemeMenuItems', () => {
  it('renders one labelled entry per mode', async () => {
    renderInHostMenu();
    expect(await screen.findByText('System')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  it('sets the mode to the entry that was clicked', async () => {
    renderInHostMenu();
    await userEvent.click(await screen.findByText('Dark'));
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('overrides only the labels it is given', async () => {
    renderInHostMenu({ labels: { dark: 'Dunkel' } });
    expect(await screen.findByText('Dunkel')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('sets the mode by value even when the label is translated', async () => {
    renderInHostMenu({ labels: { dark: 'Dunkel' } });
    await userEvent.click(await screen.findByText('Dunkel'));
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('throws outside a ColorSchemeProvider', () => {
    expect(() => render(<ColorSchemeMenuItems />)).toThrow(
      'useColorScheme must be used within a ColorSchemeProvider',
    );
  });
});
