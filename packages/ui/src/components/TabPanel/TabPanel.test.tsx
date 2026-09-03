import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tabs } from '../Tabs';
import { TabList } from '../TabList';
import { Tab } from '../Tab';
import { TabPanel } from './TabPanel';

describe('TabPanel', () => {
  it('is associated with its matching Tab', () => {
    render(
      <Tabs defaultValue={0}>
        <TabList>
          <Tab value={0}>One</Tab>
        </TabList>
        <TabPanel value={0}>Panel content</TabPanel>
      </Tabs>,
    );
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel content');
  });

  it('defaults to plain/neutral', () => {
    render(
      <Tabs defaultValue={0}>
        <TabList>
          <Tab value={0}>One</Tab>
        </TabList>
        <TabPanel value={0} data-testid="panel">
          Panel content
        </TabPanel>
      </Tabs>,
    );
    expect(screen.getByTestId('panel')).toHaveClass('text-neutral-plain-color');
  });
});
