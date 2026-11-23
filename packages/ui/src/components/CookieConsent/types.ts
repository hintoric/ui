import type * as React from 'react';

export interface CookieConsentLabels {
  bannerTitle?: React.ReactNode;
  bannerText?: React.ReactNode;
  reject?: React.ReactNode;
  accept?: React.ReactNode;
  customize?: React.ReactNode;
  settingsTitle?: React.ReactNode;
  settingsText?: React.ReactNode;
  alwaysOn?: React.ReactNode;
  save?: React.ReactNode;
  acceptAll?: React.ReactNode;
  privacy?: React.ReactNode;
  /** The close button's accessible name, so a string. */
  close?: string;
}

export interface CookieConsentProps {
  labels?: CookieConsentLabels;
  /** The privacy policy, linked from the banner and the dialog. */
  privacyHref?: string;
}
