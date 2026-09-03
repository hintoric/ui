import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListItemDecorator } from './ListItemDecorator';

describe('ListItemDecorator', () => {
  it('renders its children in an inline-flex box', () => {
    render(
      <ListItemDecorator data-testid="d">
        <svg />
      </ListItemDecorator>,
    );
    expect(screen.getByTestId('d')).toHaveClass('inline-flex');
  });
});
