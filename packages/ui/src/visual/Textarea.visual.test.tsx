import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CssVarsProvider as JoyCssVarsProvider, Textarea as JoyTextarea } from '@mui/joy';
import { Textarea as HintoricTextarea } from '../components/Textarea';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';
import { COLOR_SCHEMES, lastShadowLayer, setColorScheme } from './helpers';
import { describeErrorParity } from './errorParity';

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

// Joy UI's Textarea has a root-wrapper + native-<textarea> split (like
// Input); ours is a single native <textarea> with no wrapper. Each side's
// "visible box" is therefore a different element: Joy's wrapper vs our bare
// textarea — that's the correct, fair comparison target for each.
describe('Textarea visual parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        it(`${variant}/${color} matches Joy UI's computed styles in ${scheme}`, async () => {
          await setColorScheme(scheme);

          const { container: joyContainer } = render(
            <div data-testid={`joy-${variant}-${color}`} style={{ width: 400 }}>
              <JoyCssVarsProvider defaultMode={scheme}>
                <JoyTextarea variant={variant} color={color} placeholder={color} />
              </JoyCssVarsProvider>
            </div>,
          );
          const { container: hintoricContainer } = render(
            <div data-testid={`hintoric-${variant}-${color}`} style={{ width: 400 }}>
              <ColorSchemeProvider defaultMode={scheme}>
                <HintoricTextarea
                  variant={variant}
                  color={color}
                  placeholder={color}
                  aria-label={`${variant}-${color}`}
                />
              </ColorSchemeProvider>
            </div>,
          );

          const joyWrapper = joyContainer.querySelector('textarea')!.parentElement as HTMLElement;
          const hintoricTextarea = hintoricContainer.querySelector('textarea') as HTMLElement;

          const joyStyle = getComputedStyle(joyWrapper);
          const hintoricStyle = getComputedStyle(hintoricTextarea);

          expect(hintoricStyle.backgroundColor).toBe(joyStyle.backgroundColor);
          expect(hintoricStyle.borderColor).toBe(joyStyle.borderColor);
          expect(hintoricStyle.borderWidth).toBe(joyStyle.borderWidth);
          expect(hintoricStyle.borderRadius).toBe(joyStyle.borderRadius);
          expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
          expect(hintoricStyle.fontWeight).toBe(joyStyle.fontWeight);
          expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);
          expect(lastShadowLayer(hintoricStyle.boxShadow)).toBe(lastShadowLayer(joyStyle.boxShadow));
          expect(hintoricStyle.resize).toBe(joyStyle.resize);
          expect(hintoricStyle.cursor).toBe(joyStyle.cursor);
          // Inside the 400px parent: Joy's wrapper is `display: flex` and fills
          // it (P1 of the 2026-09-06 audit — our bare textarea used to shrink
          // to its 210px intrinsic width).
          expect(hintoricStyle.display).toBe(joyStyle.display);
          expect(hintoricStyle.width).toBe(joyStyle.width);
          // One row by default, like Joy's minRows={1} — ours used to render
          // the native rows={2}, ~63px against Joy's 36px, and nothing
          // compared the height.
          expect(hintoricStyle.height).toBe(joyStyle.height);
          expect(hintoricStyle.paddingTop).toBe(joyStyle.paddingTop);
          expect(hintoricStyle.paddingBottom).toBe(joyStyle.paddingBottom);

          await expect(page.getByTestId(`joy-${variant}-${color}`)).toMatchScreenshot(
            `textarea-${variant}-${color}-joy-${scheme}`,
          );
          await expect(page.getByTestId(`hintoric-${variant}-${color}`)).toMatchScreenshot(
            `textarea-${variant}-${color}-hintoric-${scheme}`,
          );
        });
      }
    }
  }
});

const SIZES = ['sm', 'md', 'lg'] as const;
const LONG = 'The quick brown fox jumps over the lazy dog. '.repeat(4).trim();

// Joy's Textarea grows with its content (@mui/base's TextareaAutosize) between
// minRows (default 1) and maxRows; ours ports that. Height depends on the
// size's line-height and padding, so every case runs per size.
const AUTOSIZE_CASES = [
  { slug: 'empty', props: {} },
  { slug: 'lines', props: { defaultValue: 'one\ntwo\nthree' } },
  { slug: 'wrapped', props: { defaultValue: LONG } },
  { slug: 'min-rows', props: { minRows: 3 } },
  { slug: 'max-rows', props: { maxRows: 2, defaultValue: 'one\ntwo\nthree\nfour' } },
] as const;

describe('Textarea autosize parity with @mui/joy', () => {
  for (const scheme of COLOR_SCHEMES) {
    for (const size of SIZES) {
      for (const { slug, props } of AUTOSIZE_CASES) {
        it(`${size}/${slug} matches Joy UI's height in ${scheme}`, async () => {
          await setColorScheme(scheme);
          const { container: joyContainer } = render(
            <div data-testid={`joy-${size}-${slug}`} style={{ width: 300 }}>
              <JoyCssVarsProvider defaultMode={scheme}>
                <JoyTextarea size={size} placeholder="Message" {...props} />
              </JoyCssVarsProvider>
            </div>,
          );
          const { container: hintoricContainer } = render(
            <div data-testid={`hintoric-${size}-${slug}`} style={{ width: 300 }}>
              <ColorSchemeProvider defaultMode={scheme}>
                <HintoricTextarea size={size} placeholder="Message" aria-label={slug} {...props} />
              </ColorSchemeProvider>
            </div>,
          );

          const joyTextarea = joyContainer.querySelector('textarea')!;
          const hintoricTextarea = hintoricContainer.querySelector('textarea')!;
          const joyStyle = getComputedStyle(joyTextarea.parentElement!);
          const hintoricStyle = getComputedStyle(hintoricTextarea);

          expect(hintoricStyle.height).toBe(joyStyle.height);
          expect(hintoricStyle.paddingTop).toBe(joyStyle.paddingTop);
          expect(hintoricStyle.paddingBottom).toBe(joyStyle.paddingBottom);
          expect(hintoricStyle.lineHeight).toBe(joyStyle.lineHeight);
          expect(hintoricStyle.fontSize).toBe(joyStyle.fontSize);
          // Scrollable only once maxRows clips the content (or minRows leaves
          // it shorter than the box) — on Joy's inner <textarea>.
          expect(hintoricTextarea.style.overflow).toBe(joyTextarea.style.overflow);

          await expect(page.getByTestId(`joy-${size}-${slug}`)).toMatchScreenshot(
            `textarea-autosize-${size}-${slug}-joy-${scheme}`,
          );
          await expect(page.getByTestId(`hintoric-${size}-${slug}`)).toMatchScreenshot(
            `textarea-autosize-${size}-${slug}-hintoric-${scheme}`,
          );
        });
      }
    }

    // Uncontrolled typing never re-renders, so this is the path that only the
    // onChange measurement covers.
    it(`grows while typing like Joy UI in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { container: joyContainer } = render(
        <div style={{ width: 300 }}>
          <JoyCssVarsProvider defaultMode={scheme}>
            <JoyTextarea maxRows={3} />
          </JoyCssVarsProvider>
        </div>,
      );
      const { container: hintoricContainer } = render(
        <div style={{ width: 300 }}>
          <ColorSchemeProvider defaultMode={scheme}>
            <HintoricTextarea maxRows={3} aria-label="typing" />
          </ColorSchemeProvider>
        </div>,
      );
      const joyTextarea = joyContainer.querySelector('textarea')!;
      const hintoricTextarea = hintoricContainer.querySelector('textarea')!;
      const user = userEvent.setup();

      const heights = async (text: string) => {
        await user.type(joyTextarea, text);
        await user.type(hintoricTextarea, text);
        return [
          getComputedStyle(hintoricTextarea).height,
          getComputedStyle(joyTextarea.parentElement!).height,
        ];
      };
      const [oneRow] = await heights('a');
      const [hintoricTwo, joyTwo] = await heights('{Enter}b');
      expect(hintoricTwo).toBe(joyTwo);
      expect(hintoricTwo).not.toBe(oneRow);
      const [hintoricCapped, joyCapped] = await heights('{Enter}c{Enter}d{Enter}e');
      expect(hintoricCapped).toBe(joyCapped);
      expect(hintoricTextarea.style.overflow).toBe(joyTextarea.style.overflow);
      const [hintoricCleared, joyCleared] = await (async () => {
        await user.clear(joyTextarea);
        await user.clear(hintoricTextarea);
        return [
          getComputedStyle(hintoricTextarea).height,
          getComputedStyle(joyTextarea.parentElement!).height,
        ];
      })();
      expect(hintoricCleared).toBe(joyCleared);
      expect(hintoricCleared).toBe(oneRow);
    });
  }
});

describeErrorParity({
  slug: 'textarea',
  variants: VARIANTS,
  colors: COLORS,
  renderJoy: ({ variant, color }) => (
    <JoyTextarea error variant={variant} color={color} placeholder={color} />
  ),
  renderHintoric: ({ variant, color }) => (
    <HintoricTextarea error variant={variant} color={color} placeholder={color} />
  ),
  // Joy wraps its control in a styled root; ours is the bare <textarea>. Each
  // side's visible box is therefore a different element — see the note at the
  // top of this file.
  joyElement: (container) => container.querySelector('textarea')!.parentElement as HTMLElement,
  element: (container) => container.querySelector('textarea') as HTMLElement,
  assertStyles: (hintoric, joy) => {
    expect(hintoric.minHeight).toBe(joy.minHeight);
    expect(hintoric.height).toBe(joy.height);
  },
});
