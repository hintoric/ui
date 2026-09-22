import { describe, expect, it } from 'vitest';
import { extractRoutes } from './routes.ts';

const APP = `
import { Layout } from './Layout';
import { Home } from './pages/Home';
import { FloatingBarPage } from './pages/FloatingBarPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/floating-bar" element={<FloatingBarPage />} />
      </Route>
    </Routes>
  );
}
`;

describe('extractRoutes', () => {
  it('pairs each route with the file its page comes from', () => {
    expect(extractRoutes(APP)).toEqual([
      { path: '/', module: 'Home' },
      { path: '/floating-bar', module: 'FloatingBarPage' },
    ]);
  });

  it('skips the layout route, which has no path of its own', () => {
    expect(extractRoutes(APP).some((route) => route.module === 'Layout')).toBe(false);
  });

  it('skips a route whose element is not an imported page', () => {
    const source = `<Route path="/x" element={<Redirect to="/" />} />`;
    expect(extractRoutes(source)).toEqual([]);
  });
});
