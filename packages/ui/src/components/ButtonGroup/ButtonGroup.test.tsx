import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ButtonGroup } from './ButtonGroup';

describe('ButtonGroup', () => {
  it('renders its children', () => {
    render(
      <ButtonGroup>
        <button>One</button>
        <button>Two</button>
      </ButtonGroup>,
    );
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  it('defaults to a connected horizontal row', () => {
    render(
      <ButtonGroup data-testid="group">
        <button>One</button>
      </ButtonGroup>,
    );
    expect(screen.getByTestId('group')).toHaveClass('flex-row', 'divide-x');
  });

  it('switches to a column when vertical', () => {
    render(
      <ButtonGroup data-testid="group" orientation="vertical">
        <button>One</button>
      </ButtonGroup>,
    );
    expect(screen.getByTestId('group')).toHaveClass('flex-col', 'divide-y');
  });

  it('uses a gap instead of dividers when spacing is set', () => {
    render(
      <ButtonGroup data-testid="group" spacing={8}>
        <button>One</button>
      </ButtonGroup>,
    );
    const group = screen.getByTestId('group');
    expect(group).not.toHaveClass('divide-x');
    expect(group).toHaveStyle({ gap: '8px' });
  });
});
