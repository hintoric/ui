import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import {
  Button as JoyButton,
  Card as JoyCard,
  Chip as JoyChip,
  CssVarsProvider as JoyCssVarsProvider,
  Input as JoyInput,
  ModalDialog as JoyModalDialog,
  Sheet as JoySheet,
} from '@mui/joy';
import { joyTheme } from './joyTheme';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

/*
 * The oracle checked against the spec on its own, with no component of ours in
 * the room: every other visual test trusts `joyTheme` to say what the look is,
 * so a mistake here would make them all agree with the mistake. No screenshots
 * — this file is about Joy's configuration, not about any one component's
 * appearance, and the component files carry the baselines.
 */
const EXPECTED = {
  light: { body: 'rgb(245, 241, 237)', cardBorder: 'rgba(0, 0, 0, 0)', softNeutral: 'rgb(235, 226, 219)', solidDanger: 'rgb(181, 2, 0)' },
  // Dark is Joy's own palette, unchanged.
  dark: { body: 'rgb(0, 0, 0)', cardBorder: 'rgb(50, 56, 62)', softNeutral: 'rgb(23, 26, 28)', solidDanger: 'rgb(196, 28, 28)' },
} as const;

describe('joyTheme, the parity oracle', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`carries the agreed look in ${scheme}`, async () => {
      await setColorScheme(scheme);
      render(
        <JoyCssVarsProvider theme={joyTheme} defaultMode={scheme}>
          <JoyButton data-testid="button" variant="outlined" color="neutral">Label</JoyButton>
          <JoyInput data-testid="input" placeholder="Input" />
          <JoyCard data-testid="card">Card</JoyCard>
          <JoyModalDialog data-testid="dialog">Dialog</JoyModalDialog>
          <JoySheet data-testid="body" sx={{ bgcolor: 'background.body' }}>Body</JoySheet>
          <JoyChip data-testid="chip" variant="soft" color="neutral">Chip</JoyChip>
          <JoyButton data-testid="danger" variant="solid" color="danger">Danger</JoyButton>
        </JoyCssVarsProvider>,
      );
      const style = (id: string) => getComputedStyle(page.getByTestId(id).element());

      expect(style('button').borderRadius).toBe('12px');
      expect(style('input').borderRadius).toBe('12px');
      expect(style('input').boxShadow).toBe('none');
      expect(style('card').borderRadius).toBe('24px');
      expect(style('card').borderTopColor).toBe(EXPECTED[scheme].cardBorder);
      // ModalDialog shares Card's root in Joy; the Card override must not reach it.
      expect(style('dialog').borderRadius).toBe('16px');
      expect(style('body').backgroundColor).toBe(EXPECTED[scheme].body);
      expect(style('chip').backgroundColor).toBe(EXPECTED[scheme].softNeutral);
      expect(style('danger').backgroundColor).toBe(EXPECTED[scheme].solidDanger);
    });
  }
});
