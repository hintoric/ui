import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardCover } from './CardCover';

describe('CardCover', () => {
  it('positions itself absolutely to fill the parent', () => {
    render(
      <CardCover data-testid="cover">
        <img src="/a.jpg" alt="a" />
      </CardCover>,
    );
    expect(screen.getByTestId('cover')).toHaveClass('absolute', 'inset-0');
  });

  it('makes an image child fill and cover the box', () => {
    render(
      <CardCover>
        <img src="/a.jpg" alt="a" />
      </CardCover>,
    );
    expect(screen.getByAltText('a')).toHaveClass('size-full', 'object-cover');
  });
});
