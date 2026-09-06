import { Accordion, AccordionDetails, AccordionGroup, AccordionSummary, Typography } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function AccordionPage() {
  return (
    <>
      <h1>Accordion</h1>
      <p className="docs-lede">
        Collapsible sections stacked into a list. <code>AccordionGroup</code> holds the items and
        draws the dividers between them, <code>Accordion</code> is one item that owns its expanded
        state, <code>AccordionSummary</code> is the clickable header, and{' '}
        <code>AccordionDetails</code> the body that folds away.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <AccordionGroup style={{ maxWidth: 480 }}>
          <Accordion defaultExpanded>
            <AccordionSummary>What is this library?</AccordionSummary>
            <AccordionDetails>
              <Typography level="body-md">
                Joy UI&apos;s look and API, rebuilt on Base UI for behaviour and Tailwind for
                styling.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary>Does it need Emotion?</AccordionSummary>
            <AccordionDetails>
              <Typography level="body-md">
                No. Styling ships as a prebuilt stylesheet, so there is no runtime CSS-in-JS.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion disabled>
            <AccordionSummary>Unavailable section</AccordionSummary>
            <AccordionDetails>
              <Typography level="body-md">You cannot open this one.</Typography>
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
      </Demo>
      <Code>{`<AccordionGroup>
  <Accordion defaultExpanded>
    <AccordionSummary>What is this library?</AccordionSummary>
    <AccordionDetails>Joy UI’s look, rebuilt on Base UI.</AccordionDetails>
  </Accordion>
</AccordionGroup>`}</Code>

      <h2>Controlled</h2>
      <p>
        Each <code>Accordion</code> owns its own expanded state — there is no single-open-at-a-time
        mode on the group. <code>onChange</code> takes the event first and the next expanded flag
        second, matching Joy UI.
      </p>
      <Code>{`const [open, setOpen] = React.useState('first');

<AccordionGroup>
  <Accordion expanded={open === 'first'} onChange={(_event, next) => setOpen(next ? 'first' : '')}>
    <AccordionSummary>First</AccordionSummary>
    <AccordionDetails>…</AccordionDetails>
  </Accordion>
</AccordionGroup>`}</Code>

      <h2>Without dividers</h2>
      <Demo>
        <AccordionGroup disableDivider style={{ maxWidth: 480 }}>
          <Accordion>
            <AccordionSummary>First</AccordionSummary>
            <AccordionDetails>No line above or below.</AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary>Second</AccordionSummary>
            <AccordionDetails>No line above or below.</AccordionDetails>
          </Accordion>
        </AccordionGroup>
      </Demo>
      <Code>{`<AccordionGroup disableDivider>…</AccordionGroup>`}</Code>

      <h2>Custom indicator</h2>
      <p>
        The default indicator is the same unfold arrow Select uses. Any node replaces it.
      </p>
      <Demo>
        <AccordionGroup style={{ maxWidth: 480 }}>
          <Accordion>
            <AccordionSummary indicator="+">Plus instead of a chevron</AccordionSummary>
            <AccordionDetails>Body text.</AccordionDetails>
          </Accordion>
        </AccordionGroup>
      </Demo>
      <Code>{`<AccordionSummary indicator="+">Section title</AccordionSummary>`}</Code>

      <h2>Variants &amp; colors</h2>
      <p>
        The variant and colour set on <code>Accordion</code> style the item itself.{' '}
        <code>AccordionDetails</code> has its own pair, defaulting to <code>plain</code>/
        <code>neutral</code> rather than inheriting.
      </p>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <AccordionGroup style={{ width: 130 }}>
              <Accordion variant={variant} color={color}>
                <AccordionSummary>Title</AccordionSummary>
                <AccordionDetails>Body</AccordionDetails>
              </Accordion>
            </AccordionGroup>
          )}
        />
      </Demo>
      <Code>{`<Accordion variant="soft" color="primary">…</Accordion>`}</Code>

      <h2>AccordionGroup props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The Accordion items.' },
          { name: 'disableDivider', type: 'boolean', default: 'false', description: 'Hides the line drawn between items.' },
        ]}
      />

      <h2>Accordion props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'An AccordionSummary and an AccordionDetails.' },
          { name: 'expanded', type: 'boolean', description: 'Controlled expanded state.' },
          { name: 'defaultExpanded', type: 'boolean', default: 'false', description: 'Whether the item starts open (uncontrolled).' },
          { name: 'onChange', type: '(event: React.SyntheticEvent | undefined, expanded: boolean) => void', description: 'Called when the item opens or closes.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'plain'", description: 'Visual style of the item.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents the item from being opened.' },
        ]}
      />

      <h2>AccordionSummary props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The header content.' },
          { name: 'indicator', type: 'React.ReactNode', default: 'unfold arrow', description: 'Replaces the default open/close indicator.' },
        ]}
      />

      <h2>AccordionDetails props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The collapsible body content.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'plain'", description: 'Visual style of the body.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
        ]}
      />
    </>
  );
}
