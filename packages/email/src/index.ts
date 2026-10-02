// `@hintoric/email` — a package of its own, separate from @hintoric/ui: it
// renders on a mail server, brings react-email along, and has no use for the
// web library's stylesheet or Base UI.
//
// Each component here is the email counterpart of the @hintoric/ui component
// of the same name without the `Email` prefix, compared against it in
// src/visual/*.visual.test.tsx.

export { renderEmail } from './render';
export type { RenderedEmailBody } from './render';
export {
  EMAIL_COLORS,
  EMAIL_VARIANTS,
  emailFonts,
  emailPalette,
  emailRadius,
  emailSchemes,
  mainColor,
  variantTokens,
} from './tokens';
export type { EmailColor, EmailScheme, EmailSchemeTokens, EmailVariant, EmailVariantTokens } from './tokens';
export { safeHref, safeImageSrc } from './safeUrl';

export { Layout, ColorSchemeStyles } from './components/Layout';
export type { LayoutProps } from './components/Layout';
export { Typography } from './components/Typography';
export type { TypographyLevel, TypographyProps } from './components/Typography';
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';
export { Link } from './components/Link';
export type { LinkProps } from './components/Link';
export { Divider } from './components/Divider';
export type { DividerProps } from './components/Divider';
export { Card } from './components/Card';
export type { CardProps } from './components/Card';
export { Avatar } from './components/Avatar';
export type { AvatarProps } from './components/Avatar';
export { Chip } from './components/Chip';
export type { ChipProps } from './components/Chip';
export { HintoricLogo } from './components/HintoricLogo';

export * from './templates/SecurityActivityAlert';
