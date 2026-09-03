// Joy UI's Drawer clamps its size between a min, a viewport-relative
// percentage, and 100% — different clamps for the horizontal (left/right)
// vs vertical (top/bottom) axis. Confirmed against @mui/joy's Drawer.js
// source.
export const DRAWER_HORIZONTAL_SIZE = {
  sm: 'clamp(256px, 20%, 100%)',
  md: 'clamp(300px, 30%, 100%)',
  lg: 'clamp(440px, 60%, 100%)',
} as const;

export const DRAWER_VERTICAL_SIZE = {
  sm: 'clamp(350px, 30%, 100%)',
  md: 'clamp(400px, 45%, 100%)',
  lg: 'clamp(500px, 60%, 100%)',
} as const;
