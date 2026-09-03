export interface NavLink {
  to: string;
  label: string;
}

export interface NavGroup {
  title: string;
  links: NavLink[];
}

export const NAV: NavGroup[] = [
  {
    title: 'Getting started',
    links: [
      { to: '/', label: 'Overview' },
      { to: '/getting-started', label: 'Installation' },
    ],
  },
  {
    title: 'Layout',
    links: [
      { to: '/box', label: 'Box' },
      { to: '/stack', label: 'Stack' },
      { to: '/sheet', label: 'Sheet' },
      { to: '/card', label: 'Card' },
    ],
  },
  {
    title: 'Data display',
    links: [
      { to: '/typography', label: 'Typography' },
      { to: '/chip', label: 'Chip' },
      { to: '/avatar', label: 'Avatar' },
      { to: '/alert', label: 'Alert' },
    ],
  },
  {
    title: 'Inputs',
    links: [
      { to: '/button', label: 'Button' },
      { to: '/icon-button', label: 'IconButton' },
      { to: '/input', label: 'Input' },
      { to: '/textarea', label: 'Textarea' },
    ],
  },
  {
    title: 'Utils',
    links: [{ to: '/color-scheme-provider', label: 'ColorSchemeProvider' }],
  },
];
