import { Switch, Typography } from '@hintoric/ui';
import type { JoyColor } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function SwitchPage() {
  return (
    <>
      <h1>Switch</h1>
      <p className="docs-lede">
        An on/off toggle built on Base UI&apos;s <code>Switch.Root</code>. Unlike most components
        here, Switch has no <code>variant</code> axis — Joy UI always renders it{' '}
        <code>solid</code> and expresses state through <code>color</code> alone, which defaults to{' '}
        <code>neutral</code> when off and <code>primary</code> when on.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Switch aria-label="off" />
          <Switch aria-label="on" defaultChecked />
          <Switch aria-label="disabled off" disabled />
          <Switch aria-label="disabled on" disabled defaultChecked />
        </div>
      </Demo>
      <Code>{`<Switch defaultChecked onCheckedChange={(checked) => console.log(checked)} />`}</Code>

      <h2>Colors</h2>
      <p>An explicit color pins the palette for both states instead of switching on check.</p>
      <Demo>
        <table className="docs-grid-table">
          <thead>
            <tr>
              <th />
              {COLORS.map((color) => (
                <th key={color}>{color}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">off</th>
              {COLORS.map((color) => (
                <td key={color}>
                  <Switch aria-label={`${color}-off`} color={color} />
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">on</th>
              {COLORS.map((color) => (
                <td key={color}>
                  <Switch aria-label={`${color}-on`} color={color} defaultChecked />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </Demo>
      <Code>{`<Switch color="success" defaultChecked />`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Switch aria-label="small" size="sm" defaultChecked />
          <Switch aria-label="medium" size="md" defaultChecked />
          <Switch aria-label="large" size="lg" defaultChecked />
        </div>
      </Demo>

      <h2>Decorators</h2>
      <p>
        Switch has no <code>label</code> prop. Use the decorators for adjacent text, or wrap the
        whole thing in your own <code>&lt;label&gt;</code>.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <Switch aria-label="dark mode" startDecorator={<Typography level="body-sm">Dark mode</Typography>} />
          <Switch
            aria-label="notifications"
            defaultChecked
            endDecorator={<Typography level="body-sm">Notifications</Typography>}
          />
        </div>
      </Demo>
      <Code>{`<Switch endDecorator={<Typography level="body-sm">Notifications</Typography>} />`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'checked', type: 'boolean', description: 'Controlled checked state.' },
          { name: 'defaultChecked', type: 'boolean', default: 'false', description: 'Initial checked state (uncontrolled).' },
          { name: 'onCheckedChange', type: '(checked: boolean) => void', description: 'Called when the switch is toggled.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: 'auto (neutral off, primary on)', description: 'Color palette of the track and thumb.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Track and thumb dimensions.' },
          { name: 'startDecorator', type: 'React.ReactNode', description: 'Content rendered before the track.' },
          { name: 'endDecorator', type: 'React.ReactNode', description: 'Content rendered after the track.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables interaction.' },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'Prevents changes but keeps the switch focusable.' },
          { name: 'required', type: 'boolean', default: 'false', description: 'Marks the field as required for form validation.' },
        ]}
      />
    </>
  );
}
