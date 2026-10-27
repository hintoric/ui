import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import {
  Button as JoyButton,
  Card as JoyCard,
  Chip as JoyChip,
  CssVarsProvider as JoyCssVarsProvider,
  Divider as JoyDivider,
  Input as JoyInput,
} from '@mui/joy';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Divider } from '../components/Divider';
import { Input } from '../components/Input';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, setColorScheme } from './helpers';
import { joyTheme } from './joyTheme';

/*
 * Component outlines are 1.5px. The suite's Chromium floors a fractional
 * border width to whole CSS pixels — even at an emulated device pixel ratio
 * of 2 — so everywhere else a 1.5px outline computes and screenshots as 1px,
 * indistinguishable from the old one. Under `zoom: 2` it spans three whole
 * pixels and survives, so this file renders both sides zoomed.
 *
 * It checks one cross-cutting property across a representative set of
 * outlined components; the component files carry the screenshots, so this one
 * takes none.
 */
const ZOOM = { zoom: 2 };

describe('outline width', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`draws 1.5px outlines and keeps 1px dividers in ${scheme}`, async () => {
      await setColorScheme(scheme);
      render(
        <JoyCssVarsProvider theme={joyTheme} defaultMode={scheme}>
          <div style={ZOOM}>
            <JoyButton data-testid="joy-button" variant="outlined" color="neutral">Label</JoyButton>
            <JoyInput data-testid="joy-input" placeholder="Input" />
            <JoyCard data-testid="joy-card" variant="outlined" color="primary">Card</JoyCard>
            <JoyChip data-testid="joy-chip" variant="outlined" color="danger">Chip</JoyChip>
            <JoyDivider data-testid="joy-divider" />
          </div>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <div style={ZOOM}>
            <Button data-testid="ours-button" variant="outlined" color="neutral">Label</Button>
            <Input data-testid="ours-input" placeholder="Input" />
            <Card data-testid="ours-card" variant="outlined" color="primary">Card</Card>
            <Chip data-testid="ours-chip" variant="outlined" color="danger">Chip</Chip>
            <Divider data-testid="ours-divider" />
          </div>
        </ColorSchemeProvider>,
      );
      // Our Input forwards data-testid to the <input>; its outline is on the
      // wrapper around it, which is where Joy's testid lands.
      const style = (id: string) => {
        const el = page.getByTestId(id).element();
        return getComputedStyle(id === 'ours-input' ? el.parentElement! : el);
      };

      for (const name of ['button', 'input', 'card', 'chip']) {
        expect(style(`joy-${name}`).borderTopWidth, `joy ${name}`).toBe('1.5px');
        expect(style(`ours-${name}`).borderTopWidth, `ours ${name}`).toBe('1.5px');
      }
      expect(style('joy-divider').height).toBe('1px');
      expect(style('ours-divider').height).toBe('1px');
    });
  }
});
