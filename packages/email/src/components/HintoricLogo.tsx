import { Img } from 'react-email';
import { emailClass } from '../styles';

/*
 * The hintoric wordmark as hosted PNGs (1336 × 410 artwork, shown at 104 × 32
 * so it stays sharp on HiDPI screens). PNG rather than SVG, which Gmail and
 * desktop Outlook don't display; linked rather than attached, so messages stay
 * small. A client that blocks remote images until asked shows the alt text.
 */
const LOGO = {
  light: 'https://cdn.hintoric.com/assets/logo/black.png',
  dark: 'https://cdn.hintoric.com/assets/logo/white.png',
  width: 104,
  height: 32,
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
        style={{ display: 'inline-block', margin: '0 auto' }}
      />
      <Img
        src={LOGO.dark}
        width={LOGO.width}
        height={LOGO.height}
        alt="hintoric"
        className={emailClass.logoDark}
        style={{ display: 'none', margin: '0 auto' }}
      />
    </>
  );
}
