import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataGridContext, useDataGridContext } from './DataGridContext';

function Consumer() {
  const { size } = useDataGridContext();
  return <span data-testid="size">{size}</span>;
}

describe('useDataGridContext', () => {
  it('throws when used outside a DataGridContext.Provider', () => {
    // Suppress React's expected "error boundary" console noise for this case.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(/must be rendered within a <DataGrid>/);
    spy.mockRestore();
  });

  it('returns the provided value inside a Provider', () => {
    render(
      <DataGridContext.Provider value={{ variant: 'plain', color: 'neutral', size: 'lg', borderAxis: 'xBetween' }}>
        <Consumer />
      </DataGridContext.Provider>,
    );
    expect(screen.getByTestId('size')).toHaveTextContent('lg');
  });
});
