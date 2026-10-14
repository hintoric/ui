import { Img } from 'react-email';
import { emailClass } from '../styles';

/*
 * The hintoric wordmark as hosted PNGs: 2968 × 652, twice the web logo's
 * 1484 × 326 viewBox, shown at 118 × 26 — the height core's auth screen gives
 * it, and the PNG stays sharp on HiDPI screens. The ratio has to follow the
 * artwork: when the PNGs changed under a fixed 104 × 32, every client squeezed
 * the wordmark. PNG rather than SVG, which Gmail and desktop Outlook don't
 * display; linked rather than attached, so messages stay small. A client that
 * blocks remote images until asked shows the alt text.
 */
const LOGO = {
  light: 'https://cdn.hintoric.com/assets/logo/black.png',
  dark: 'https://cdn.hintoric.com/assets/logo/white.png',
  width: 118,
  height: 26,
};

/**
 * The email counterpart of the web HintoricLogo: the black wordmark, swapped
 * for the white one where the client applies the dark stylesheet.
 */
export function HintoricLogo() {
  return (
    <>
      <Img
        src={LOGO.light}
        width={LOGO.width}
        height={LOGO.height}
        alt="hintoric"
        className={emailClass.logoLight}
        style={{ display: 'inline-block', width: `${LOGO.width}px`, height: `${LOGO.height}px`, margin: '0 auto' }}
      />
      <Img
        src={LOGO.dark}
        width={LOGO.width}
        height={LOGO.height}
        alt="hintoric"
        className={emailClass.logoDark}
        style={{ display: 'none', width: `${LOGO.width}px`, height: `${LOGO.height}px`, margin: '0 auto' }}
      />
    </>
  );
}
