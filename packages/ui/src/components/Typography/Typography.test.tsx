import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Typography } from './Typography';

describe('Typography', () => {
  it('defaults to level body-md rendered as a <p>', () => {
    render(<Typography data-testid="t">Hello</Typography>);
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('P');
    expect(el).toHaveClass('text-base');
  });

  it('renders level h1 as an <h1> with the h1 classes', () => {
    render(
      <Typography level="h1" data-testid="t">
        Title
      </Typography>,
    );
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('H1');
    expect(el).toHaveClass('text-4xl', 'font-bold');
  });

  it('renders level body-xs as a <span>', () => {
    render(
      <Typography level="body-xs" data-testid="t">
        Fine print
      </Typography>,
    );
    expect(screen.getByTestId('t').tagName).toBe('SPAN');
  });

  it('lets the component prop override the level default tag', () => {
    render(
      <Typography level="h2" component="div" data-testid="t">
        Title
      </Typography>,
    );
    expect(screen.getByTestId('t').tagName).toBe('DIV');
  });
});
