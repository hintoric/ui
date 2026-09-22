import * as React from 'react';
import type { FloatingBarSize } from './types';

export const FloatingBarContext = React.createContext<{ size: FloatingBarSize }>({ size: 'md' });
