export const COLOR_SCHEMES = ['light', 'dark'] as const;
export type ColorScheme = (typeof COLOR_SCHEMES)[number];

/**
 * Puts the whole document in `mode`, on <html> — the attribute both the web
 * components' tokens and the email stylesheet's `[data-color-scheme="dark"]`
 * rules key off. Waits out the web components' `transition-colors`, which
 * would otherwise be read mid-flight.
 */
export async function setColorScheme(mode: ColorScheme): Promise<void> {
  document.documentElement.setAttribute('data-color-scheme', mode);
  await new Promise((resolve) => setTimeout(resolve, 200));
}
