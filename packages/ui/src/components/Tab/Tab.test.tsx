import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tabs } from '../Tabs';
import { TabList } from '../TabList';
import { Tab } from './Tab';
import { TabPanel } from '../TabPanel';

describe('Tab', () => {
  it('marks the active tab as selected', () => {
    render(
      <Tabs defaultValue={0}>
        <TabList>
          <Tab value={0}>One</Tab>
          <Tab value={1}>Two</Tab>
        </TabList>
        <TabPanel value={0}>Panel one</TabPanel>
        <TabPanel value={1}>Panel two</TabPanel>
      </Tabs>,
    );
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'false');
  });

  it('is disabled when disabled prop is set', () => {
    render(
      <Tabs defaultValue={0}>
        <TabList>
          <Tab value={0} disabled>
            One
          </Tab>
        </TabList>
        <TabPanel value={0}>Panel</TabPanel>
      </Tabs>,
    );
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('defaults to plain/neutral', () => {
    render(
      <Tabs defaultValue={0}>
        <TabList>
          <Tab value={0} data-testid="tab">
            One
          </Tab>
        </TabList>
        <TabPanel value={0}>Panel</TabPanel>
      </Tabs>,
    );
    expect(screen.getByTestId('tab')).toHaveClass('text-neutral-plain-color');
  });
});
