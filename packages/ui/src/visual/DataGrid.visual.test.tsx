import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import { DataGrid } from '../components/DataGrid';
import type { DataGridColumnDef } from '../components/DataGrid';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

// DataGrid is exempt from this suite's usual "compare against real @mui/joy"
// rule (see docs/superpowers/specs/2026-09-03-datagrid-phase-1-design.md,
// Section 2): Joy UI has no DataGrid equivalent to compare against. These
// are self-baseline screenshots only — toMatchScreenshot() against DataGrid's
// own prior screenshots, for humans to review, same mechanism as every other
// visual test in this file but without a Joy side-by-side.

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;
const BORDER_AXES = ['none', 'x', 'xBetween', 'y', 'yBetween', 'both', 'bothBetween'] as const;

interface Person {
  name: string;
  age: number;
}

const columns: DataGridColumnDef<Person>[] = [
  { accessorKey: 'name', header: 'Name', size: 150 },
  { accessorKey: 'age', header: 'Age', size: 100 },
];

const data: Person[] = [
  { name: 'Beta', age: 2 },
  { name: 'Alpha', age: 1 },
];

describe('DataGrid visual (self-baseline)', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches its own baseline screenshot in ${scheme}`, async () => {
          await setColorScheme(scheme);

          render(<DataGrid columns={columns} data={data} variant={variant} color={color} data-testid={`grid-${variant}-${color}`} />);
          await expect(page.getByTestId(`grid-${variant}-${color}`)).toMatchScreenshot(`datagrid-${variant}-${color}-${scheme}`);
        });
      }
    }

    for (const borderAxis of BORDER_AXES) {
      it(`borderAxis=${borderAxis} matches its own baseline screenshot in ${scheme}`, async () => {
        await setColorScheme(scheme);

        render(<DataGrid columns={columns} data={data} borderAxis={borderAxis} data-testid={`grid-border-${borderAxis}`} />);
        await expect(page.getByTestId(`grid-border-${borderAxis}`)).toMatchScreenshot(`datagrid-border-${borderAxis}-${scheme}`);
      });
    }

    it(`a sorted column shows its sort indicator and matches its own baseline in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(<DataGrid columns={columns} data={data} sorting={[{ id: 'name', desc: false }]} data-testid="grid-sorted" />);
      await expect(page.getByTestId('grid-sorted')).toMatchScreenshot(`datagrid-sorted-asc-${scheme}`);
    });

    it(`the resize handle is present and hidden until hover (opacity-0 class) in ${scheme}`, async () => {
      await setColorScheme(scheme);

      render(<DataGrid columns={columns} data={data} data-testid="grid-resize" />);
      const handle = page.getByTestId('grid-resize').element().querySelector('th div');
      expect(handle).not.toBeNull();
      expect(handle?.className).toContain('opacity-0');
      expect(handle?.className).toContain('group-hover:opacity-100');
    });
  }

  /**
   * A committed screenshot only catches a regression once a human looks at it.
   * This is the assertion a PNG cannot make: that the component reads scheme
   * tokens at all. A hardcoded light colour passes every screenshot test on
   * its own baseline and fails here.
   *
   * The grid stays mounted across the flip — only the CSS custom properties
   * change — so this compares the same element with itself.
   */
  it('reads colour-scheme tokens rather than fixed colours', async () => {
    await setColorScheme('light');
    render(<DataGrid columns={columns} data={data} data-testid="grid-tokens" />);

    const el = screen.getByTestId('grid-tokens');
    const read = () => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, fg: s.color, border: s.borderTopColor };
    };

    const light = read();
    await setColorScheme('dark');
    const dark = read();

    expect([dark.bg, dark.fg, dark.border]).not.toEqual([light.bg, light.fg, light.border]);
  });

});
