import { useEffect, useRef } from 'react';

/**
 * A rendered mail in an iframe, written with document.write rather than
 * `srcDoc`: a srcdoc document is always in no-quirks mode, while the mail's
 * own doctype puts it in limited-quirks mode — the layout readers get.
 * `allow-same-origin` and nothing else: the page can write into the frame,
 * scripts in it stay blocked.
 */
export function EmailPreview({ html, title, height = 720 }: { html: string; title: string; height?: number }) {
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [html]);
  return <iframe ref={frame} title={title} sandbox="allow-same-origin" style={{ width: '100%', height, border: 0, display: 'block' }} />;
}
