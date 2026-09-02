import * as React from 'react';
import {
  Box,
  Button,
  Card,
  ColorSchemeProvider,
  IconButton,
  Input,
  Sheet,
  Stack,
  Textarea,
  Typography,
  useColorScheme,
  type JoyColor,
  type JoyVariant,
} from '@hintoric/ui';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

function ColorSchemeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <Button
      variant="outlined"
      color="neutral"
      onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
    >
      Switch to {mode === 'light' ? 'dark' : 'light'} mode
    </Button>
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
  return (
    <ColorSchemeProvider>
      <Box className="bg-canvas min-h-screen p-8">
        <Stack spacing={4}>
          <Stack direction="row" spacing={2}>
            <Typography level="h1">@hintoric/ui playground</Typography>
            <ColorSchemeToggle />
          </Stack>
          <ButtonShowcase />
          <IconButtonShowcase />
          <InputShowcase />
          <SheetAndCardShowcase />
          <TypographyShowcase />
        </Stack>
      </Box>
    </ColorSchemeProvider>
  );
}
