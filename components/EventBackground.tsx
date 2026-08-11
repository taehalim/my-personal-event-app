'use client';

import dynamic from 'next/dynamic';
import { normalizeBackgroundPreset } from '@/lib/event-backgrounds';

const ParticleBackground = dynamic(() => import('@/components/ParticleBackground'), { ssr: false });
const ReactBitsBackground = dynamic(() => import('@/components/ReactBitsBackground'), { ssr: false });

export default function EventBackground({ preset, fullViewport = false }: { preset?: string | null; fullViewport?: boolean }) {
  const selected = normalizeBackgroundPreset(preset);
  const usesReactBits = ['aurora', 'prism', 'constellation', 'sparkles', 'rain', 'confetti'].includes(selected);
  const usesParticles = !usesReactBits && selected !== 'plain';

  return <div className={`event-background-layer event-background-${selected}${fullViewport ? ' event-background-full-viewport' : ''}`} aria-hidden="true">
    {usesReactBits && <ReactBitsBackground preset={selected} />}
    {usesParticles && <ParticleBackground preset={selected} />}
  </div>;
}
