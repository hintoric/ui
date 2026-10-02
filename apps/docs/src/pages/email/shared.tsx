import type * as React from 'react';

/*
 * Shared by the pages of the docs' email section (/email). The components
 * render inline there — Layout mounts ColorSchemeStyles for the section — so they
 * follow the docs' colour scheme the way they follow a mail client's.
 */

export const VARIANT_PROP = { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", description: 'As on the web component.' };
export const COLOR_PROP = { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", description: 'As on the web component.' };

export function EmailPageIntro({ name, web, lede }: { name: string; web: string; lede: React.ReactNode }) {
  return (
    <>
      <h1>{name}</h1>
      <p className="docs-lede">{lede}</p>
      <p>
        Import from <code>@hintoric/email</code>. Renders as tables and inline styles, so it survives Gmail
        and Outlook; every variant × colour is compared against the web <code>{web}</code> in both colour
        schemes by the visual test suite.
      </p>
    </>
  );
}
