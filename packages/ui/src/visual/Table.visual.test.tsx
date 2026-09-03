import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, Table as JoyTable } from '@mui/joy';
import { Table as HintoricTable } from '../components/Table';
import type { TableBorderAxis } from '../components/Table';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

function TableBody({ 'data-testid': testId }: { 'data-testid'?: string }) {
  return (
    <>
      <thead>
        <tr>
          <th data-testid={testId ? `${testId}-head` : undefined}>Name</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td data-testid={testId ? `${testId}-cell` : undefined}>Alpha</td>
          <td>1</td>
        </tr>
        <tr>
          <td>Beta</td>
          <td>2</td>
        </tr>
      </tbody>
    </>
  );
}

describe('Table visual parity with @mui/joy', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches Joy UI's computed styles`, async () => {
        render(
          <JoyCssVarsProvider>
            <JoyTable data-testid={`joy-${variant}-${color}`} variant={variant} color={color}>
              <TableBody data-testid={`joy-${variant}-${color}`} />
            </JoyTable>
          </JoyCssVarsProvider>,
        );
        render(
          <HintoricTable data-testid={`hintoric-${variant}-${color}`} variant={variant} color={color}>
            <TableBody data-testid={`hintoric-${variant}-${color}`} />
          </HintoricTable>,
        );

        const joyStyle = getComputedStyle(page.getByTestId(`joy-${variant}-${color}`).element());
        const hintoricStyle = getComputedStyle(page.getByTestId(`hintoric-${variant}-${color}`).element());
        expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
        expect(hintoricStyle.color).toBe(joyStyle.color);

        const joyHead = getComputedStyle(page.getByTestId(`joy-${variant}-${color}-head`).element());
        const hintoricHead = getComputedStyle(page.getByTestId(`hintoric-${variant}-${color}-head`).element());
        expect(hintoricHead.backgroundColor).toBe(joyHead.backgroundColor);
        expect(hintoricHead.fontWeight).toBe(joyHead.fontWeight);
        expect(hintoricHead.color).toBe(joyHead.color);

        await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(`table-${variant}-${color}-joy`);
        await expect(page.getByTestId(`hintoric-${variant}-${color}`)).toMatchScreenshot(`table-${variant}-${color}-hintoric`);
      });
    }
  }

  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`size=${size} matches Joy UI's computed cell height/padding`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoyTable size={size}>
            <TableBody data-testid={`joy-size-${size}`} />
          </JoyTable>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricTable size={size}>
          <TableBody data-testid={`hintoric-size-${size}`} />
        </HintoricTable>,
      );

      const joyCell = getComputedStyle(page.getByTestId(`joy-size-${size}-cell`).element());
      const hintoricCell = getComputedStyle(page.getByTestId(`hintoric-size-${size}-cell`).element());

      expect(hintoricCell.height).toBe(joyCell.height);
      expect(hintoricCell.paddingLeft).toBe(joyCell.paddingLeft);
      expect(hintoricCell.paddingTop).toBe(joyCell.paddingTop);
      expect(hintoricCell.fontSize).toBe(joyCell.fontSize);
    });
  }

  const AXES: TableBorderAxis[] = ['none', 'x', 'xBetween', 'y', 'yBetween', 'both', 'bothBetween'];
  for (const borderAxis of AXES) {
    it(`borderAxis=${borderAxis} matches Joy UI's computed cell border widths`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoyTable borderAxis={borderAxis}>
            <TableBody data-testid={`joy-axis-${borderAxis}`} />
          </JoyTable>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricTable borderAxis={borderAxis}>
          <TableBody data-testid={`hintoric-axis-${borderAxis}`} />
        </HintoricTable>,
      );

      const joyHead = getComputedStyle(page.getByTestId(`joy-axis-${borderAxis}-head`).element());
      const hintoricHead = getComputedStyle(page.getByTestId(`hintoric-axis-${borderAxis}-head`).element());
      // Assert whether a border exists at all (0px vs >0px) rather than the
      // exact width — this project's `xBetween`/`x` deliberately collapse
      // Joy's 1px-vs-2px header-underline distinction to a uniform 1px (see
      // tableVariants.ts's scope note).
      expect(hintoricHead.borderBottomWidth === '0px').toBe(joyHead.borderBottomWidth === '0px');
      expect(hintoricHead.borderLeftWidth === '0px').toBe(joyHead.borderLeftWidth === '0px');
    });
  }

  it('hoverRow wires up a hover background class matching the hover token', async () => {
    render(
      <HintoricTable hoverRow data-testid="hintoric-hover">
        <TableBody />
      </HintoricTable>,
    );
    expect(page.getByTestId('hintoric-hover').element().className).toContain('[&_tbody_tr:hover]:bg-surface-3');
  });
});
