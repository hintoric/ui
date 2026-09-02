import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders a native textarea', () => {
    render(<Textarea aria-label="bio" />);
    expect(screen.getByRole('textbox', { name: 'bio' }).tagName).toBe('TEXTAREA');
  });

  it('applies outlined/neutral classes by default', () => {
    render(<Textarea aria-label="bio" />);
    expect(screen.getByRole('textbox', { name: 'bio' })).toHaveClass('border-neutral-outlined-border');
  });

  it('calls onChange with the native event while typing', async () => {
    const onChange = vi.fn();
    render(<Textarea aria-label="bio" onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'bio' }), 'hi');
    expect(onChange).toHaveBeenCalled();
  });

  it('forwards a ref to the underlying textarea element', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea aria-label="bio" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('disables the native resize handle (it ignores border-radius and pokes out of the rounded corner)', () => {
    render(<Textarea aria-label="bio" />);
    expect(screen.getByRole('textbox', { name: 'bio' })).toHaveClass('resize-none');
  });
});
