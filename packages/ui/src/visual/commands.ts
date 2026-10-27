import type {} from '@vitest/browser-playwright';
import type { BrowserCommand } from 'vitest/node';

/*
 * Server-side browser commands for the visual suite (registered in
 * vitest.visual.config.ts, called from tests as `commands.<name>()`).
 */

/**
 * Parks the pointer in the page's bottom-right corner, away from where every
 * test renders. A hover leaves it on the spot it hovered, and Chromium later
 * puts whatever renders there next into :hover — in another test, or another
 * file. setup.ts calls this before every test; PointerReset.visual.test.tsx
 * pins it.
 */
export const resetPointer: BrowserCommand<[]> = async (ctx) => {
  const viewport = ctx.page.viewportSize() ?? { width: 1280, height: 720 };
  await ctx.page.mouse.move(viewport.width - 1, viewport.height - 1);
};

declare module 'vitest/browser' {
  interface BrowserCommands {
    resetPointer: () => Promise<void>;
  }
}
