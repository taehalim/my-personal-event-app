'use client';

import dynamic from 'next/dynamic';
import { normalizeBackgroundPreset } from '@/lib/event-backgrounds';

const ParticleBackground = dynamic(() => import('@/components/ParticleBackground'), { ssr: false });

export default function EventBackground({ preset, fullViewport = false }: { preset?: string | null; fullViewport?: boolean }) {
  const selected = normalizeBackgroundPreset(preset);
  const usesParticles = !['plain', 'aurora', 'prism'].includes(selected);

  return <div className={`event-background-layer event-background-${selected}${fullViewport ? ' event-background-full-viewport' : ''}`} aria-hidden="true">
    {usesParticles && <ParticleBackground preset={selected} />}
  </div>;
}
