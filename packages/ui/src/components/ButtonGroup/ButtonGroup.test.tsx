import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ButtonGroup } from './ButtonGroup';
import { Button } from '../Button';
import { IconButton } from '../IconButton';

describe('ButtonGroup', () => {
  it('renders its children in a role="group" container', () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  it('tags the first and last child, like Joy', () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>,
    );
    expect(screen.getByText('One')).toHaveAttribute('data-first-child');
    expect(screen.getByText('Two')).not.toHaveAttribute('data-first-child');
    expect(screen.getByText('Two')).not.toHaveAttribute('data-last-child');
    expect(screen.getByText('Three')).toHaveAttribute('data-last-child');
  });

  it('leaves an only child untagged, like Joy', () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(screen.getByText('One')).not.toHaveAttribute('data-first-child');
    expect(screen.getByText('One')).not.toHaveAttribute('data-last-child');
  });

  it('defaults its buttons to outlined/neutral/md, like Joy', () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(screen.getByText('One')).toHaveClass('border-neutral-outlined-border', 'min-h-9');
  });

  it("hands its variant/color/size down to buttons that don't set their own", () => {
    render(
      <ButtonGroup variant="soft" color="danger" size="sm">
        <Button>A</Button>
        <Button variant="solid">B</Button>
        <IconButton aria-label="C">C</IconButton>
      </ButtonGroup>,
    );
    expect(screen.getByText('A')).toHaveClass('bg-danger-soft-bg', 'min-h-8');
    expect(screen.getByText('B')).toHaveClass('bg-danger-solid-bg');
    expect(screen.getByLabelText('C')).toHaveClass('bg-danger-soft-bg');
  });

  it('disables every button when disabled, unless a button opts out', () => {
    render(
      <ButtonGroup disabled>
        <Button>A</Button>
        <Button disabled={false}>B</Button>
      </ButtonGroup>,
    );
    expect(screen.getByText('A')).toBeDisabled();
    expect(screen.getByText('B')).toBeEnabled();
  });

  it('switches to a column when vertical', () => {
    render(
      <ButtonGroup orientation="vertical">
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('group')).toHaveClass('flex-col');
  });

  it("treats a numeric spacing as Joy's 8px spacing unit and a string as-is", () => {
    const { rerender } = render(
      <ButtonGroup spacing={1}>
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('group').style.gap).toBe('calc(var(--spacing) * 2)');
    rerender(
      <ButtonGroup spacing="1.5rem">
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('group').style.gap).toBe('1.5rem');
  });
});
