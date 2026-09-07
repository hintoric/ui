import type * as React from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import {
  IconButton as JoyIconButton,
  ListItemButton as JoyListItemButton,
  Switch as JoySwitch,
  Select as JoySelect,
  Button as JoyButton,
} from '@mui/joy';
import { IconButton } from '../components/IconButton';
import { ListItemButton } from '../components/ListItemButton';
import { Switch } from '../components/Switch';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider } from '@mui/joy';
import { setColorScheme } from './helpers';

type Variant = 'solid' | 'soft' | 'outlined' | 'plain';
type Color = 'primary' | 'neutral' | 'danger' | 'success' | 'warning';

const VARIANTS: Variant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: Color[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

interface Case {
  name: string;
  joy: (variant: Variant, color: Color, testId: string) => React.ReactElement;
  ours: (variant: Variant, color: Color, testId: string) => React.ReactElement;
}

// Nothing in this repository had ever rendered a component in dark mode: a
// `grep -rln "data-color-scheme" src/visual/` found no hits across 63 files.
// The whole [data-color-scheme="dark"] block in theme.css was therefore
// unverified against the real package. These five primitives are the ones the
// ColorScheme* forms are built from, so they are the ones verified here.
//
// MenuItem renders inside a Menu in real use, but its styling comes from
// ListItemButton and needs no popup to resolve — rendering it bare keeps the
// comparison to the tokens, which is what this file is about.
const CASES: Case[] = [
  {
    name: 'IconButton',
    joy: (variant, color, testId) => (
      <JoyIconButton data-testid={testId} variant={variant} color={color}>
        +
      </JoyIconButton>
    ),
    ours: (variant, color, testId) => (
      <IconButton data-testid={testId} variant={variant} color={color} aria-label={testId}>
        +
      </IconButton>
    ),
  },
  {
    name: 'Button',
    joy: (variant, color, testId) => (
      <JoyButton data-testid={testId} variant={variant} color={color}>
        Label
      </JoyButton>
    ),
    ours: (variant, color, testId) => (
      <Button data-testid={testId} variant={variant} color={color}>
        Label
      </Button>
    ),
  },
  {
    // ListItemButton stands in for MenuItem here, and it verifies the same
    // tokens: MenuItem's own source documents it as ListItemButton's styling
    // (StyledListItemButton, no surface fallback), so the two read the same
    // variant/color variables.
    //
    // Neither MenuItem can be rendered bare for a token comparison. Joy's
    // reads a ListContext and throws standalone ("MenuItem: ListContext was
    // not found") — a wrapping Joy <List> does not satisfy it. Ours is a
    // Base UI Menu.Item and throws in useMenuRootContext without a Menu.Root.
    // Inside a real Menu both are portalled outside any wrapper element, so a
    // `data-color-scheme` wrapper cannot reach them; MenuItem's own dark
    // appearance is therefore covered in ColorSchemeMenu's visual test, which
    // drives a real provider instead of a wrapper.
    name: 'ListItemButton',
    joy: (variant, color, testId) => (
      <JoyListItemButton data-testid={testId} variant={variant} color={color}>
        Label
      </JoyListItemButton>
    ),
    ours: (variant, color, testId) => (
      <ListItemButton data-testid={testId} variant={variant} color={color}>
        Label
      </ListItemButton>
    ),
  },
];

describe('dark mode token parity with @mui/joy', () => {
  for (const testCase of CASES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${testCase.name} ${variant}/${color} matches Joy in dark mode`, async () => {
          const joyId = `joy-${testCase.name}-${variant}-${color}`;
          const oursId = `ours-${testCase.name}-${variant}-${color}`;
          render(<JoyCssVarsProvider defaultMode="dark">{testCase.joy(variant, color, joyId)}</JoyCssVarsProvider>);
          render(testCase.ours(variant, color, oursId));
          await setColorScheme('dark');

          const joyStyle = getComputedStyle(page.getByTestId(joyId).element());
          const oursStyle = getComputedStyle(page.getByTestId(oursId).element());

          expect(oursStyle.backgroundColor).toBe(joyStyle.backgroundColor);
          expect(oursStyle.color).toBe(joyStyle.color);
          expect(oursStyle.borderColor).toBe(joyStyle.borderColor);
        });
      }
    }
  }

  it('Switch matches Joy in dark mode, unchecked and checked', async () => {
    render(
      <JoyCssVarsProvider defaultMode="dark">
        <JoySwitch data-testid="joy-switch-off" />
        <JoySwitch data-testid="joy-switch-on" checked />
      </JoyCssVarsProvider>,
    );
    render(
      <>
        <Switch data-testid="ours-switch-off" />
        <Switch data-testid="ours-switch-on" checked />
      </>,
    );
    await setColorScheme('dark');

    for (const state of ['off', 'on']) {
      // Joy paints the track, a child of its root; ours paints BaseSwitch.Root
      // itself. Switch.visual.test.tsx already pairs them this way.
      const joyTrack = page
        .getByTestId(`joy-switch-${state}`)
        .element()
        .querySelector('.MuiSwitch-track') as HTMLElement;
      const joyStyle = getComputedStyle(joyTrack);
      const oursStyle = getComputedStyle(page.getByTestId(`ours-switch-${state}`).element());
      expect(oursStyle.backgroundColor).toBe(joyStyle.backgroundColor);
    }
  });

  it('Select matches Joy in dark mode', async () => {
    render(
      <JoyCssVarsProvider defaultMode="dark">
        <JoySelect data-testid="joy-select" placeholder="Pick" />
      </JoyCssVarsProvider>,
    );
    render(<Select data-testid="ours-select" placeholder="Pick" />);
    await setColorScheme('dark');

    const joyStyle = getComputedStyle(page.getByTestId('joy-select').element());
    const oursStyle = getComputedStyle(page.getByTestId('ours-select').element());

    expect(oursStyle.backgroundColor).toBe(joyStyle.backgroundColor);
    expect(oursStyle.color).toBe(joyStyle.color);
    expect(oursStyle.borderColor).toBe(joyStyle.borderColor);
  });

  it('renders a readable grid of every dark variant for human review', async () => {
    render(
      <div
        data-testid="dark-grid"
        style={{
          display: 'grid',
          gap: 8,
          padding: 16,
          gridTemplateColumns: 'repeat(2, max-content)',
          // On the real page background, not on the transparent default: an
          // outlined or plain swatch photographed against white looks washed
          // out and unreadable, which is the opposite of what a dark-mode
          // reviewer needs to judge.
          backgroundColor: 'var(--color-canvas)',
        }}
      >
        {VARIANTS.flatMap((variant) =>
          COLORS.map((color) => (
            <Button key={`${variant}-${color}`} variant={variant} color={color}>
              {variant}/{color}
            </Button>
          )),
        )}
      </div>,
    );
    await setColorScheme('dark');

    await expect(page.getByTestId('dark-grid')).toMatchScreenshot('dark-tokens-button-grid-dark');
  });
});
