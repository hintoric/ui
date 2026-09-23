import * as React from 'react';
import { Dropdown, FloatingBar, FloatingBarButton, FloatingBarMenuButton, Menu, MenuItem, Typography } from '@hintoric/ui';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

function SelectionDemo() {
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
      <FloatingBar aria-label="Ansicht">
        <FloatingBarButton
          selected={view === 'grid'}
          aria-label="Raster"
          onClick={() => setView('grid')}
        >
          <GridViewRoundedIcon fontSize="small" />
        </FloatingBarButton>
        <FloatingBarButton
          selected={view === 'list'}
          aria-label="Liste"
          onClick={() => setView('list')}
        >
          <ViewListRoundedIcon fontSize="small" />
        </FloatingBarButton>
      </FloatingBar>
      <Typography level="body-sm">{view}</Typography>
    </div>
  );
}

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 280,
        height: 170,
        borderRadius: 8,
        border: '1px solid var(--color-divider)',
        background: 'var(--color-surface-1)',
      }}
    >
      {children}
    </div>
  );
}

export function FloatingBarPage() {
  return (
    <>
      <h1>FloatingBar</h1>
      <p className="docs-lede">
        A pill of actions that floats over what it acts on. There is no Joy UI counterpart. It
        exists because the shape changes what may sit inside it: in a round bar a selected button
        has to be a circle, and an <code>IconButton</code>&rsquo;s <code>rounded-sm</code> corner in
        a <code>rounded-full</code> container reads as a mistake. <code>FloatingBarButton</code> is
        that circle.
      </p>

      <h2>Basic usage</h2>
      <p>
        Without a <code>placement</code> the bar is an ordinary flex element and you place it
        yourself.
      </p>
      <Demo>
        <FloatingBar aria-label="Aktionen">
          <FloatingBarButton aria-label="Bearbeiten">
            <EditRoundedIcon fontSize="small" />
          </FloatingBarButton>
          <FloatingBarButton aria-label="Drucken">
            <PrintRoundedIcon fontSize="small" />
          </FloatingBarButton>
          <FloatingBarButton aria-label="Herunterladen" disabled>
            <DownloadRoundedIcon fontSize="small" />
          </FloatingBarButton>
        </FloatingBar>
      </Demo>
      <Code>{`<FloatingBar aria-label="Aktionen">
  <FloatingBarButton aria-label="Bearbeiten"><EditRoundedIcon fontSize="small" /></FloatingBarButton>
  <FloatingBarButton aria-label="Drucken"><PrintRoundedIcon fontSize="small" /></FloatingBarButton>
  <FloatingBarButton aria-label="Herunterladen" disabled><DownloadRoundedIcon fontSize="small" /></FloatingBarButton>
</FloatingBar>`}</Code>

      <h2>Selected</h2>
      <p>
        <code>selected</code> draws the button with the variant&rsquo;s persistent &ldquo;active&rdquo;
        background — the same mechanism <code>ListItemButton</code> and <code>ToggleButtonGroup</code>{' '}
        use — and announces it as <code>aria-pressed</code>. Leave the prop out for a plain action:
        a button with no state should not claim one.
      </p>
      <p>
        The bar holds no selection of its own. Keep it where the rest of your state lives, or reach
        for <code>ToggleButtonGroup</code> or <code>RadioGroup</code> when you want a group that
        holds it for you.
      </p>
      <Demo>
        <SelectionDemo />
      </Demo>
      <Code>{`const [view, setView] = React.useState<'grid' | 'list'>('grid');

<FloatingBar aria-label="Ansicht">
  <FloatingBarButton selected={view === 'grid'} aria-label="Raster" onClick={() => setView('grid')}>
    <GridViewRoundedIcon fontSize="small" />
  </FloatingBarButton>
  <FloatingBarButton selected={view === 'list'} aria-label="Liste" onClick={() => setView('list')}>
    <ViewListRoundedIcon fontSize="small" />
  </FloatingBarButton>
</FloatingBar>`}</Code>

      <h2>A menu at the end</h2>
      <p>
        <code>FloatingBarMenuButton</code> is the same circle as a trigger: inside a{' '}
        <code>Dropdown</code>, it opens a <code>Menu</code>. It exists because a{' '}
        <code>MenuButton</code> cannot be a <code>FloatingBarButton</code> — one is a Base UI menu
        trigger, the other a Base UI button — and a square trigger at the end of a pill reads as a
        mistake. It has no <code>selected</code>: open or closed is the menu&rsquo;s to announce.
      </p>
      <Demo>
        <FloatingBar aria-label="Aktionen">
          <FloatingBarButton aria-label="Bearbeiten">
            <EditRoundedIcon fontSize="small" />
          </FloatingBarButton>
          <FloatingBarButton aria-label="Drucken">
            <PrintRoundedIcon fontSize="small" />
          </FloatingBarButton>
          <Dropdown>
            <FloatingBarMenuButton aria-label="Mehr">
              <MoreVertRoundedIcon fontSize="small" />
            </FloatingBarMenuButton>
            <Menu size="sm">
              <MenuItem>Duplizieren</MenuItem>
              <MenuItem>Umbenennen</MenuItem>
            </Menu>
          </Dropdown>
        </FloatingBar>
      </Demo>
      <Code>{`<FloatingBar aria-label="Aktionen">
  <FloatingBarButton aria-label="Bearbeiten"><EditRoundedIcon fontSize="small" /></FloatingBarButton>
  <Dropdown>
    <FloatingBarMenuButton aria-label="Mehr"><MoreVertRoundedIcon fontSize="small" /></FloatingBarMenuButton>
    <Menu size="sm">
      <MenuItem>Duplizieren</MenuItem>
    </Menu>
  </Dropdown>
</FloatingBar>`}</Code>

      <h2>Placement</h2>
      <p>
        A <code>placement</code> pins the bar to an edge of the nearest positioned ancestor, and the
        orientation follows: upright against a side edge, flat against a top or bottom one.{' '}
        <code>align</code> moves it along that edge, <code>straddle</code> hangs it half over it.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <Stage>
            <FloatingBar aria-label="Rechts" placement="right" align="start" straddle size="sm">
              <FloatingBarButton selected aria-label="Bearbeiten">
                <EditRoundedIcon fontSize="small" />
              </FloatingBarButton>
              <FloatingBarButton aria-label="Drucken">
                <PrintRoundedIcon fontSize="small" />
              </FloatingBarButton>
            </FloatingBar>
          </Stage>
          <Stage>
            <FloatingBar aria-label="Unten" placement="bottom" size="sm">
              <FloatingBarButton selected aria-label="Raster">
                <GridViewRoundedIcon fontSize="small" />
              </FloatingBarButton>
              <FloatingBarButton aria-label="Liste">
                <ViewListRoundedIcon fontSize="small" />
              </FloatingBarButton>
              <FloatingBarButton aria-label="Herunterladen">
                <DownloadRoundedIcon fontSize="small" />
              </FloatingBarButton>
            </FloatingBar>
          </Stage>
        </div>
      </Demo>
      <Code>{`<div style={{ position: 'relative' }}>
  <FloatingBar aria-label="Aktionen" placement="right" align="start" straddle size="sm">
    …
  </FloatingBar>
</div>`}</Code>

      <h2>Moving it from a stylesheet</h2>
      <p>
        Every distance is a custom property with a fallback, never a plain value. The reason is the
        narrow screen: a bar that straddles a dialog&rsquo;s right edge has to come inside once
        there is no room beside it, and that is a media query. A prop cannot answer one, and an
        inline value cannot be overridden by one — a custom property can, from any rule that sets
        it, with no specificity contest.
      </p>
      <Code>{`@media (max-width: 40rem) {
  .preview-actions {
    --floating-bar-straddle: 0%;
    --floating-bar-inset: 0.5rem;
  }
}`}</Code>
      <PropsTable
        rows={[
          {
            name: '--floating-bar-inset',
            type: 'length',
            default: '0px straddling, 1rem inside',
            description: 'Distance from the edge the placement names.',
          },
          {
            name: '--floating-bar-offset',
            type: 'length',
            default: '1rem',
            description: 'Distance along that edge, for align="start" and align="end".',
          },
          {
            name: '--floating-bar-straddle',
            type: 'length',
            default: '50% straddling, 0% inside',
            description: 'How far the bar hangs over the edge. Unsigned — the placement decides which way is out.',
          },
        ]}
      />

      <h2>Props</h2>
      <h3>FloatingBar</h3>
      <PropsTable
        rows={[
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'outlined'", description: "The pill's surface, as on Sheet." },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: "The pill's palette." },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Handed down to every FloatingBarButton that sets none of its own.' },
          { name: 'orientation', type: "'horizontal' | 'vertical'", description: 'Defaults to the one the placement implies.' },
          { name: 'placement', type: "'top' | 'right' | 'bottom' | 'left'", description: 'Pins the bar to that edge of the nearest positioned ancestor. Without it the bar stays in the flow.' },
          { name: 'align', type: "'start' | 'center' | 'end'", default: "'center'", description: 'Where along the edge it sits.' },
          { name: 'straddle', type: 'boolean', default: 'false', description: 'Hangs the bar half over the edge instead of keeping it inside.' },
          { name: 'component', type: 'React.ElementType', description: 'Renders as something else than a div.' },
        ]}
      />
      <h3>FloatingBarButton</h3>
      <PropsTable
        rows={[
          { name: 'selected', type: 'boolean', description: 'Draws the button active and announces it pressed. Omit it entirely for a plain action.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'plain'", description: "Also picks the token the selected background comes from." },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'As on IconButton.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", description: "Falls back to the bar's." },
        ]}
      />
      <h3>FloatingBarMenuButton</h3>
      <PropsTable
        rows={[
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'plain'", description: 'As on FloatingBarButton.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'As on FloatingBarButton.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", description: "Falls back to the bar's." },
        ]}
      />
    </>
  );
}
