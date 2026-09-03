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

function copyWithExecCommand(text: string): void {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // navigator.clipboard can reject for reasons unrelated to browser support
    // (e.g. the document losing focus), not just when the API is missing.
    copyWithExecCommand(text);
  }
}

export function CodeBlock({ children, language = 'tsx' }: CodeBlockProps) {
  const code = React.useMemo(() => children.trim(), [children]);
  const html = React.useMemo(() => Prism.highlight(code, Prism.languages[language], language), [code, language]);
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleCopy = async () => {
    await copyToClipboard(code);
    setCopied(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="docs-code-block">
      <button type="button" className="docs-code-copy" data-copied={copied} onClick={handleCopy}>
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="docs-code">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
