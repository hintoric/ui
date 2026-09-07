import { Table } from '@hintoric/ui';
import type { JoyColor, JoyVariant, TableBorderAxis } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const BORDER_AXES: TableBorderAxis[] = ['none', 'x', 'xBetween', 'y', 'yBetween', 'both', 'bothBetween'];

const ROWS = [
  { name: 'Frozen yoghurt', calories: 159, fat: 6.0, carbs: 24 },
  { name: 'Ice cream sandwich', calories: 237, fat: 9.0, carbs: 37 },
  { name: 'Eclair', calories: 262, fat: 16.0, carbs: 24 },
  { name: 'Cupcake', calories: 305, fat: 3.7, carbs: 67 },
];

function SampleBody() {
  return (
    <>
      <thead>
        <tr>
          <th>Dessert</th>
          <th>Calories</th>
          <th>Fat (g)</th>
          <th>Carbs (g)</th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map((row) => (
          <tr key={row.name}>
            <td>{row.name}</td>
            <td>{row.calories}</td>
            <td>{row.fat}</td>
            <td>{row.carbs}</td>
          </tr>
        ))}
      </tbody>
    </>
  );
}

export function TablePage() {
  return (
    <>
      <h1>Table</h1>
      <p className="docs-lede">
        Styling for a plain HTML table. You write <code>&lt;thead&gt;</code>,{' '}
        <code>&lt;tbody&gt;</code> and the rows yourself — the component adds the borders, padding
        and hover treatment. For sorting, virtualisation and column definitions, reach for{' '}
        <code>DataGrid</code> instead.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <Table>
          <SampleBody />
        </Table>
      </Demo>
      <Code>{`<Table>
  <thead>
    <tr><th>Dessert</th><th>Calories</th></tr>
  </thead>
  <tbody>
    <tr><td>Frozen yoghurt</td><td>159</td></tr>
  </tbody>
</Table>`}</Code>

      <h2>Border axis</h2>
      <p>
        <code>borderAxis</code> chooses which rules are drawn. The <code>Between</code> variants
        skip the outer edge and draw only between cells. The default is <code>xBetween</code>.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {BORDER_AXES.map((axis) => (
            <div key={axis}>
              <code>{axis}</code>
              <Table borderAxis={axis}>
                <thead>
                  <tr>
                    <th>Dessert</th>
                    <th>Calories</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Frozen yoghurt</td>
                    <td>159</td>
                  </tr>
                  <tr>
                    <td>Eclair</td>
                    <td>262</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          ))}
        </div>
      </Demo>
      <Code>{`<Table borderAxis="bothBetween">…</Table>`}</Code>

      <h2>Row hover</h2>
      <Demo>
        <Table hoverRow>
          <SampleBody />
        </Table>
      </Demo>
      <Code>{`<Table hoverRow>…</Table>`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Table key={size} size={size}>
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Calories</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{size}</td>
                  <td>159</td>
                </tr>
              </tbody>
            </Table>
          ))}
        </div>
      </Demo>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <Table variant={variant} color={color} size="sm">
              <tbody>
                <tr>
                  <td>A</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>B</td>
                  <td>2</td>
                </tr>
              </tbody>
            </Table>
          )}
        />
      </Demo>
      <Code>{`<Table variant="soft" color="neutral">…</Table>`}</Code>

      <h2>Sticky header and no wrapping</h2>
      <p>
        <code>stickyHeader</code> pins the header row while the table scrolls inside a constrained
        parent. <code>noWrap</code> keeps every cell on one line and clips the overflow.
      </p>
      <Demo>
        <div style={{ maxHeight: 160, overflow: 'auto' }}>
          <Table stickyHeader noWrap size="sm">
            <thead>
              <tr>
                <th>Dessert</th>
                <th>Calories</th>
              </tr>
            </thead>
            <tbody>
              {[...ROWS, ...ROWS, ...ROWS].map((row, index) => (
                <tr key={index}>
                  <td>{row.name}</td>
                  <td>{row.calories}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Demo>
      <Code>{`<div style={{ maxHeight: 320, overflow: 'auto' }}>
  <Table stickyHeader noWrap>…</Table>
</div>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'children', type: 'React.ReactNode', description: 'The thead, tbody and tfoot elements.' },
          { name: 'borderAxis', type: "'none' | 'x' | 'xBetween' | 'y' | 'yBetween' | 'both' | 'bothBetween'", default: "'xBetween'", description: 'Which rules are drawn. "Between" variants skip the outer edge.' },
          { name: 'hoverRow', type: 'boolean', default: 'false', description: 'Highlights the row under the pointer.' },
          { name: 'stickyHeader', type: 'boolean', default: 'false', description: 'Pins the header row while the table scrolls.' },
          { name: 'noWrap', type: 'boolean', default: 'false', description: 'Keeps cell content on a single line.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'plain'", description: 'Visual style of the table surface.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Cell padding and font size.' },
        ]}
      />
    </>
  );
}
