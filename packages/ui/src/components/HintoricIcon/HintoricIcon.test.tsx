import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HintoricIcon } from './HintoricIcon';

describe('HintoricIcon', () => {
  it('renders an svg with the icon mark viewBox', () => {
    render(<HintoricIcon data-testid="icon" />);
    const el = screen.getByTestId('icon');
    expect(el.tagName).toBe('svg');
    expect(el).toHaveAttribute('viewBox', '0 0 282.481 326');
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
