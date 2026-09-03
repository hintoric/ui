import type * as React from 'react';
import { CodeBlock } from './CodeBlock';

export interface DemoProps {
  children: React.ReactNode;
}

export function Demo({ children }: DemoProps) {
  return <div className="docs-demo">{children}</div>;
}

export interface CodeProps {
  children: string;
}

export function Code({ children }: CodeProps) {
  return <CodeBlock>{children}</CodeBlock>;
}
