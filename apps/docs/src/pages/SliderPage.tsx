import { Slider } from '@hintoric/ui';
import type { JoyColor, JoyVariant } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { VariantColorGrid } from '../components/VariantColorGrid';
import { PropsTable } from '../components/PropsTable';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

export function SliderPage() {
  return (
    <>
      <h1>Slider</h1>
      <p className="docs-lede">
        A value picked from a continuous or stepped range, built on Base UI&apos;s{' '}
        <code>Slider.Root</code>. Passing an array to <code>value</code> or{' '}
        <code>defaultValue</code> turns it into a range slider with one thumb per entry.
      </p>

      <h2>Basic usage</h2>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 320 }}>
          <Slider aria-label="Volume" defaultValue={40} />
          <Slider aria-label="Range" defaultValue={[20, 70]} />
          <Slider aria-label="Disabled" defaultValue={50} disabled />
        </div>
      </Demo>
      <Code>{`<Slider defaultValue={40} onChange={(value) => console.log(value)} />
<Slider defaultValue={[20, 70]} />`}</Code>

      <h2>Variants &amp; colors</h2>
      <Demo>
        <VariantColorGrid
          variants={VARIANTS}
          colors={COLORS}
          renderCell={(variant, color) => (
            <div style={{ width: 96 }}>
              <Slider aria-label={`${variant}-${color}`} variant={variant} color={color} defaultValue={60} />
            </div>
          )}
        />
      </Demo>
      <Code>{`<Slider variant="soft" color="danger" defaultValue={60} />`}</Code>

      <h2>Sizes</h2>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 320 }}>
          <Slider aria-label="small" size="sm" defaultValue={30} />
          <Slider aria-label="medium" size="md" defaultValue={50} />
          <Slider aria-label="large" size="lg" defaultValue={70} />
        </div>
      </Demo>

      <h2>Steps and bounds</h2>
      <p>
        <code>min</code>, <code>max</code> and <code>step</code> work as they do on a native range
        input. The defaults are <code>0</code>, <code>100</code> and <code>1</code>.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 320 }}>
          <Slider aria-label="Rating" min={0} max={5} step={0.5} defaultValue={3.5} />
          <Slider aria-label="Year" min={1990} max={2030} step={10} defaultValue={2010} />
        </div>
      </Demo>
      <Code>{`<Slider min={0} max={5} step={0.5} defaultValue={3.5} />`}</Code>

      <h2>Vertical orientation</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 32, height: 180 }}>
          <Slider aria-label="Bass" orientation="vertical" defaultValue={30} />
          <Slider aria-label="Mid" orientation="vertical" defaultValue={55} />
          <Slider aria-label="Treble" orientation="vertical" defaultValue={80} />
        </div>
      </Demo>
      <Code>{`<Slider orientation="vertical" defaultValue={30} />`}</Code>

      <h2>Without the filled track</h2>
      <p>
        <code>track={'{false}'}</code> hides the filled indicator, leaving only the rail and the
        thumb.
      </p>
      <Demo>
        <div style={{ width: 320 }}>
          <Slider aria-label="No track" defaultValue={45} track={false} />
        </div>
      </Demo>

      <h2>Committing a value</h2>
      <p>
        <code>onChange</code> fires on every movement, <code>onChangeCommitted</code> only once the
        pointer or key is released — use the latter to avoid a request per pixel.
      </p>
      <Code>{`<Slider
  defaultValue={40}
  onChange={(value) => setPreview(value)}
  onChangeCommitted={(value) => save(value)}
/>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'value', type: 'number | readonly number[]', description: 'Current value. An array renders one thumb per entry. Use when controlled.' },
          { name: 'defaultValue', type: 'number | readonly number[]', description: 'Initial value (uncontrolled).' },
          { name: 'onChange', type: '(value: number | number[]) => void', description: 'Called continuously while dragging.' },
          { name: 'onChangeCommitted', type: '(value: number | number[]) => void', description: 'Called once when the interaction ends.' },
          { name: 'min', type: 'number', default: '0', description: 'Lower bound of the range.' },
          { name: 'max', type: 'number', default: '100', description: 'Upper bound of the range.' },
          { name: 'step', type: 'number', default: '1', description: 'Granularity of the value.' },
          { name: 'track', type: 'boolean', default: 'true', description: 'false hides the filled indicator.' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'solid'", description: 'Visual style of the track and thumb.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'primary'", description: 'Color palette applied to the variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Rail thickness and thumb diameter.' },
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Direction the slider runs in.' },
          { name: 'name', type: 'string', description: 'Form field name.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables interaction.' },
        ]}
      />
    </>
  );
}
