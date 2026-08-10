'use client';

import dynamic from 'next/dynamic';
import { normalizeBackgroundPreset } from '@/lib/event-backgrounds';

const ParticleBackground = dynamic(() => import('@/components/ParticleBackground'), { ssr: false });

export default function EventBackground({ preset }: { preset?: string | null }) {
  const selected = normalizeBackgroundPreset(preset);
  const usesParticles = !['plain', 'aurora', 'prism'].includes(selected);

  return <div className={`event-background-layer event-background-${selected}`} aria-hidden="true">
    {usesParticles && <ParticleBackground preset={selected} />}
  </div>;
}
