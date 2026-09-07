import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FieldShell } from './FieldShell';

describe('FieldShell', () => {
  it('renders the bare child when there is no label and no helper text', () => {
    const { container } = render(
      <FieldShell id="x">
        <input aria-label="bare" />
      </FieldShell>,
    );
    // No wrapper: the input is the container's only child.
    expect(container.firstElementChild?.tagName).toBe('INPUT');
  });

  it('wraps in a FormControl with a label bound by htmlFor', () => {
    render(
      <FieldShell id="x" label="E-Mail">
        <input id="x" />
      </FieldShell>,
    );
    expect(screen.getByLabelText('E-Mail')).toHaveAttribute('id', 'x');
  });

  it('renders helper text with the given id', () => {
    render(
      <FieldShell id="x" helperId="x-helper-text" helperText="Hinweis">
        <input id="x" />
      </FieldShell>,
    );
    expect(screen.getByText('Hinweis')).toHaveAttribute('id', 'x-helper-text');
  });
});
