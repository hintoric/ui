import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown } from '../Dropdown';
import { Menu } from '../Menu';
import { MenuItem } from '../MenuItem';
import { FloatingBar } from './FloatingBar';
import { FloatingBarButton } from './FloatingBarButton';
import { FloatingBarMenuButton } from './FloatingBarMenuButton';

describe('FloatingBar', () => {
  it('renders its children in a toolbar', () => {
    render(
      <FloatingBar aria-label="Actions">
        <FloatingBarButton aria-label="Edit">E</FloatingBarButton>
      </FloatingBar>,
    );
    expect(screen.getByRole('toolbar', { name: 'Actions' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('stays in the flow until a placement is given', () => {
    render(<FloatingBar aria-label="Actions" />);
    expect(screen.getByRole('toolbar')).not.toHaveClass('absolute');
  });

  it('pins itself to the edge its placement names', () => {
    render(<FloatingBar aria-label="Actions" placement="right" />);
    const bar = screen.getByRole('toolbar');
    expect(bar).toHaveClass('absolute');
    expect(bar.getAttribute('style')).toContain('right:');
  });

  it('stands upright against a side edge and flat against a bottom one', () => {
    const { rerender } = render(<FloatingBar aria-label="Actions" placement="right" />);
    expect(screen.getByRole('toolbar')).toHaveClass('flex-col');
    rerender(<FloatingBar aria-label="Actions" placement="bottom" />);
    expect(screen.getByRole('toolbar')).toHaveClass('flex-row');
  });

  it('tells assistive technology when the toolbar stands upright', () => {
    // A toolbar is horizontal unless it says otherwise, so only the upright
    // case needs the attribute.
    const { rerender } = render(<FloatingBar aria-label="Actions" placement="right" />);
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-orientation', 'vertical');
    rerender(<FloatingBar aria-label="Actions" placement="bottom" />);
    expect(screen.getByRole('toolbar')).not.toHaveAttribute('aria-orientation');
  });

  it('keeps an orientation it was given explicitly', () => {
    render(<FloatingBar aria-label="Actions" placement="right" orientation="horizontal" />);
    expect(screen.getByRole('toolbar')).toHaveClass('flex-row');
  });

  it('hangs half over the edge only when asked to', () => {
    const { rerender } = render(<FloatingBar aria-label="Actions" placement="right" />);
    expect(screen.getByRole('toolbar').getAttribute('style')).toContain('--floating-bar-straddle, 0%');
    rerender(<FloatingBar aria-label="Actions" placement="right" straddle />);
    expect(screen.getByRole('toolbar').getAttribute('style')).toContain('--floating-bar-straddle, 50%');
  });

  it('states every distance as an overridable custom property, so a media query can move it', () => {
    // The narrow-screen case: a bar straddling a dialog's edge has to come
    // inside, and only a stylesheet can answer a media query.
    render(<FloatingBar aria-label="Actions" placement="right" align="start" straddle />);
    const style = screen.getByRole('toolbar').getAttribute('style');
    expect(style).toContain('--floating-bar-inset, 0px');
    expect(style).toContain('--floating-bar-offset, 1rem');
  });

  it('marks a selected button pressed and paints it with the persistent active background', () => {
    render(
      <FloatingBar aria-label="Actions">
        <FloatingBarButton selected aria-label="Grid">
          G
        </FloatingBarButton>
        <FloatingBarButton selected={false} aria-label="List">
          L
        </FloatingBarButton>
      </FloatingBar>,
    );
    const grid = screen.getByRole('button', { name: 'Grid' });
    expect(grid).toHaveAttribute('aria-pressed', 'true');
    expect(grid).toHaveClass('bg-neutral-plain-active-bg');
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'List' })).not.toHaveClass('bg-neutral-plain-active-bg');
  });

  it('draws its buttons round, so a selected one is a circle in the pill and not a square', () => {
    render(
      <FloatingBar aria-label="Actions">
        <FloatingBarButton selected aria-label="Grid">
          G
        </FloatingBarButton>
      </FloatingBar>,
    );
    const grid = screen.getByRole('button', { name: 'Grid' });
    expect(grid).toHaveClass('rounded-full');
    expect(grid).not.toHaveClass('rounded-sm');
  });

  it('leaves a plain action button unpressed rather than claiming a state it does not have', () => {
    render(
      <FloatingBar aria-label="Actions">
        <FloatingBarButton aria-label="Print">P</FloatingBarButton>
      </FloatingBar>,
    );
    expect(screen.getByRole('button', { name: 'Print' })).not.toHaveAttribute('aria-pressed');
  });

  it('hands its size down to its buttons', () => {
    render(
      <FloatingBar aria-label="Actions" size="lg">
        <FloatingBarButton aria-label="Print">P</FloatingBarButton>
      </FloatingBar>,
    );
    expect(screen.getByRole('button', { name: 'Print' })).toHaveClass('size-11');
  });

  it('lets a menu button sit in the bar as a circle of the bar\'s size, and opens its menu', async () => {
    render(
      <FloatingBar aria-label="Actions" size="lg">
        <FloatingBarButton aria-label="Print">P</FloatingBarButton>
        <Dropdown>
          <FloatingBarMenuButton aria-label="More">…</FloatingBarMenuButton>
          <Menu>
            <MenuItem>Duplicate</MenuItem>
          </Menu>
        </Dropdown>
      </FloatingBar>,
    );
    const more = screen.getByRole('button', { name: 'More' });
    expect(more).toHaveClass('rounded-full', 'size-11');
    expect(more).not.toHaveClass('rounded-sm');
    expect(more).not.toHaveAttribute('aria-pressed');

    await userEvent.click(more);
    expect(await screen.findByRole('menuitem', { name: 'Duplicate' })).toBeInTheDocument();
  });
});
