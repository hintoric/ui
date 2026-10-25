import { AnimatedIcon, Typography } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

export function AnimatedIconPage() {
  return (
    <>
      <h1>AnimatedIcon</h1>
      <p className="docs-lede">
        Plays an animated hintoric icon from the CDN, for loading states that take a while. It
        loops, follows the colour scheme and shows a still image under reduced motion.
      </p>

      <h2>Basic usage</h2>
      <p>
        Pass the name of the icon on the CDN. The player (lottie-web) loads lazily on the first
        animated icon, so it stays out of your main bundle.
      </p>
      <Demo>
        <AnimatedIcon name="form-reading-lens" />
      </Demo>
      <Code>{`import { AnimatedIcon } from '@hintoric/ui';

<AnimatedIcon name="form-reading-lens" />`}</Code>

      <h2>Size</h2>
      <Demo>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <AnimatedIcon name="form-reading-lens" size={64} />
          <AnimatedIcon name="form-reading-lens" size={96} />
          <AnimatedIcon name="form-reading-lens" />
        </div>
      </Demo>
      <Code>{`<AnimatedIcon name="form-reading-lens" size={64} />
<AnimatedIcon name="form-reading-lens" size={96} />
<AnimatedIcon name="form-reading-lens" />`}</Code>

      <h2>Colour scheme</h2>
      <p>
        The animation follows <code>data-color-scheme</code> on <code>&lt;html&gt;</code>, as set by{' '}
        <code>ColorSchemeProvider</code>. When the scheme changes, the icon reloads with the other
        colours. Use <code>mode</code> to pin one scheme, for example on a surface that is dark in
        both.
      </p>
      <Demo>
        <div style={{ display: 'flex', gap: 16 }}>
          <AnimatedIcon name="form-reading-lens" size={96} mode="light" />
          <div style={{ background: '#171a1c', borderRadius: 8 }}>
            <AnimatedIcon name="form-reading-lens" size={96} mode="dark" />
          </div>
        </div>
      </Demo>
      <Code>{`<AnimatedIcon name="form-reading-lens" mode="dark" />`}</Code>

      <h2>Reduced motion</h2>
      <p>
        With reduced motion (from <code>ReducedMotionProvider</code> or the system setting) no
        player loads. The icon shows its still image for the current scheme instead. The same
        still image is the fallback if the animation cannot load.
      </p>

      <h2>Accessibility</h2>
      <p>
        The icon is decorative by default and hidden from assistive technology. Give it a{' '}
        <code>title</code> if it is the only sign of what is happening.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <AnimatedIcon name="form-reading-lens" size={96} />
          <Typography level="body-sm">Wir suchen die Ausfüllstellen im Formular …</Typography>
        </div>
      </Demo>
      <Code>{`// Decorative: the text next to it says what happens.
<AnimatedIcon name="form-reading-lens" />
<Typography>Wir suchen die Ausfüllstellen im Formular …</Typography>

// Alone: give it a name.
<AnimatedIcon name="form-reading-lens" title="Formular wird gelesen" />`}</Code>

      <h2>Icons</h2>
      <PropsTable
        rows={[
          { name: 'form-reading-lens', type: 'icon', description: 'A sheet with a magnifier; three frames appear around the dashed lines. For reading or analysing a form.' },
        ]}
      />

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'name', type: 'string', description: 'An icon under cdn.hintoric.com/assets/icons/. Ignored when src is given.' },
          { name: 'src', type: '{ animation, darkSlots, light, dark }', description: 'Explicit file URLs: the Lottie JSON (light colours), the dark slot colours, and the two still images.' },
          { name: 'size', type: 'number | string', default: '160', description: 'Width and height. A number is px.' },
          { name: 'mode', type: "'auto' | 'light' | 'dark'", default: "'auto'", description: 'auto follows data-color-scheme on <html>; light and dark pin one scheme.' },
          { name: 'title', type: 'string', description: 'Accessible name. Without it the icon is aria-hidden.' },
        ]}
      />
    </>
  );
}
