import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider, AvatarGroup as JoyAvatarGroup, Avatar as JoyAvatar } from '@mui/joy';
import { AvatarGroup as HintoricAvatarGroup } from '../components/AvatarGroup';
import { Avatar as HintoricAvatar } from '../components/Avatar';

// No color/variant axis of its own — tests its actual supported states
// (sizes), per CLAUDE.md's allowance for components without that axis.
describe('AvatarGroup visual parity with @mui/joy', () => {
  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`size=${size} overlap matches Joy UI`, async () => {
      render(
        <JoyCssVarsProvider>
          <JoyAvatarGroup data-testid={`joy-${size}`} size={size}>
            <JoyAvatar>A</JoyAvatar>
            <JoyAvatar>B</JoyAvatar>
            <JoyAvatar>C</JoyAvatar>
          </JoyAvatarGroup>
        </JoyCssVarsProvider>,
      );
      render(
        <HintoricAvatarGroup data-testid={`hintoric-${size}`} size={size}>
          <HintoricAvatar size={size}>A</HintoricAvatar>
          <HintoricAvatar size={size}>B</HintoricAvatar>
          <HintoricAvatar size={size}>C</HintoricAvatar>
        </HintoricAvatarGroup>,
      );

      const joyGroup = page.getByTestId(`joy-${size}`).element();
      const hintoricGroup = page.getByTestId(`hintoric-${size}`).element();

      const joyAvatars = joyGroup.querySelectorAll('div');
      const hintoricAvatars = hintoricGroup.children;

      const joyOverlap =
        joyAvatars[1].getBoundingClientRect().left - joyAvatars[0].getBoundingClientRect().right;
      const hintoricOverlap =
        hintoricAvatars[1].getBoundingClientRect().left - hintoricAvatars[0].getBoundingClientRect().right;

      expect(hintoricOverlap).toBeCloseTo(joyOverlap, 0);

      await expect(page.getByTestId(`joy-${size}`)).toMatchScreenshot(`avatargroup-${size}-joy`);
      await expect(page.getByTestId(`hintoric-${size}`)).toMatchScreenshot(`avatargroup-${size}-hintoric`);
    });
  }
});
