import type { CSSProperties, ElementType, HTMLAttributes, MouseEvent } from 'react';

type MagicCardProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  gradientSize?: number;
};

export function MagicCard({ as: Component = 'div', className = '', gradientSize = 160, onMouseMove, style, ...props }: MagicCardProps) {
  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--magic-x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--magic-y', `${event.clientY - rect.top}px`);
    onMouseMove?.(event);
  };

  return (
    <Component
      className={`magic-card ${className}`.trim()}
      onMouseMove={handleMouseMove}
      style={{ '--magic-size': `${gradientSize}px`, ...style } as CSSProperties}
      {...props}
    />
  );
}
