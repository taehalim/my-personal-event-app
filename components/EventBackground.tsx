'use client';

import { useMemo } from 'react';
import Particles, { ParticlesProvider, useParticlesProvider } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { getBackgroundOptions, normalizeBackgroundPreset } from '@/lib/event-backgrounds';

async function loadParticles(engine: Parameters<typeof loadSlim>[0]) {
  await loadSlim(engine);
}

function ParticleCanvas({ id, options }: { id: string; options: ReturnType<typeof getBackgroundOptions> }) {
  const { loaded } = useParticlesProvider();
  return loaded ? <Particles id={id} options={options} /> : null;
}

export default function EventBackground({ preset }: { preset?: string | null }) {
  const selected = normalizeBackgroundPreset(preset);
  const options = useMemo(() => getBackgroundOptions(selected), [selected]);
  const usesParticles = !['plain', 'aurora', 'prism'].includes(selected);

  return <div className={`event-background-layer event-background-${selected}`} aria-hidden="true">
    {usesParticles && <ParticlesProvider init={loadParticles}><ParticleCanvas id={`event-background-${selected}`} options={options} /></ParticlesProvider>}
  </div>;
}
