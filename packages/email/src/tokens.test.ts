import { describe, expect, it } from 'vitest';
import { emailOutlineWidth, emailPalette, emailPalettes, emailRadius, emailSchemes, mainColor, variantTokens } from './tokens';

/*
 * The email copy of @hintoric/ui's palette.ts: KLM-inspired stops in light,
 * Joy's own in dark (docs/superpowers/specs/2026-10-27-klm-inspired-look-design.md).
 * The parity suite compares rendered emails against the web components; this
 * pins the one thing a light-mode render cannot show — that a dark-mode mail
 * client gets today's dark colours, with no warm light stop leaking through.
 */
describe('email tokens', () => {
  it('keeps dark on Joy’s palette', () => {
    expect(emailPalettes.dark.neutral[800]).toBe('#171A1C');
    expect(variantTokens('dark', 'soft', 'neutral')).toEqual({ color: '#DDE7EE', backgroundColor: '#171A1C' });
    expect(variantTokens('dark', 'outlined', 'danger')).toEqual({ color: '#F7C5C5', borderColor: '#7D1212' });
    expect(mainColor('dark', 'danger')).toBe('#E47474');
    expect(emailSchemes.dark.surface).toBe('#0B0D0E');
  });

  it('uses the KLM-inspired stops in light, neutral fills one stop darker', () => {
    expect(emailPalette).toBe(emailPalettes.light);
    expect(emailPalettes.light.neutral[100]).toBe('#F5F1ED');
    expect(variantTokens('light', 'soft', 'neutral')).toEqual({ color: '#393735', backgroundColor: '#EBE2DB' });
    expect(variantTokens('light', 'soft', 'success')).toEqual({ color: '#0F433A', backgroundColor: '#B7F1BA' });
    expect(mainColor('light', 'danger')).toBe('#B50200');
    expect(emailSchemes.light.surface).toBe('#FFFFFF');
    expect(emailSchemes.light.surface1).toBe('#EBE2DB');
    expect(emailSchemes.light.divider).toBe('rgba(110, 105, 102, 0.2)');
    expect(emailSchemes.light.dividerFallback).toBe('#E2E1E0');
  });

  it('has the new shape', () => {
    expect(emailRadius).toEqual({ xs: '4px', sm: '12px', md: '16px', lg: '24px', xl: '32px' });
    expect(emailOutlineWidth).toBe('1.5px');
  });
});
