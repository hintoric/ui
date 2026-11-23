import { extendTheme } from '@mui/joy/styles';
import { lightPalette, outlineWidth, radius } from '../styles/palette';

/*
 * The parity oracle: real @mui/joy, configured with the agreed look
 * (docs/superpowers/specs/2026-10-27-klm-inspired-look-design.md) instead of
 * Joy's default. Every visual test renders Joy with this theme, so the suite
 * checks "our component is built correctly from these tokens", not "looks
 * like stock Joy". `scripts/joyThemeUsage.test.ts` fails on any provider
 * that forgets it.
 *
 * Built from the same `palette.ts` that `theme.css` is checked against. Only
 * the light scheme is overridden: dark keeps Joy's own palette. Everything
 * here encodes a spec decision — never adjust it to make a comparison pass.
 */

const neutral = (stop: number) => `var(--joy-palette-neutral-${stop})`;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

export const joyTheme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        // Every colour's solid-disabled fill moves one stop darker, off the
        // neutral-100 canvas.
        primary: { solidDisabledBg: neutral(200) },
        neutral: {
          ...lightPalette.neutral,
          // Neutral fills one stop darker than Joy's formula (spec: "One
          // exception, neutral fills in light") — the canvas is neutral-100.
          softBg: neutral(200),
          softHoverBg: neutral(300),
          softActiveBg: neutral(400),
          plainHoverBg: neutral(200),
          plainActiveBg: neutral(300),
          outlinedHoverBg: neutral(200),
          outlinedActiveBg: neutral(300),
          solidDisabledBg: neutral(200),
        },
        danger: { ...lightPalette.danger, solidDisabledBg: neutral(200) },
        success: { ...lightPalette.success, solidDisabledBg: neutral(200) },
        warning: { ...lightPalette.warning, solidDisabledBg: neutral(200) },
        // A warm canvas with white surfaces on it; the levels step away from
        // the canvas, so they start at neutral-200.
        background: {
          body: neutral(100),
          surface: 'var(--joy-palette-common-white)',
          popup: 'var(--joy-palette-common-white)',
          level1: neutral(200),
          level2: neutral(300),
          level3: neutral(400),
        },
      },
    },
  },
  radius: { ...radius },
  // Flat at rest: shadow.xs is what Joy puts on inputs and resting surfaces.
  shadow: { xs: 'none' },
  // Component outlines are 1.5px. Joy sets 1px in createVariant and
  // deep-merges this over it (styles/extendTheme.js).
  variants: {
    outlined: Object.fromEntries(COLORS.map((color) => [color, { '--variant-borderWidth': outlineWidth }])),
  },
  components: {
    JoyCard: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          // Cards are 24px (radius.lg); Joy's default Card reads radius.md.
          '--Card-radius': theme.vars.radius.lg,
          // The default Card is borderless on the light canvas and keeps its
          // outline in dark, where Joy's surface sits at ~1.08:1 against the
          // black canvas. Joy's light selector is the bare `&`, so dark is
          // the one spelled out.
          ...(ownerState.variant === 'outlined' &&
            ownerState.color === 'neutral' && {
              borderColor: 'transparent',
              [theme.getColorSchemeSelector('dark')]: { borderColor: theme.vars.palette.neutral.outlinedBorder },
            }),
        }),
      },
    },
  },
});
