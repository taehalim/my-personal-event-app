import type { ReactNode } from 'react';

type EventCanvasFrameProps = {
  header: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * The shared spatial frame for the editor and the public event page.
 * Keeping the back affordance and the two-column canvas in one component
 * prevents the two views from drifting vertically or horizontally.
 */
export default function EventCanvasFrame({ header, children, className = '' }: EventCanvasFrameProps) {
  return <section className={`event-canvas-frame ${className}`.trim()}>
    <header className="event-canvas-frame-header">{header}</header>
    <div className="event-canvas-frame-body">{children}</div>
  </section>;
}
