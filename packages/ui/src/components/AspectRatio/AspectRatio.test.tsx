import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AspectRatio } from './AspectRatio';

describe('AspectRatio', () => {
  it('renders its children', () => {
    render(
      <AspectRatio>
        <img src="/a.jpg" alt="a" />
      </AspectRatio>,
    );
    expect(screen.getByAltText('a')).toBeInTheDocument();
  });

  it('applies the ratio as a CSS aspect-ratio value', () => {
    render(
      <AspectRatio ratio="4/3" data-testid="ar">
        content
      </AspectRatio>,
    );
    expect(screen.getByTestId('ar')).toHaveStyle({ aspectRatio: '4 / 3' });
  });

  it('defaults to a 16/9 ratio', () => {
    render(<AspectRatio data-testid="ar">content</AspectRatio>);
    expect(screen.getByTestId('ar')).toHaveStyle({ aspectRatio: '16 / 9' });
  });

  it('positions an image/element child to fill the box', () => {
    render(
      <AspectRatio>
        <img src="/a.jpg" alt="a" />
      </AspectRatio>,
    );
    expect(screen.getByAltText('a')).toHaveClass('absolute', 'inset-0', 'size-full');
  });
});
