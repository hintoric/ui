import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataGridRow } from './DataGridRow';

describe('DataGridRow', () => {
  it('renders a table row element', () => {
    render(
      <table>
        <tbody>
          <DataGridRow data-testid="row">
            <td>cell</td>
          </DataGridRow>
        </tbody>
      </table>,
    );
    expect(screen.getByTestId('row').tagName).toBe('TR');
  });

  it('forwards className and other props', () => {
    render(
      <table>
        <tbody>
          <DataGridRow data-testid="row" className="custom-class" />
        </tbody>
      </table>,
    );
    expect(screen.getByTestId('row')).toHaveClass('custom-class');
  });
});
