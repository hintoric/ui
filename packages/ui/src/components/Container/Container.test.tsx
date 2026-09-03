import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from './Container';

describe('Container', () => {
  it('renders its children', () => {
    render(<Container>content</Container>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('defaults to lg maxWidth with gutters', () => {
    render(<Container data-testid="c">content</Container>);
    expect(screen.getByTestId('c')).toHaveClass('px-4', 'mx-auto');
  });

  it('removes gutters when disableGutters is set', () => {
    render(
      <Container data-testid="c" disableGutters>
        content
      </Container>,
    );
    expect(screen.getByTestId('c')).not.toHaveClass('px-4');
  });

  it('renders as a different element via component prop', () => {
    render(
      <Container data-testid="c" component="section">
        content
      </Container>,
    );
    expect(screen.getByTestId('c').tagName).toBe('SECTION');
  });
});
