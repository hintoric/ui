import * as React from 'react';

// Confirmed against @mui/joy's TabList.js/Tab.js/TabPanel.js source (learned
// from the same trap Accordion's family fell into): `size` is the ONLY prop
// actually threaded from <Tabs> to its children via context
// (`SizeTabsContext`) — variant/color are NOT inherited; TabList, Tab, and
// TabPanel each default their own independently to plain/neutral regardless
// of what <Tabs variant/color> was given.
export const TabsSizeContext = React.createContext<'sm' | 'md' | 'lg'>('md');
