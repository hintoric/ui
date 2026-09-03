import * as React from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

export interface CodeBlockProps {
  children: string;
  language?: 'tsx' | 'jsx' | 'typescript' | 'javascript';
}

export function CodeBlock({ children, language = 'tsx' }: CodeBlockProps) {
  const html = React.useMemo(
    () => Prism.highlight(children.trim(), Prism.languages[language], language),
    [children, language],
  );
  return (
    <pre className="docs-code">
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}
