import { useEffect, useRef } from 'react';
import renderMathInElement from 'katex/contrib/auto-render';

interface LatexProps {
  content: string;
  className?: string;
}

export function Latex({ content, className }: LatexProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.textContent = content;
    renderMathInElement(ref.current, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
      throwOnError: false,
    });
  }, [content]);

  return <div ref={ref} className={className ? `latex ${className}` : 'latex'} />;
}
