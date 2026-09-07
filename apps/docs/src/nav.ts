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
      { to: '/roadmap', label: 'Roadmap' },
    ],
  },
  {
    title: 'Layout',
    links: [
      { to: '/box', label: 'Box' },
      { to: '/stack', label: 'Stack' },
      { to: '/sheet', label: 'Sheet' },
      { to: '/card', label: 'Card' },
      { to: '/container', label: 'Container' },
      { to: '/grid', label: 'Grid' },
      { to: '/aspect-ratio', label: 'AspectRatio' },
      { to: '/divider', label: 'Divider' },
    ],
  },
  {
    title: 'Inputs',
    links: [
      { to: '/button', label: 'Button' },
      { to: '/button-group', label: 'ButtonGroup' },
      { to: '/icon-button', label: 'IconButton' },
      { to: '/input', label: 'Input' },
      { to: '/textarea', label: 'Textarea' },
      { to: '/checkbox', label: 'Checkbox' },
      { to: '/radio', label: 'Radio' },
      { to: '/switch', label: 'Switch' },
      { to: '/select', label: 'Select' },
      { to: '/autocomplete', label: 'Autocomplete' },
      { to: '/slider', label: 'Slider' },
      { to: '/toggle-button-group', label: 'ToggleButtonGroup' },
      { to: '/form-control', label: 'FormControl' },
    ],
  },
  {
    title: 'Data display',
    links: [
      { to: '/typography', label: 'Typography' },
      { to: '/list', label: 'List' },
      { to: '/table', label: 'Table' },
      { to: '/data-grid', label: 'DataGrid' },
      { to: '/chip', label: 'Chip' },
      { to: '/avatar', label: 'Avatar' },
      { to: '/badge', label: 'Badge' },
      { to: '/skeleton', label: 'Skeleton' },
      { to: '/relative-time', label: 'RelativeTime' },
    ],
  },
  {
    title: 'Feedback',
    links: [
      { to: '/alert', label: 'Alert' },
      { to: '/circular-progress', label: 'CircularProgress' },
      { to: '/linear-progress', label: 'LinearProgress' },
      { to: '/snackbar', label: 'Snackbar' },
      { to: '/modal', label: 'Modal' },
      { to: '/drawer', label: 'Drawer' },
      { to: '/tooltip', label: 'Tooltip' },
    ],
  },
  {
    title: 'Navigation',
    links: [
      { to: '/link', label: 'Link' },
      { to: '/breadcrumbs', label: 'Breadcrumbs' },
      { to: '/tabs', label: 'Tabs' },
      { to: '/menu', label: 'Menu' },
      { to: '/stepper', label: 'Stepper' },
      { to: '/accordion', label: 'Accordion' },
    ],
  },
  {
    // Composed, opinionated pieces rather than primitives: a Block solves a
    // whole job (pick a language) out of several components, where everything
    // above is one part you assemble yourself.
    title: 'Blocks',
    links: [
      { to: '/confirmation-dialog', label: 'ConfirmationDialog' },
      { to: '/locale-switcher', label: 'LocaleSwitcher' },
    ],
  },
  {
    title: 'Utils',
    links: [
      { to: '/color-scheme-provider', label: 'ColorSchemeProvider' },
      { to: '/locale-provider', label: 'LocaleProvider' },
    ],
  },
];
