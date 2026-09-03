import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { List } from '../List';
import { ListItem } from './ListItem';

describe('ListItem', () => {
  it('renders as an <li> with its children', () => {
    render(
      <List>
        <ListItem>Item</ListItem>
      </List>,
    );
    expect(screen.getByText('Item').tagName).toBe('LI');
  });
});
