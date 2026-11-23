import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import {
  Accordion as JoyAccordion,
  AccordionDetails as JoyAccordionDetails,
  AccordionGroup as JoyAccordionGroup,
  AccordionSummary as JoyAccordionSummary,
  Button as JoyButton,
  Card as JoyCard,
  Chip as JoyChip,
  CssVarsProvider as JoyCssVarsProvider,
  Divider as JoyDivider,
  Input as JoyInput,
  List as JoyList,
  ListItem as JoyListItem,
  ListItemButton as JoyListItemButton,
  Table as JoyTable,
} from '@mui/joy';
import { Accordion } from '../components/Accordion';
import { AccordionDetails } from '../components/AccordionDetails';
import { AccordionGroup } from '../components/AccordionGroup';
import { AccordionSummary } from '../components/AccordionSummary';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Divider } from '../components/Divider';
import { Input } from '../components/Input';
import { ListItemButton } from '../components/ListItemButton';
import { Table } from '../components/Table';
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

    // Rules stay 1px (spec: "dividers, table rules … keep today's thickness"):
    // Joy's Table sets `borderBottomWidth: 1` etc. per cell, and AccordionGroup
    // `--Accordion-borderBottom: 1px solid divider`.
    it(`keeps table and accordion rules at 1px in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const rows = (
        <>
          <thead>
            <tr>
              <th>A</th>
              <th>B</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>2</td>
            </tr>
            <tr>
              <td>3</td>
              <td>4</td>
            </tr>
          </tbody>
        </>
      );
      render(
        <JoyCssVarsProvider theme={joyTheme} defaultMode={scheme}>
          <div style={ZOOM}>
            <JoyTable data-testid="joy-table" borderAxis="both">{rows}</JoyTable>
            <JoyAccordionGroup>
              <JoyAccordion data-testid="joy-accordion">
                <JoyAccordionSummary>One</JoyAccordionSummary>
                <JoyAccordionDetails>1</JoyAccordionDetails>
              </JoyAccordion>
              <JoyAccordion>
                <JoyAccordionSummary>Two</JoyAccordionSummary>
                <JoyAccordionDetails>2</JoyAccordionDetails>
              </JoyAccordion>
            </JoyAccordionGroup>
          </div>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <div style={ZOOM}>
            <Table data-testid="ours-table" borderAxis="both">{rows}</Table>
            <AccordionGroup data-testid="ours-accordion-group">
              <Accordion>
                <AccordionSummary>One</AccordionSummary>
                <AccordionDetails>1</AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary>Two</AccordionSummary>
                <AccordionDetails>2</AccordionDetails>
              </Accordion>
            </AccordionGroup>
          </div>
        </ColorSchemeProvider>,
      );
      const cell = (id: string) => getComputedStyle(page.getByTestId(id).element().querySelector('tbody td')!);
      const accordion = (id: string) => getComputedStyle(page.getByTestId(id).element());

      for (const side of ['borderBottomWidth', 'borderLeftWidth'] as const) {
        expect(cell('joy-table')[side], `joy td ${side}`).toBe('1px');
        expect(cell('ours-table')[side], `ours td ${side}`).toBe('1px');
      }
      expect(accordion('joy-accordion').borderBottomWidth).toBe('1px');
      // Our AccordionGroup draws the rule on its direct children (the Accordion roots).
      const ourFirst = page.getByTestId('ours-accordion-group').element().firstElementChild!;
      expect(getComputedStyle(ourFirst).borderBottomWidth).toBe('1px');
    });

    // Joy's ListItemButton — under Tab, MenuItem, Option and AutocompleteOption
    // too — carries a fixed `1px solid transparent` border; only its outlined
    // variant swaps in `--variant-borderWidth`.
    it(`keeps ListItemButton's 1px transparent border except when outlined in ${scheme}`, async () => {
      await setColorScheme(scheme);
      render(
        <JoyCssVarsProvider theme={joyTheme} defaultMode={scheme}>
          <div style={ZOOM}>
            <JoyList>
              <JoyListItem>
                <JoyListItemButton data-testid="joy-plain" variant="plain">Plain</JoyListItemButton>
              </JoyListItem>
              <JoyListItem>
                <JoyListItemButton data-testid="joy-outlined" variant="outlined">Outlined</JoyListItemButton>
              </JoyListItem>
            </JoyList>
          </div>
        </JoyCssVarsProvider>,
      );
      render(
        <ColorSchemeProvider defaultMode={scheme}>
          <div style={ZOOM}>
            <ListItemButton data-testid="ours-plain" variant="plain">Plain</ListItemButton>
            <ListItemButton data-testid="ours-outlined" variant="outlined">Outlined</ListItemButton>
          </div>
        </ColorSchemeProvider>,
      );
      const width = (id: string) => getComputedStyle(page.getByTestId(id).element()).borderTopWidth;

      expect(width('joy-plain')).toBe('1px');
      expect(width('ours-plain')).toBe('1px');
      expect(width('joy-outlined')).toBe('1.5px');
      expect(width('ours-outlined')).toBe('1.5px');
    });
  }
});
