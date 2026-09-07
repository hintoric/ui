import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ColorSchemeProvider } from '@hintoric/ui';
import { Layout } from './Layout';
import { ScrollToTop } from './ScrollToTop';
import { Home } from './pages/Home';
import { GettingStarted } from './pages/GettingStarted';
import { RoadmapPage } from './pages/RoadmapPage';
import { BoxPage } from './pages/BoxPage';
import { StackPage } from './pages/StackPage';
import { SheetPage } from './pages/SheetPage';
import { CardPage } from './pages/CardPage';
import { ContainerPage } from './pages/ContainerPage';
import { GridPage } from './pages/GridPage';
import { AspectRatioPage } from './pages/AspectRatioPage';
import { DividerPage } from './pages/DividerPage';
import { ButtonPage } from './pages/ButtonPage';
import { ButtonGroupPage } from './pages/ButtonGroupPage';
import { IconButtonPage } from './pages/IconButtonPage';
import { InputPage } from './pages/InputPage';
import { TextareaPage } from './pages/TextareaPage';
import { CheckboxPage } from './pages/CheckboxPage';
import { RadioPage } from './pages/RadioPage';
import { SwitchPage } from './pages/SwitchPage';
import { SelectPage } from './pages/SelectPage';
import { AutocompletePage } from './pages/AutocompletePage';
import { SliderPage } from './pages/SliderPage';
import { ToggleButtonGroupPage } from './pages/ToggleButtonGroupPage';
import { FormControlPage } from './pages/FormControlPage';
import { TypographyPage } from './pages/TypographyPage';
import { ListPage } from './pages/ListPage';
import { TablePage } from './pages/TablePage';
import { DataGridPage } from './pages/DataGridPage';
import { ChipPage } from './pages/ChipPage';
import { AvatarPage } from './pages/AvatarPage';
import { BadgePage } from './pages/BadgePage';
import { SkeletonPage } from './pages/SkeletonPage';
import { RelativeTimePage } from './pages/RelativeTimePage';
import { AlertPage } from './pages/AlertPage';
import { CircularProgressPage } from './pages/CircularProgressPage';
import { LinearProgressPage } from './pages/LinearProgressPage';
import { SnackbarPage } from './pages/SnackbarPage';
import { ModalPage } from './pages/ModalPage';
import { DrawerPage } from './pages/DrawerPage';
import { TooltipPage } from './pages/TooltipPage';
import { LinkPage } from './pages/LinkPage';
import { BreadcrumbsPage } from './pages/BreadcrumbsPage';
import { TabsPage } from './pages/TabsPage';
import { MenuPage } from './pages/MenuPage';
import { StepperPage } from './pages/StepperPage';
import { AccordionPage } from './pages/AccordionPage';
import { ColorSchemeProviderPage } from './pages/ColorSchemeProviderPage';
import { ColorSchemeMenuPage } from './pages/ColorSchemeMenuPage';
import { ColorSchemeTogglePage } from './pages/ColorSchemeTogglePage';
import { ColorSchemeToggleGroupPage } from './pages/ColorSchemeToggleGroupPage';
import { ColorSchemeSwitchPage } from './pages/ColorSchemeSwitchPage';
import { ColorSchemeSelectPage } from './pages/ColorSchemeSelectPage';
import { LocaleProviderPage } from './pages/LocaleProviderPage';
import { ConfirmationDialogPage } from './pages/ConfirmationDialogPage';
import { FormsPage } from './pages/FormsPage';
import { LocaleSwitcherPage } from './pages/LocaleSwitcherPage';

export function App() {
  return (
    <ColorSchemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/getting-started" element={<GettingStarted />} />
            <Route path="/roadmap" element={<RoadmapPage />} />

            <Route path="/box" element={<BoxPage />} />
            <Route path="/stack" element={<StackPage />} />
            <Route path="/sheet" element={<SheetPage />} />
            <Route path="/card" element={<CardPage />} />
            <Route path="/container" element={<ContainerPage />} />
            <Route path="/grid" element={<GridPage />} />
            <Route path="/aspect-ratio" element={<AspectRatioPage />} />
            <Route path="/divider" element={<DividerPage />} />

            <Route path="/button" element={<ButtonPage />} />
            <Route path="/button-group" element={<ButtonGroupPage />} />
            <Route path="/icon-button" element={<IconButtonPage />} />
            <Route path="/input" element={<InputPage />} />
            <Route path="/textarea" element={<TextareaPage />} />
            <Route path="/checkbox" element={<CheckboxPage />} />
            <Route path="/radio" element={<RadioPage />} />
            <Route path="/switch" element={<SwitchPage />} />
            <Route path="/select" element={<SelectPage />} />
            <Route path="/autocomplete" element={<AutocompletePage />} />
            <Route path="/slider" element={<SliderPage />} />
            <Route path="/toggle-button-group" element={<ToggleButtonGroupPage />} />
            <Route path="/form-control" element={<FormControlPage />} />

            <Route path="/typography" element={<TypographyPage />} />
            <Route path="/list" element={<ListPage />} />
            <Route path="/table" element={<TablePage />} />
            <Route path="/data-grid" element={<DataGridPage />} />
            <Route path="/chip" element={<ChipPage />} />
            <Route path="/avatar" element={<AvatarPage />} />
            <Route path="/badge" element={<BadgePage />} />
            <Route path="/skeleton" element={<SkeletonPage />} />
            <Route path="/relative-time" element={<RelativeTimePage />} />

            <Route path="/alert" element={<AlertPage />} />
            <Route path="/circular-progress" element={<CircularProgressPage />} />
            <Route path="/linear-progress" element={<LinearProgressPage />} />
            <Route path="/snackbar" element={<SnackbarPage />} />
            <Route path="/modal" element={<ModalPage />} />
            <Route path="/drawer" element={<DrawerPage />} />
            <Route path="/tooltip" element={<TooltipPage />} />

            <Route path="/link" element={<LinkPage />} />
            <Route path="/breadcrumbs" element={<BreadcrumbsPage />} />
            <Route path="/tabs" element={<TabsPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/stepper" element={<StepperPage />} />
            <Route path="/accordion" element={<AccordionPage />} />

            <Route path="/color-scheme-provider" element={<ColorSchemeProviderPage />} />
            <Route path="/color-scheme-menu" element={<ColorSchemeMenuPage />} />
            <Route path="/color-scheme-toggle" element={<ColorSchemeTogglePage />} />
            <Route path="/color-scheme-toggle-group" element={<ColorSchemeToggleGroupPage />} />
            <Route path="/color-scheme-switch" element={<ColorSchemeSwitchPage />} />
            <Route path="/color-scheme-select" element={<ColorSchemeSelectPage />} />
            <Route path="/locale-provider" element={<LocaleProviderPage />} />
            <Route path="/confirmation-dialog" element={<ConfirmationDialogPage />} />
            <Route path="/forms" element={<FormsPage />} />
            <Route path="/locale-switcher" element={<LocaleSwitcherPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ColorSchemeProvider>
  );
}
