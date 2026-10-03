import { Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

export function ReducedMotionProviderPage() {
  return (
    <>
      <h1>Reduced motion</h1>
      <p className="docs-lede">
        Some people prefer less movement on screen. @hintoric/ui can tone down decorative animation
        while keeping loading states, progress and layout changes clear.
      </p>

      <h2>What changes</h2>
      <p>
        Things still work the same. They just stop moving so much. Spinners become static rings,
        skeletons stop pulsing, and drawers, modals, accordions and tabs switch instantly.
      </p>
      <p>
        We keep quick colour, hover and focus feedback. Those are small cues, not big motion. They
        help controls feel responsive.
      </p>

      <h2>Default: follow the system</h2>
      <p>
        You can do nothing. Components automatically follow{' '}
        <code>prefers-reduced-motion: reduce</code> when there is no provider.
      </p>
      <Code>{`import { AnimatedMapImage } from '@hintoric/ui';

// Automatically follows the user's OS/browser reduced-motion setting.
<AnimatedMapImage lat={52.52} lng={13.4} />`}</Code>

      <h2>Use your app setting instead</h2>
      <p>
        If your app already has a settings screen, use that value. Wrap your app in{' '}
        <code>ReducedMotionProvider</code>. Everything below it will use the same choice.
      </p>
      <Code>{`import { ReducedMotionProvider } from '@hintoric/ui';

export function App() {
  const reducedMotion = useSettings().reducedMotion;

  return (
    <ReducedMotionProvider reducedMotion={reducedMotion}>
      <Routes />
    </ReducedMotionProvider>
  );
}`}</Code>

      <h2>Settings modal example</h2>
      <p>
        This docs site does exactly that. The settings button in the top bar opens a small modal
        with one switch: <strong>Reduced motion</strong>. Toggle it and the demos update right away.
      </p>
      <Code>{`const [reducedMotion, setReducedMotion] = useState(false);

<ReducedMotionProvider reducedMotion={reducedMotion}>
  <AppShell />
  <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)}>
    <ModalDialog>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Switch
          aria-label="Reduced motion"
          checked={reducedMotion}
          onCheckedChange={setReducedMotion}
        />
      </DialogContent>
    </ModalDialog>
  </Modal>
</ReducedMotionProvider>`}</Code>

      <h2>Components covered</h2>
      <p>
        Covered today: image fades and reveals, loading spinners, skeletons, progress indicators,
        radio dots, switch thumbs, data-grid sort icons, tabs, accordions, modals and drawers.
      </p>

      <h2>Props</h2>
      <PropsTable
        rows={[
          {
            name: 'reducedMotion',
            type: 'boolean',
            description:
              'The current app preference. true disables decorative motion in components that support it.',
          },
          {
            name: 'children',
            type: 'React.ReactNode',
            description: 'Content that should receive the reduced-motion preference.',
          },
        ]}
      />

      <h2>useReducedMotion()</h2>
      <p>
        Returns the provider value when there is one. Otherwise it reads{' '}
        <code>prefers-reduced-motion: reduce</code>. You can call it without a provider. Use it for
        your own animated bits.
      </p>
    </>
  );
}
