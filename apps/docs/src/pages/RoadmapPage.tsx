interface ComponentStatus {
  name: string;
  done: boolean;
}

interface RoadmapGroup {
  title: string;
  items: ComponentStatus[];
}

const GROUPS: RoadmapGroup[] = [
  {
    title: 'Layout & utils',
    items: [
      { name: 'Box', done: true },
      { name: 'Stack', done: true },
      { name: 'Sheet', done: true },
      { name: 'Card', done: true },
      { name: 'CardActions', done: true },
      { name: 'CardContent', done: true },
      { name: 'CardCover', done: true },
      { name: 'CardOverflow', done: true },
      { name: 'Divider', done: true },
      { name: 'AspectRatio', done: true },
      { name: 'Container', done: true },
      { name: 'Grid', done: true },
      { name: 'ColorSchemeProvider', done: true },
    ],
  },
  {
    title: 'Inputs',
    items: [
      { name: 'Button', done: true },
      { name: 'IconButton', done: true },
      { name: 'ButtonGroup', done: true },
      { name: 'ToggleButtonGroup', done: true },
      { name: 'Input', done: true },
      { name: 'Textarea', done: true },
      { name: 'Checkbox', done: true },
      { name: 'Radio', done: true },
      { name: 'RadioGroup', done: true },
      { name: 'Switch', done: true },
      { name: 'Select', done: false },
      { name: 'Option', done: false },
      { name: 'Slider', done: false },
      { name: 'Autocomplete', done: false },
    ],
  },
  {
    title: 'Data display',
    items: [
      { name: 'Typography', done: true },
      { name: 'Avatar', done: true },
      { name: 'AvatarGroup', done: true },
      { name: 'Badge', done: true },
      { name: 'Chip', done: true },
      { name: 'ChipDelete', done: true },
      { name: 'List', done: true },
      { name: 'ListItem', done: true },
      { name: 'ListItemButton', done: true },
      { name: 'ListItemContent', done: true },
      { name: 'ListItemDecorator', done: true },
      { name: 'ListDivider', done: true },
      { name: 'ListSubheader', done: true },
      { name: 'Table', done: false },
      { name: 'Tooltip', done: true },
    ],
  },
  {
    title: 'Feedback',
    items: [
      { name: 'Alert', done: true },
      { name: 'CircularProgress', done: true },
      { name: 'LinearProgress', done: true },
      { name: 'Skeleton', done: true },
      { name: 'Snackbar', done: false },
    ],
  },
  {
    title: 'Surfaces',
    items: [
      { name: 'Accordion', done: false },
      { name: 'Modal / Dialog', done: false },
      { name: 'Drawer', done: false },
    ],
  },
  {
    title: 'Navigation',
    items: [
      { name: 'Breadcrumbs', done: true },
      { name: 'Menu', done: false },
      { name: 'Tabs', done: false },
      { name: 'Stepper', done: false },
      { name: 'Link', done: true },
    ],
  },
  {
    title: 'Forms',
    items: [
      { name: 'FormControl', done: true },
      { name: 'FormLabel', done: true },
      { name: 'FormHelperText', done: true },
    ],
  },
];

const TOTAL = GROUPS.reduce((sum, group) => sum + group.items.length, 0);
const DONE = GROUPS.reduce((sum, group) => sum + group.items.filter((item) => item.done).length, 0);

export function RoadmapPage() {
  return (
    <>
      <h1>Roadmap</h1>
      <p className="docs-lede">
        Progress toward full Joy UI parity — {DONE} of {TOTAL} components implemented.
      </p>

      <div className="roadmap-groups">
        {GROUPS.map((group) => (
          <div className="roadmap-group" key={group.title}>
            <h2>{group.title}</h2>
            <ul className="roadmap-list">
              {group.items.map((item) => (
                <li key={item.name} className={item.done ? 'roadmap-done' : 'roadmap-pending'}>
                  <span className="roadmap-marker" aria-hidden="true">
                    {item.done ? '✓' : '—'}
                  </span>
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
