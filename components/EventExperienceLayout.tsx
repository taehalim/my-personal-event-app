import type { ReactNode } from 'react';

type EventExperienceLayoutProps = {
  aside: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Shared event canvas: the left column remains the event's visual context,
 * while the right column is reserved for either editing or reading details.
 */
export default function EventExperienceLayout({ aside, children, className = '' }: EventExperienceLayoutProps) {
  return <div className={`event-experience-layout ${className}`.trim()}>
    <aside className="event-experience-aside">{aside}</aside>
    <div className="event-experience-main">{children}</div>
  </div>;
}
