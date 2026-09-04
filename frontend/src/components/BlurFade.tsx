import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

export function BlurFade({ children, className = '', delay = 0, inView = true }: {
  children: ReactNode;
  className?: string;
  delay?: number;
  inView?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!inView);

  useEffect(() => {
    if (!inView || !ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '-40px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [inView]);

  return (
    <div
      ref={ref}
      className={`blur-fade${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--blur-delay': `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}
