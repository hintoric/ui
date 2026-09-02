import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Box } from './Box';

describe('Box', () => {
  it('renders a div by default', () => {
    render(<Box data-testid="box">content</Box>);
    const el = screen.getByTestId('box');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveTextContent('content');
  });

  it('renders the element passed via the component prop', () => {
    render(
      <Box component="section" data-testid="box">
        content
      </Box>,
    );
    expect(screen.getByTestId('box').tagName).toBe('SECTION');
  });

  it('merges a custom className with its own', () => {
    render(<Box className="custom-class" data-testid="box" />);
    expect(screen.getByTestId('box')).toHaveClass('custom-class');
  });

  it('forwards a ref to the underlying DOM node', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Box ref={ref} data-testid="box" />);
    expect(ref.current).toBe(screen.getByTestId('box'));
  });
});
