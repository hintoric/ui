import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ColorSchemeProvider } from '@hintoric/ui';
import { Layout } from './Layout';
import { Home } from './pages/Home';
import { GettingStarted } from './pages/GettingStarted';
import { BoxPage } from './pages/BoxPage';
import { StackPage } from './pages/StackPage';
import { TypographyPage } from './pages/TypographyPage';
import { ChipPage } from './pages/ChipPage';
import { AvatarPage } from './pages/AvatarPage';
import { AlertPage } from './pages/AlertPage';
import { CheckboxPage } from './pages/CheckboxPage';
import { SheetPage } from './pages/SheetPage';
import { CardPage } from './pages/CardPage';
import { ButtonPage } from './pages/ButtonPage';
import { IconButtonPage } from './pages/IconButtonPage';
import { InputPage } from './pages/InputPage';
import { TextareaPage } from './pages/TextareaPage';
import { ColorSchemeProviderPage } from './pages/ColorSchemeProviderPage';

export function App() {
  return (
    <ColorSchemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/getting-started" element={<GettingStarted />} />
            <Route path="/box" element={<BoxPage />} />
            <Route path="/stack" element={<StackPage />} />
            <Route path="/typography" element={<TypographyPage />} />
            <Route path="/chip" element={<ChipPage />} />
            <Route path="/avatar" element={<AvatarPage />} />
            <Route path="/alert" element={<AlertPage />} />
            <Route path="/checkbox" element={<CheckboxPage />} />
            <Route path="/sheet" element={<SheetPage />} />
            <Route path="/card" element={<CardPage />} />
            <Route path="/button" element={<ButtonPage />} />
            <Route path="/icon-button" element={<IconButtonPage />} />
            <Route path="/input" element={<InputPage />} />
            <Route path="/textarea" element={<TextareaPage />} />
            <Route path="/color-scheme-provider" element={<ColorSchemeProviderPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ColorSchemeProvider>
  );
}
