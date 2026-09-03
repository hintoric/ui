import * as React from 'react';

// Confirmed against @mui/joy's Step.js source: `orientation` is NOT
// threaded from <Stepper> to its <Step> children via context — each Step
// defaults its own `orientation` independently to 'horizontal', matching
// the same "no inheritance" pattern found in Accordion and Tabs. Only
// `size` genuinely cascades in real Joy (there, via CSS custom properties
// set on the Stepper root and inherited by descendants; here, via this
// context, to the same visible effect).
export const StepperContext = React.createContext<'sm' | 'md' | 'lg'>('md');
