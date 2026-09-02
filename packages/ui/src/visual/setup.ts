import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '../styles/index.css';

afterEach(() => {
  cleanup();
});
