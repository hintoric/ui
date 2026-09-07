import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HintoricLogo } from './HintoricLogo';

describe('HintoricLogo', () => {
  it('renders an svg with the full logo viewBox', () => {
    render(<HintoricLogo data-testid="logo" />);
    const el = screen.getByTestId('logo');
    expect(el.tagName).toBe('svg');
    expect(el).toHaveAttribute('viewBox', '0 0 1484 326');
  });

  it('has an accessible name by default', () => {
    render(<HintoricLogo />);
    expect(screen.getByRole('img', { name: 'Hintoric' })).toBeInTheDocument();
  });

  it('allows overriding the accessible name', () => {
    render(<HintoricLogo aria-label="Hintoric logo" />);
    expect(screen.getByRole('img', { name: 'Hintoric logo' })).toBeInTheDocument();
  });

  it('merges a custom className with its own default color class', () => {
    render(<HintoricLogo className="custom-class" data-testid="logo" />);
    const el = screen.getByTestId('logo');
    expect(el).toHaveClass('custom-class');
    expect(el).toHaveClass('text-ink-primary');
  });

  it('forwards a ref to the underlying svg element', () => {
    const ref = React.createRef<SVGSVGElement>();
    render(<HintoricLogo ref={ref} data-testid="logo" />);
    expect(ref.current).toBe(screen.getByTestId('logo'));
  });
});
