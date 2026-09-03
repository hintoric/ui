import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tabs } from '../Tabs';
import { TabList } from './TabList';
import { Tab } from '../Tab';
import { TabPanel } from '../TabPanel';

describe('TabList', () => {
  it('renders as a tablist containing its Tab children', () => {
    render(
      <Tabs defaultValue={0}>
        <TabList>
          <Tab value={0}>One</Tab>
        </TabList>
        <TabPanel value={0}>Panel</TabPanel>
      </Tabs>,
    );
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'One' })).toBeInTheDocument();
  });

  it('defaults to plain/neutral', () => {
    render(
      <Tabs defaultValue={0}>
        <TabList data-testid="list">
          <Tab value={0}>One</Tab>
        </TabList>
        <TabPanel value={0}>Panel</TabPanel>
      </Tabs>,
    );
    expect(screen.getByTestId('list')).toHaveClass('text-neutral-plain-color');
  });
});
