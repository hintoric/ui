import { Link } from 'react-router-dom';

export function Home() {
  return (
    <>
      <h1>@hintoric/ui</h1>
      <p className="docs-lede">
        Joy UI&apos;s look and component API, built on Base UI for behavior and accessibility, styled
        with Tailwind CSS instead of Emotion.
      </p>
      <p>
        Every component ships with a Joy-compatible <code>variant</code>/<code>color</code> API
        (<code>solid</code> / <code>soft</code> / <code>outlined</code> / <code>plain</code> ×{' '}
        <code>primary</code> / <code>neutral</code> / <code>danger</code> / <code>success</code> /{' '}
        <code>warning</code>), verified against the real <code>@mui/joy</code> package with an
        automated visual regression suite covering every variant/color combination and every
        interactive state.
      </p>
      <p>
        Start with <Link to="/getting-started">Installation</Link>, or jump straight into a
        component from the sidebar.
      </p>
    </>
  );
}
