import * as React from 'react';
import {
  Box,
  Button,
  Card,
  ColorSchemeMenu,
  ColorSchemeProvider,
  ColorSchemeSwitch,
  ColorSchemeToggle,
  DialogContent,
  DialogTitle,
  IconButton,
  Input,
  LocaleProvider,
  LocaleSwitcher,
  Modal,
  ModalDialog,
  ReducedMotionProvider,
  RelativeTime,
  Sheet,
  Stack,
  Switch,
  Textarea,
  Typography,
  type JoyColor,
  type JoyVariant,
} from '@hintoric/ui';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const LOCALES = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'English' },
];

// Module scope, not a useMemo: reading the clock during render is impure, and
// this only has to be a fixed point in the past for the demo.
const THREE_DAYS_AGO = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.02-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.28 7.28 0 0 0-1.69-.98L14.5 2.42A.49.49 0 0 0 14.01 2h-4a.49.49 0 0 0-.49.42L9.15 5.07c-.61.24-1.18.56-1.69.98l-2.49-1a.5.5 0 0 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.08.65-.08.98s.03.66.08.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.13.22.39.31.61.22l2.49-1c.51.4 1.08.73 1.69.98l.37 2.65c.04.24.25.42.49.42h4c.24 0 .45-.18.49-.42l.37-2.65c.61-.25 1.18-.58 1.69-.98l2.49 1c.22.08.48 0 .61-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65ZM12.01 15.5A3.5 3.5 0 1 1 12.01 8a3.5 3.5 0 0 1 0 7.5Z" />
    </svg>
  );
}

function LocaleDemo() {
  const [locale, setLocale] = React.useState('de');
  return (
    <LocaleProvider locale={locale} onLocaleChange={setLocale} locales={LOCALES}>
      <Stack direction="row" spacing={2}>
        <LocaleSwitcher aria-label="Sprache wählen" />
        <Typography level="body-sm">
          gewählt: {locale} · <RelativeTime date={THREE_DAYS_AGO} />
        </Typography>
      </Stack>
    </LocaleProvider>
  );
}

function ButtonShowcase() {
  return (
    <Stack spacing={2}>
      <Typography level="h3">Button</Typography>
      {VARIANTS.map((variant) => (
        <Stack key={variant} direction="row" spacing={1}>
          {COLORS.map((color) => (
            <Button key={color} variant={variant} color={color}>
              {variant} / {color}
            </Button>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}

function IconButtonShowcase() {
  return (
    <Stack spacing={2}>
      <Typography level="h3">IconButton</Typography>
      <Stack direction="row" spacing={1}>
        {VARIANTS.map((variant) => (
          <IconButton key={variant} variant={variant} color="primary" aria-label={variant}>
            +
          </IconButton>
        ))}
      </Stack>
    </Stack>
  );
}

function InputShowcase() {
  const [value, setValue] = React.useState('');
  return (
    <Stack spacing={2}>
      <Typography level="h3">Input &amp; Textarea</Typography>
      <Stack direction="row" spacing={1}>
        {VARIANTS.map((variant) => (
          <Input key={variant} variant={variant} placeholder={variant} />
        ))}
      </Stack>
      <Input
        aria-label="controlled"
        placeholder="controlled input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <Typography level="body-sm">Current value: {value || '(empty)'}</Typography>
      <Textarea placeholder="Textarea" />
    </Stack>
  );
}

function SheetAndCardShowcase() {
  return (
    <Stack spacing={2}>
      <Typography level="h3">Sheet &amp; Card</Typography>
      <Stack direction="row" spacing={1}>
        {VARIANTS.map((variant) => (
          <Sheet key={variant} variant={variant} color="neutral">
            <Box className="p-4">Sheet ({variant})</Box>
          </Sheet>
        ))}
      </Stack>
      <Card>
        <Typography level="title-md">Card title</Typography>
        <Typography level="body-sm">Card body text goes here.</Typography>
      </Card>
    </Stack>
  );
}

function TypographyShowcase() {
  const levels = [
    'h1', 'h2', 'h3', 'h4', 'title-lg', 'title-md', 'title-sm', 'body-lg', 'body-md', 'body-sm', 'body-xs',
  ] as const;
  return (
    <Stack spacing={1}>
      <Typography level="h3">Typography</Typography>
      {levels.map((level) => (
        <Typography key={level} level={level}>
          {level}: The quick brown fox jumps over the lazy dog.
        </Typography>
      ))}
    </Stack>
  );
}

export function App() {
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  return (
    <ColorSchemeProvider>
      <ReducedMotionProvider reducedMotion={reducedMotion}>
        <Box className="bg-canvas min-h-screen p-8">
          <Stack spacing={4}>
            <Stack direction="row" spacing={2}>
              <Typography level="h1">@hintoric/ui playground</Typography>
              <ColorSchemeMenu />
              <ColorSchemeToggle />
              <ColorSchemeSwitch />
              <IconButton
                aria-label="Settings"
                title="Settings"
                size="sm"
                variant="plain"
                color="neutral"
                onClick={() => setSettingsOpen(true)}
              >
                <SettingsIcon className="size-5" />
              </IconButton>
              <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)}>
                <ModalDialog size="sm">
                  <DialogTitle>Settings</DialogTitle>
                  <DialogContent>
                    <Stack direction="row" spacing={2} className="items-center justify-between">
                      <Box>
                        <Typography level="title-sm">Reduced motion</Typography>
                        <Typography level="body-sm" className="text-ink-tertiary">
                          Disable decorative animations in the playground.
                        </Typography>
                      </Box>
                      <Switch
                        aria-label="Reduced motion"
                        checked={reducedMotion}
                        onCheckedChange={setReducedMotion}
                      />
                    </Stack>
                  </DialogContent>
                </ModalDialog>
              </Modal>
              <LocaleDemo />
            </Stack>
            <ButtonShowcase />
            <IconButtonShowcase />
            <InputShowcase />
            <SheetAndCardShowcase />
            <TypographyShowcase />
          </Stack>
        </Box>
      </ReducedMotionProvider>
    </ColorSchemeProvider>
  );
}
