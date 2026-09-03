import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumbs } from './Breadcrumbs';

describe('Breadcrumbs', () => {
  it('renders as a nav with an ordered list of items', () => {
    render(
      <Breadcrumbs>
        <a href="/">Home</a>
        <a href="/docs">Docs</a>
        <span>Button</span>
      </Breadcrumbs>,
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('renders a separator between items but not after the last one', () => {
    render(
      <Breadcrumbs>
        <a href="/">Home</a>
        <span>Button</span>
      </Breadcrumbs>,
    );
    expect(screen.getAllByText('/')).toHaveLength(1);
  });

  it('supports a custom separator', () => {
    render(
      <Breadcrumbs separator=">">
        <a href="/">Home</a>
        <span>Button</span>
      </Breadcrumbs>,
    );
    expect(screen.getByText('>')).toBeInTheDocument();
  });
});
