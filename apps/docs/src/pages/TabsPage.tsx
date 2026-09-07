import * as React from 'react';
import { Tab, TabList, TabPanel, Tabs, Typography } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

function ControlledTabs() {
  const [value, setValue] = React.useState<string | number | null>('overview');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Tabs value={value} onChange={(_event, next) => setValue(next)}>
        <TabList>
          <Tab value="overview">Overview</Tab>
          <Tab value="usage">Usage</Tab>
          <Tab value="api">API</Tab>
        </TabList>
      </Tabs>
      <code>{String(value)}</code>
    </div>
  );
}

export function TabsPage() {
  return (
    <>
      <h1>Tabs</h1>
      <p className="docs-lede">
        A set of panels sharing one region, built on Base UI&apos;s <code>Tabs</code>. Four parts
        work together: <code>Tabs</code> owns the selected value, <code>TabList</code> draws the
        row and the indicator, <code>Tab</code> is one trigger, and <code>TabPanel</code> is the
        content matched by <code>value</code>.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <Tabs defaultValue="overview">
          <TabList>
            <Tab value="overview">Overview</Tab>
            <Tab value="usage">Usage</Tab>
            <Tab value="api">API</Tab>
            <Tab value="legacy" disabled>
              Legacy
            </Tab>
          </TabList>
          <TabPanel value="overview">
            <Typography level="body-md">What the component is for, in one paragraph.</Typography>
          </TabPanel>
          <TabPanel value="usage">
            <Typography level="body-md">How to reach for it, with an example or two.</Typography>
          </TabPanel>
          <TabPanel value="api">
            <Typography level="body-md">Every prop, its type and its default.</Typography>
          </TabPanel>
        </Tabs>
      </Demo>
      <Code>{`<Tabs defaultValue="overview">
  <TabList>
    <Tab value="overview">Overview</Tab>
    <Tab value="usage">Usage</Tab>
  </TabList>
  <TabPanel value="overview">…</TabPanel>
  <TabPanel value="usage">…</TabPanel>
</Tabs>`}</Code>

      <h2>Controlled</h2>
      <p>
        <code>onChange</code> takes the event first and the next value second, matching Joy UI. The
        event can be <code>undefined</code> when the change came from something other than a user
        gesture.
      </p>
      <Demo>
        <ControlledTabs />
      </Demo>
      <Code>{`const [value, setValue] = React.useState<string | number | null>('overview');

<Tabs value={value} onChange={(_event, next) => setValue(next)}>…</Tabs>`}</Code>

      <h2>Sizes</h2>
      <p>
        <code>size</code> lives on <code>Tabs</code> and reaches each <code>Tab</code> through
        context — it is the one axis the children do inherit.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Tabs key={size} size={size} defaultValue="one">
              <TabList>
                <Tab value="one">{size} one</Tab>
                <Tab value="two">{size} two</Tab>
              </TabList>
            </Tabs>
          ))}
        </div>
      </Demo>

      <h2>Variants &amp; colors</h2>
      <p>
        <code>TabList</code> and <code>Tab</code> each default to <code>plain</code>/
        <code>neutral</code> independently — neither inherits the variant or colour from the
        enclosing <code>Tabs</code>. The grid below sets both on the <code>TabList</code>.
      </p>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <Tabs defaultValue="a">
              <TabList variant={variant} color={color}>
                <Tab value="a">A</Tab>
                <Tab value="b">B</Tab>
              </TabList>
            </Tabs>
          )}
        />
      </Demo>
      <Code>{`<Tabs defaultValue="a">
  <TabList variant="soft" color="primary">
    <Tab value="a">A</Tab>
  </TabList>
</Tabs>`}</Code>

      <h2>Vertical orientation</h2>
      <Demo>
        <Tabs orientation="vertical" defaultValue="general" style={{ display: 'flex', gap: 24 }}>
          <TabList>
            <Tab value="general">General</Tab>
            <Tab value="security">Security</Tab>
            <Tab value="billing">Billing</Tab>
          </TabList>
          <TabPanel value="general">
            <Typography level="body-md">General settings.</Typography>
          </TabPanel>
          <TabPanel value="security">
            <Typography level="body-md">Security settings.</Typography>
          </TabPanel>
          <TabPanel value="billing">
            <Typography level="body-md">Billing settings.</Typography>
          </TabPanel>
        </Tabs>
      </Demo>
      <Code>{`<Tabs orientation="vertical" defaultValue="general">…</Tabs>`}</Code>

      <h2>Tabs props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'A TabList plus the TabPanels.' },
          { name: 'value', type: 'string | number | null', description: 'Selected tab value. Use when controlled.' },
          { name: 'defaultValue', type: 'string | number | null', description: 'Initially selected value (uncontrolled).' },
          { name: 'onChange', type: '(event: React.SyntheticEvent | undefined, value: string | number | null) => void', description: 'Called when the selected tab changes.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height, padding and font size of each Tab. Inherited through context.' },
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Direction of the tab list.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'plain'", description: 'Visual style of the Tabs container itself.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette of the container.' },
        ]}
      />

      <h2>TabList props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The Tab triggers.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'plain'", description: 'Visual style of the list strip.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette of the strip and the indicator.' },
        ]}
      />

      <h2>Tab props</h2>
      <PropsTable
        rows={[
          { name: 'value', type: 'string | number', description: 'Identifies the tab and its matching panel. Required.' },
          { name: 'children', type: 'React.ReactNode', description: 'The trigger label.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'plain'", description: 'Visual style of the trigger.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Makes the tab unselectable.' },
        ]}
      />

      <h2>TabPanel props</h2>
      <PropsTable
        rows={[
          { name: 'value', type: 'string | number', description: 'Matches the Tab whose content this is. Required.' },
          { name: 'children', type: 'React.ReactNode', description: 'The panel content.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'plain'", description: 'Visual style of the panel.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
        ]}
      />

      <h2>Differences from Joy UI</h2>
      <p>
        Joy UI draws the active underline as a static <code>::after</code> on the selected tab. This
        build uses Base UI&apos;s single sliding <code>Tabs.Indicator</code>, which produces the
        same underline plus a transition Joy&apos;s version does not have. Selected tabs also get no
        persistent background here — only the indicator marks them, matching Joy.
      </p>
    </>
  );
}
