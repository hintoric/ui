/*
 * The email module's copy of theme.css, resolved to literal values.
 *
 * Email clients cannot use the component library's styling: Gmail, Outlook
 * and Apple Mail resolve neither CSS custom properties nor Tailwind classes,
 * and Gmail drops <style> blocks in some contexts. So every email component
 * paints with inline `style` values taken from here, and the dark scheme is a
 * progressive enhancement layered on top (see styles.ts).
 *
 * The raw stops are theme.css's; the per-variant mapping below is the same
 * formula theme.css spells out token by token (Joy's createLight/DarkMode
 * VariantVariables, with neutral's -700 plain/outlined override in light).
 * The parity tests in src/visual/email/*.visual.test.tsx compare every email
 * component against its web counterpart in both schemes, so a drift between
 * the two shows up as a failing computed-style assertion.
 */

export type EmailColor = 'primary' | 'neutral' | 'danger' | 'success' | 'warning';
export type EmailVariant = 'solid' | 'soft' | 'outlined' | 'plain';
export type EmailScheme = 'light' | 'dark';

type Stop = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export const emailPalette: Record<EmailColor, Record<Stop, string>> = {
  neutral: { 50: '#FBFCFE', 100: '#F0F4F8', 200: '#DDE7EE', 300: '#CDD7E1', 400: '#9FA6AD', 500: '#636B74', 600: '#555E68', 700: '#32383E', 800: '#171A1C', 900: '#0B0D0E' },
  primary: { 50: '#EDF5FD', 100: '#E3EFFB', 200: '#C7DFF7', 300: '#97C3F0', 400: '#4393E4', 500: '#0B6BCB', 600: '#185EA5', 700: '#12467B', 800: '#0A2744', 900: '#051423' },
  warning: { 50: '#FEFAF6', 100: '#FDF0E1', 200: '#FCE1C2', 300: '#F3C896', 400: '#EA9A3E', 500: '#9A5B13', 600: '#72430D', 700: '#492B08', 800: '#2E1B05', 900: '#1D1002' },
  danger: { 50: '#FEF6F6', 100: '#FCE4E4', 200: '#F7C5C5', 300: '#F09898', 400: '#E47474', 500: '#C41C1C', 600: '#A51818', 700: '#7D1212', 800: '#430A0A', 900: '#240505' },
  success: { 50: '#F6FEF6', 100: '#E3FBE3', 200: '#C7F7C7', 300: '#A1E8A1', 400: '#51BC51', 500: '#1F7A1F', 600: '#136C13', 700: '#0A470A', 800: '#042F04', 900: '#021D02' },
};

export const EMAIL_COLORS: EmailColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];
export const EMAIL_VARIANTS: EmailVariant[] = ['solid', 'soft', 'outlined', 'plain'];

/** What one variant × colour paints. `undefined` means "leaves it to the surroundings". */
export interface EmailVariantTokens {
  color: string;
  backgroundColor?: string;
  borderColor?: string;
}

export function variantTokens(scheme: EmailScheme, variant: EmailVariant, color: EmailColor): EmailVariantTokens {
  const c = emailPalette[color];
  const dark = scheme === 'dark';
  switch (variant) {
    case 'solid':
      return { color: '#FFFFFF', backgroundColor: c[500] };
    case 'soft':
      return dark ? { color: c[200], backgroundColor: c[800] } : { color: c[700], backgroundColor: c[100] };
    case 'outlined':
      return dark
        ? { color: c[200], borderColor: c[700] }
        : { color: color === 'neutral' ? c[700] : c[500], borderColor: c[300] };
    case 'plain':
      return { color: dark ? c[300] : color === 'neutral' ? c[700] : c[500] };
  }
}

/** `--color-*-main`: step 500 in light, 400 in dark. What Link renders. */
export function mainColor(scheme: EmailScheme, color: EmailColor): string {
  return emailPalette[color][scheme === 'dark' ? 400 : 500];
}

export interface EmailSchemeTokens {
  inkPrimary: string;
  inkSecondary: string;
  inkTertiary: string;
  /** `--color-ink-icon`: the faintest ink. */
  inkIcon: string;
  /** `--color-surface`: what a Sheet / Card paints under outlined and plain. */
  surface: string;
  /** `--color-surface-1`. */
  surface1: string;
  /**
   * `--color-divider`. Kept as the rgba() theme.css uses so it composites the
   * same way over any surface; Outlook's Word engine drops rgba(), which is
   * why Divider also sets a solid `dividerFallback`.
   */
  divider: string;
  /** `divider` flattened onto `surface`. */
  dividerFallback: string;
}

export const emailSchemes: Record<EmailScheme, EmailSchemeTokens> = {
  light: {
    inkPrimary: emailPalette.neutral[800],
    inkSecondary: emailPalette.neutral[700],
    inkTertiary: emailPalette.neutral[600],
    inkIcon: emailPalette.neutral[500],
    surface: emailPalette.neutral[50],
    surface1: emailPalette.neutral[100],
    divider: 'rgba(99, 107, 116, 0.2)',
    dividerFallback: '#DCDFE2',
  },
  dark: {
    inkPrimary: emailPalette.neutral[100],
    inkSecondary: emailPalette.neutral[300],
    inkTertiary: emailPalette.neutral[400],
    inkIcon: emailPalette.neutral[400],
    surface: emailPalette.neutral[900],
    surface1: emailPalette.neutral[800],
    divider: 'rgba(159, 166, 173, 0.16)',
    dividerFallback: '#232628',
  },
};

export const emailFonts = {
  // `--font-body`.
  body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  // core's `--font-heading`. Only clients with the font installed or web-font
  // support (Apple Mail) show Montserrat; the rest fall back to the body stack.
  heading: "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

/** theme.css's radius scale. */
export const emailRadius = { xs: '2px', sm: '6px', md: '8px', lg: '12px', xl: '16px' };
