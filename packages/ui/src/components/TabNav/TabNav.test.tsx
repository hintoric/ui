import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReducedMotionProvider } from '../../theme/ReducedMotionProvider';
import { Tab } from '../Tab';
import { TabNav } from './TabNav';

function Nav({ value = '/documents' }: { value?: string | null }) {
  return (
    <TabNav value={value} aria-label="Main">
      <Tab value="/documents" href="/documents">
        Documents
      </Tab>
      <Tab value="/settings" href="/settings">
        Settings
      </Tab>
    </TabNav>
  );
}

describe('TabNav', () => {
  it('is a navigation landmark of links, not a tablist', () => {
    render(<Nav />);
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Documents' })).toHaveAttribute('href', '/documents');
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
  });

  it('marks the tab whose value matches as the current page', () => {
    render(<Nav value="/settings" />);
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Documents' })).not.toHaveAttribute('aria-current');
  });

  it('marks none when no value matches', () => {
    render(<Nav value={null} />);
    for (const link of screen.getAllByRole('link')) expect(link).not.toHaveAttribute('aria-current');
  });

  it('keeps every link in the Tab order (no roving tabindex)', async () => {
    const user = userEvent.setup();
    render(<Nav />);
    await user.tab();
    expect(screen.getByRole('link', { name: 'Documents' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveFocus();
  });

  it('renders a Tab through `component`, e.g. a router link', () => {
    const RouterLink = React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<'a'>>(
      function RouterLink(props, ref) {
        return <a ref={ref} data-router="" {...props} />;
      },
    );
    render(
      <TabNav value="/documents">
        <Tab value="/documents" href="/documents" component={RouterLink}>
          Documents
        </Tab>
      </TabNav>,
    );
    const link = screen.getByRole('link', { name: 'Documents' });
    expect(link).toHaveAttribute('data-router');
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('forwards refs to the nav and to the links', () => {
    const navRef = React.createRef<HTMLElement>();
    const tabRef = React.createRef<HTMLElement>();
    render(
      <TabNav ref={navRef} value="/a">
        <Tab ref={tabRef} value="/a" href="/a">
          A
        </Tab>
      </TabNav>,
    );
    expect(navRef.current?.tagName).toBe('NAV');
    expect(tabRef.current?.tagName).toBe('A');
  });

  it('refuses the click on a disabled tab and says so', async () => {
    const user = userEvent.setup();
    let defaultPrevented: boolean | undefined;
    render(
      <div onClick={(event) => (defaultPrevented = event.defaultPrevented)}>
        <TabNav value="/a">
          <Tab value="/b" href="/b" disabled>
            B
          </Tab>
        </TabNav>
      </div>,
    );
    const link = screen.getByRole('link', { name: 'B' });
    expect(link).toHaveAttribute('aria-disabled', 'true');
    await user.click(link);
    expect(defaultPrevented).toBe(true);
  });

  it('passes size down to its tabs', () => {
    render(
      <TabNav size="lg" value="/a">
        <Tab value="/a" href="/a">
          A
        </Tab>
      </TabNav>,
    );
    expect(screen.getByRole('link', { name: 'A' }).className).toContain('min-h-11');
  });

  it('defaults to plain/neutral', () => {
    render(<Nav />);
    expect(screen.getByRole('navigation').className).toContain('text-neutral-plain-color');
  });

  it('draws the indicator under the current link, animated unless motion is reduced', () => {
    const { container, unmount } = render(<Nav />);
    const indicator = container.querySelector('[data-tab-nav-indicator]');
    expect(indicator).toHaveAttribute('aria-hidden', 'true');
    expect(indicator?.className).toContain('transition-all');
    unmount();

    const reduced = render(
      <ReducedMotionProvider reducedMotion>
        <Nav />
      </ReducedMotionProvider>,
    );
    expect(reduced.container.querySelector('[data-tab-nav-indicator]')?.className).not.toContain('transition-all');
  });

  it('draws no indicator when no tab is current', () => {
    const { container } = render(<Nav value={null} />);
    expect(container.querySelector('[data-tab-nav-indicator]')).toBeNull();
  });

  it('leaves a Tab inside Tabs a role="tab" button', async () => {
    const { Tabs } = await import('../Tabs');
    const { TabList } = await import('../TabList');
    render(
      <Tabs defaultValue={0}>
        <TabList>
          <Tab value={0}>One</Tab>
        </TabList>
      </Tabs>,
    );
    expect(screen.getByRole('tab', { name: 'One' }).tagName).toBe('BUTTON');
  });
});
