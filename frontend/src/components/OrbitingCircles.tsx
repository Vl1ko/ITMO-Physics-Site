import { Children } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

type OrbitingCirclesProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
  iconSize?: number;
  speed?: number;
};

export function OrbitingCircles({
  children,
  className = '',
  reverse = false,
  duration = 20,
  delay = 0,
  radius = 160,
  path = true,
  iconSize = 16,
  speed = 1,
  ...props
}: OrbitingCirclesProps) {
  const count = Children.count(children);
  const calculatedDuration = duration / speed;

  return (
    <>
      {path && (
        <svg className="orbiting-path" viewBox="0 0 500 500" aria-hidden="true">
          <circle cx="250" cy="250" r={radius} fill="none" />
        </svg>
      )}
      {Children.map(children, (child, index) => {
        const style = {
          '--orbit-angle': (360 / count) * index,
          '--orbit-delay': `${-delay}s`,
          '--orbit-duration': `${calculatedDuration}s`,
          '--orbit-radius': `${radius}px`,
          '--orbit-size': `${iconSize}px`,
        } as CSSProperties;

        return (
          <div
            className={`orbiting-item${reverse ? ' is-reverse' : ''}${className ? ` ${className}` : ''}`}
            style={style}
            {...props}
          >
            {child}
          </div>
        );
      })}
    </>
  );
}
