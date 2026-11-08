import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HintoricLogo } from '../HintoricLogo';
import { HintoricIcon } from './HintoricIcon';

const pathData = (svg: Element) =>
  [...svg.querySelectorAll('path')].map((p) => p.getAttribute('d') ?? '');

describe('HintoricIcon', () => {
  it('renders an svg with the icon mark viewBox', () => {
    render(<HintoricIcon data-testid="icon" />);
    const el = screen.getByTestId('icon');
    expect(el.tagName).toBe('svg');
    expect(el).toHaveAttribute('viewBox', '0 0 324 326');
  });

  // The logo draws the mark's right needle outside its clip group, so it is
  // easy to miss when the mark is copied out — and 0.4.0 did exactly that.
  // Every logo path that starts left of the wordmark (x 376) is the mark.
  it('draws every path of the mark in HintoricLogo, including the right needle', () => {
    render(
      <>
        <HintoricLogo data-testid="logo" />
        <HintoricIcon data-testid="icon" />
      </>,
    );
    const mark = pathData(screen.getByTestId('logo')).filter(
      (d) => Number(/^M([\d.]+)/.exec(d)?.[1]) < 376,
    );
    expect(mark).toHaveLength(5);
    expect(pathData(screen.getByTestId('icon')).sort()).toEqual(mark.sort());
  });

  it('has an accessible name by default', () => {
    render(<HintoricIcon />);
    expect(screen.getByRole('img', { name: 'Hintoric' })).toBeInTheDocument();
  });

  it('allows overriding the accessible name', () => {
    render(<HintoricIcon aria-label="Hintoric mark" />);
    expect(screen.getByRole('img', { name: 'Hintoric mark' })).toBeInTheDocument();
  });

  it('merges a custom className with its own default color class', () => {
    render(<HintoricIcon className="custom-class" data-testid="icon" />);
    const el = screen.getByTestId('icon');
    expect(el).toHaveClass('custom-class');
    expect(el).toHaveClass('text-ink-primary');
  });

  it('forwards a ref to the underlying svg element', () => {
    const ref = React.createRef<SVGSVGElement>();
    render(<HintoricIcon ref={ref} data-testid="icon" />);
    expect(ref.current).toBe(screen.getByTestId('icon'));
  });
});
