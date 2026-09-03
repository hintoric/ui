import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from './Tabs';
import { TabList } from '../TabList';
import { Tab } from '../Tab';
import { TabPanel } from '../TabPanel';

describe('Tabs', () => {
  it('shows the panel matching defaultValue', () => {
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
    expect(screen.getByText('Panel one')).toBeVisible();
    expect(screen.queryByText('Panel two')).not.toBeInTheDocument();
  });

  it('switches panels on tab click and calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Tabs defaultValue={0} onChange={onChange}>
        <TabList>
          <Tab value={0}>One</Tab>
          <Tab value={1}>Two</Tab>
        </TabList>
        <TabPanel value={0}>Panel one</TabPanel>
        <TabPanel value={1}>Panel two</TabPanel>
      </Tabs>,
    );
    await user.click(screen.getByRole('tab', { name: 'Two' }));
    expect(onChange).toHaveBeenCalledWith(expect.anything(), 1);
    expect(screen.getByText('Panel two')).toBeVisible();
    expect(screen.queryByText('Panel one')).not.toBeInTheDocument();
  });

  it('supports a fully controlled value prop', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState(0);
      return (
        <Tabs value={value} onChange={(_e, next) => setValue(next as number)}>
          <TabList>
            <Tab value={0}>One</Tab>
            <Tab value={1}>Two</Tab>
          </TabList>
          <TabPanel value={0}>Panel one</TabPanel>
          <TabPanel value={1}>Panel two</TabPanel>
        </Tabs>
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole('tab', { name: 'Two' }));
    expect(screen.getByText('Panel two')).toBeVisible();
  });

  it('does not switch to a disabled tab', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue={0}>
        <TabList>
          <Tab value={0}>One</Tab>
          <Tab value={1} disabled>
            Two
          </Tab>
        </TabList>
        <TabPanel value={0}>Panel one</TabPanel>
        <TabPanel value={1}>Panel two</TabPanel>
      </Tabs>,
    );
    await user.click(screen.getByRole('tab', { name: 'Two' }));
    expect(screen.getByText('Panel one')).toBeVisible();
  });

  it('defaults to plain/neutral', () => {
    render(
      <Tabs defaultValue={0} data-testid="tabs">
        <TabList>
          <Tab value={0}>One</Tab>
        </TabList>
        <TabPanel value={0}>Panel one</TabPanel>
      </Tabs>,
    );
    expect(screen.getByTestId('tabs')).toHaveClass('text-neutral-plain-color', 'bg-surface');
  });
});
