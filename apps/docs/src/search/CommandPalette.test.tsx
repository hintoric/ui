import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { CommandPalette } from './CommandPalette.tsx';
import type { SearchEntry } from './types.ts';

const ENTRIES: SearchEntry[] = [
  { path: '/floating-bar', title: 'FloatingBar', page: 'FloatingBar', group: 'Layout' },
  { path: '/floating-bar', hash: 'placement', title: 'Placement', page: 'FloatingBar', group: 'Layout' },
  { path: '/button', title: 'Button', page: 'Button', group: 'Inputs' },
];

function Where() {
  const { pathname, hash } = useLocation();
  return <p data-testid="where">{pathname + hash}</p>;
}

function setup() {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/']}>
      <CommandPalette entries={ENTRIES} />
      <Where />
    </MemoryRouter>,
  );
  return user;
}

function field() {
  return screen.getByRole('searchbox');
}

describe('CommandPalette', () => {
  it('stays shut until it is asked for', () => {
    setup();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('opens on the keyboard shortcut', async () => {
    const user = setup();
    await user.keyboard('{Meta>}k{/Meta}');
    await waitFor(() => expect(field()).toHaveFocus());
  });

  it('opens on Control+K as well, for the people not on a Mac', async () => {
    const user = setup();
    await user.keyboard('{Control>}k{/Control}');
    await waitFor(() => expect(screen.getByRole('searchbox')).toBeInTheDocument());
  });

  it('opens when its button is clicked', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() => expect(screen.getByRole('searchbox')).toBeInTheDocument());
  });

  it('offers the pages before anything is typed, and not their sections', async () => {
    const user = setup();
    await user.keyboard('{Meta>}k{/Meta}');
    const options = await screen.findAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual([
      expect.stringContaining('FloatingBar'),
      expect.stringContaining('Button'),
    ]);
  });

  it('narrows the list to what was typed', async () => {
    const user = setup();
    await user.keyboard('{Meta>}k{/Meta}');
    await user.type(field(), 'plac');
    const options = await screen.findAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('Placement');
  });

  it('says so when nothing matches, instead of showing an empty box', async () => {
    const user = setup();
    await user.keyboard('{Meta>}k{/Meta}');
    await user.type(field(), 'quantum');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText(/nothing/i)).toBeInTheDocument();
  });

  it('marks the highlighted option for assistive technology', async () => {
    const user = setup();
    await user.keyboard('{Meta>}k{/Meta}');
    const first = (await screen.findAllByRole('option'))[0];
    expect(field()).toHaveAttribute('aria-activedescendant', first.id);
    expect(first).toHaveAttribute('aria-selected', 'true');
  });

  it('walks the list with the arrow keys and follows the highlighted one on Enter', async () => {
    const user = setup();
    await user.keyboard('{Meta>}k{/Meta}');
    await screen.findAllByRole('option');
    await user.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('/button'));
  });

  it('wraps around rather than stopping at the last option', async () => {
    const user = setup();
    await user.keyboard('{Meta>}k{/Meta}');
    await screen.findAllByRole('option');
    await user.keyboard('{ArrowUp}{Enter}');
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('/button'));
  });

  it('jumps to the anchor of a section it was asked for', async () => {
    const user = setup();
    await user.keyboard('{Meta>}k{/Meta}');
    await user.type(field(), 'plac');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('/floating-bar#placement'));
  });

  it('closes once it has taken you somewhere', async () => {
    const user = setup();
    await user.keyboard('{Meta>}k{/Meta}');
    await screen.findAllByRole('option');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('searchbox')).not.toBeInTheDocument());
  });

  it('forgets the query between visits, so the second ⌘K starts clean', async () => {
    const user = setup();
    await user.keyboard('{Meta>}k{/Meta}');
    await user.type(field(), 'plac');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('searchbox')).not.toBeInTheDocument());
    await user.keyboard('{Meta>}k{/Meta}');
    await waitFor(() => expect(field()).toHaveValue(''));
  });
});
