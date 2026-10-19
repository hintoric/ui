'use client';
import * as React from 'react';
import type { MailCardProps } from './types';

/**
 * What `MailCard` hands its blocks, so a card composed in JSX behaves like one rendered from a
 * spec. A block outside a `MailCard` reads the defaults: the locale of the `DateTimeProvider`, a
 * logo, and offers that call nothing.
 */
export interface MailCardContextValue {
  /** Already resolved against the `DateTimeProvider`; `undefined` means the runtime's default. */
  locale?: string;
  messages?: MailCardProps['messages'];
  showLogo: boolean;
  onOffer?: MailCardProps['onOffer'];
  onFeedback?: MailCardProps['onFeedback'];
}

export const MailCardContext = React.createContext<MailCardContextValue>({ showLogo: true });
