import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Table } from './Table';

describe('Table', () => {
  it('renders a table element with rows and cells', () => {
    render(
      <Table>
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Alpha</td>
          </tr>
        </tbody>
      </Table>,
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Alpha' })).toBeInTheDocument();
  });

  it('defaults to plain/neutral/md/xBetween', () => {
    render(<Table data-testid="table" />);
    expect(screen.getByTestId('table')).toHaveClass('text-neutral-plain-color', 'bg-transparent');
  });

  it('applies noWrap classes to data cells only when set', () => {
    render(<Table noWrap data-testid="table" />);
    expect(screen.getByTestId('table')).toHaveClass('[&_td]:whitespace-nowrap');
  });

  it('applies hoverRow classes when set', () => {
    render(<Table hoverRow data-testid="table" />);
    expect(screen.getByTestId('table')).toHaveClass('[&_tbody_tr:hover]:bg-surface-3');
  });
});
