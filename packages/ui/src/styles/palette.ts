/*
 * Every raw colour stop and shape value of the look, in one place.
 *
 * `joyPalette` is @mui/joy's default palette — what `theme.css` used before
 * the KLM-inspired look, and what the dark scheme still uses. `lightPalette`
 * is the light scheme: primary unchanged, the other four derived from KLM's
 * component library v47.0.0 by `scripts/palette/deriveKlmPalette.ts`, whose
 * test fails if this file and the derivation disagree. See
 * docs/superpowers/specs/2026-10-27-klm-inspired-look-design.md.
 *
 * `theme.css` implements these values (checked by `theme.test.ts`), and the
 * visual suite's Joy oracle (`visual/joyTheme.ts`) is built from them.
 */

export type Stop = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
export type PaletteColor = 'primary' | 'neutral' | 'danger' | 'success' | 'warning';

export const joyPalette: Record<PaletteColor, Record<Stop, string>> = {
  primary: { 50: '#EDF5FD', 100: '#E3EFFB', 200: '#C7DFF7', 300: '#97C3F0', 400: '#4393E4', 500: '#0B6BCB', 600: '#185EA5', 700: '#12467B', 800: '#0A2744', 900: '#051423' },
  neutral: { 50: '#FBFCFE', 100: '#F0F4F8', 200: '#DDE7EE', 300: '#CDD7E1', 400: '#9FA6AD', 500: '#636B74', 600: '#555E68', 700: '#32383E', 800: '#171A1C', 900: '#0B0D0E' },
  danger: { 50: '#FEF6F6', 100: '#FCE4E4', 200: '#F7C5C5', 300: '#F09898', 400: '#E47474', 500: '#C41C1C', 600: '#A51818', 700: '#7D1212', 800: '#430A0A', 900: '#240505' },
  success: { 50: '#F6FEF6', 100: '#E3FBE3', 200: '#C7F7C7', 300: '#A1E8A1', 400: '#51BC51', 500: '#1F7A1F', 600: '#136C13', 700: '#0A470A', 800: '#042F04', 900: '#021D02' },
  warning: { 50: '#FEFAF6', 100: '#FDF0E1', 200: '#FCE1C2', 300: '#F3C896', 400: '#EA9A3E', 500: '#9A5B13', 600: '#72430D', 700: '#492B08', 800: '#2E1B05', 900: '#1D1002' },
};

export const lightPalette: Record<PaletteColor, Record<Stop, string>> = {
  primary: joyPalette.primary,
  neutral: { 50: '#FBF7F3', 100: '#F5F1ED', 200: '#EBE2DB', 300: '#D4CCC6', 400: '#AAA49E', 500: '#6E6966', 600: '#605C5A', 700: '#393735', 800: '#1A1918', 900: '#0D0C0C' },
  danger: { 50: '#FFEEF6', 100: '#FFD9E3', 200: '#FEBEC6', 300: '#FD989E', 400: '#FC6063', 500: '#B50200', 600: '#9B1A12', 700: '#751811', 800: '#4C100B', 900: '#2A0906' },
  success: { 50: '#DAFADA', 100: '#B7F1BA', 200: '#99DEA6', 300: '#73C58B', 400: '#40A469', 500: '#00653C', 600: '#125640', 700: '#0F433A', 800: '#0A2B26', 900: '#051714' },
  warning: { 50: '#FDEFD9', 100: '#FCE0B2', 200: '#F9C674', 300: '#F5A31E', 400: '#CA8312', 500: '#7D4E00', 600: '#6F4300', 700: '#583400', 800: '#382100', 900: '#1D1200' },
};

export const radius = { xs: '4px', sm: '12px', md: '16px', lg: '24px', xl: '32px' } as const;

export const outlineWidth = '1.5px';
