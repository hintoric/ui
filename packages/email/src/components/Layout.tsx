import * as React from 'react';
import { Body, Container, Head, Html, Preview } from 'react-email';
import { emailClass, emailStylesheet } from '../styles';
import { emailFonts, emailSchemes, variantTokens } from '../tokens';

export interface LayoutProps {
  /** The `lang` of the message — screen readers pick their voice from it. */
  lang: string;
  /**
   * The line inbox lists show after the subject. Without one, clients take the
   * first text they find, which is usually the brand name.
   */
  preview: string;
  /** Rendered under the card: why the reader got this, the sender's legal line. */
  footer?: React.ReactNode;
  /** Forces a scheme for previews. Left out, the email follows the reader's OS where the client supports that. */
  colorScheme?: 'light' | 'dark';
  children: React.ReactNode;
}

/**
 * The whole document, laid out like core's AuthScreen: a 440px outlined card
 * with a 20px radius and 48px padding on a `surface-1` page, the fine print
 * centred under it. In dark the page and card swap surfaces, as AuthScreen's do.
 */
export function Layout({ lang, preview, footer, colorScheme, children }: LayoutProps) {
  const t = emailSchemes.light;
  return (
    <Html lang={lang} data-color-scheme={colorScheme}>
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <ColorSchemeStyles />
      </Head>
      <Preview>{preview}</Preview>
      <Body className={emailClass.layoutCanvas} style={{ margin: 0, padding: '40px 0', backgroundColor: t.surface1, fontFamily: emailFonts.body }}>
        <Container
          className={emailClass.layoutCard}
          style={{
            width: '100%',
            maxWidth: '440px',
            boxSizing: 'border-box',
            backgroundColor: t.surface,
            border: `1px solid ${variantTokens('light', 'outlined', 'neutral').borderColor}`,
            borderRadius: '20px',
          }}
        >
          <div className={emailClass.layoutCardBody} style={{ padding: '48px' }}>
            {children}
          </div>
        </Container>
        {footer && <Container style={{ maxWidth: '440px', padding: '24px 24px 0', textAlign: 'center' }}>{footer}</Container>}
      </Body>
    </Html>
  );
}

/**
 * The dark-mode stylesheet on its own. Layout includes it; render it
 * once yourself when email components are shown inside a normal page — a
 * preview, the docs — so they follow that page's `data-color-scheme`.
 */
export function ColorSchemeStyles() {
  return <style dangerouslySetInnerHTML={{ __html: emailStylesheet }} />;
}
