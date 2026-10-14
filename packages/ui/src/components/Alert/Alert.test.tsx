import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from './Alert';
import { AlertTitle } from './AlertTitle';

describe('Alert', () => {
  it('renders its children', () => {
    render(<Alert>Something happened</Alert>);
    expect(screen.getByText('Something happened')).toBeInTheDocument();
  });

  it('has role="alert" by default', () => {
    render(<Alert>Message</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('allows overriding role', () => {
    render(<Alert role="status">Message</Alert>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('defaults to soft/neutral/md', () => {
    render(<Alert data-testid="alert">Message</Alert>);
    expect(screen.getByTestId('alert')).toHaveClass('bg-neutral-soft-bg', 'p-3');
  });

  it('applies variant and color classes', () => {
    render(
      <Alert data-testid="alert" variant="solid" color="danger">
        Error
      </Alert>,
    );
    expect(screen.getByTestId('alert')).toHaveClass('bg-danger-solid-bg', 'text-danger-solid-color');
  });

  it('renders decorators around the content', () => {
    render(
      <Alert startDecorator={<span data-testid="start">!</span>} endDecorator={<span data-testid="end">x</span>}>
        Content
      </Alert>,
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('top-aligns the row so decorators stay on the first line', () => {
    render(
      <Alert data-testid="alert" startDecorator={<span data-testid="icon">i</span>}>
        <AlertTitle>Title</AlertTitle>
        <div>Line one</div>
        <div>Line two</div>
      </Alert>,
    );
    expect(screen.getByTestId('alert')).toHaveClass('items-start');
    expect(screen.getByTestId('alert')).not.toHaveClass('items-center');
    const decorator = screen.getByTestId('icon').parentElement!;
    expect(decorator).toHaveClass('min-h-[1lh]', 'items-center', 'flex-none');
  });
});

describe('AlertTitle', () => {
  it('renders a 16px/24px semibold title', () => {
    render(<AlertTitle>Heads up</AlertTitle>);
    expect(screen.getByText('Heads up')).toHaveClass('text-base/6', 'font-semibold');
  });

  it('merges className', () => {
    render(<AlertTitle className="mb-1">Heads up</AlertTitle>);
    expect(screen.getByText('Heads up')).toHaveClass('font-semibold', 'mb-1');
  });

  it('shows an icon for its colour by default, hidden from assistive technology', () => {
    const iconOf = (color: 'primary' | 'neutral' | 'danger' | 'success' | 'warning') => {
      const { container, unmount } = render(<Alert color={color}>Message</Alert>);
      const svg = container.querySelector('svg');
      const name = svg?.getAttribute('data-alert-icon');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      unmount();
      return name;
    };
    expect(iconOf('primary')).toBe('info');
    expect(iconOf('neutral')).toBe('info');
    expect(iconOf('danger')).toBe('report');
    expect(iconOf('success')).toBe('check-circle');
    expect(iconOf('warning')).toBe('warning');
  });

  it('defaults to the neutral icon when no colour is given', () => {
    const { container } = render(<Alert>Message</Alert>);
    expect(container.querySelector('svg')).toHaveAttribute('data-alert-icon', 'info');
  });

  it('puts the icon in the start decorator, on the first line', () => {
    const { container } = render(<Alert color="warning">Message</Alert>);
    expect(container.querySelector('svg')!.parentElement).toHaveClass('min-h-[1lh]', 'items-center', 'flex-none');
  });

  it('sizes the icon 20px up to md and 24px at lg, as Joy sizes icons in an alert', () => {
    const sizeOf = (size: 'sm' | 'md' | 'lg') => {
      const { container, unmount } = render(<Alert size={size}>Message</Alert>);
      const cls = container.querySelector('svg')!.getAttribute('class');
      unmount();
      return cls;
    };
    expect(sizeOf('sm')).toContain('size-5');
    expect(sizeOf('md')).toContain('size-5');
    expect(sizeOf('lg')).toContain('size-6');
  });

  it('replaces the icon with a given start decorator', () => {
    const { container } = render(<Alert startDecorator={<span data-testid="own">!</span>}>Message</Alert>);
    expect(screen.getByTestId('own')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('leaves the icon out for startDecorator={null}', () => {
    const { container } = render(<Alert color="danger" startDecorator={null}>Message</Alert>);
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.getByText('Message').parentElement!.children).toHaveLength(1);
  });
});
